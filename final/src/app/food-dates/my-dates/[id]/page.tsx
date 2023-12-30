"use client";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  Marker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import MessageContainer from "./_components/MessageContainer";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Message } from "@/lib/types/db";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { pusherClient } from "@/lib/pusher/client";
import { Info } from "lucide-react";
import { off } from "process";
import { Dialog } from "@mui/material";

type PusherMessagePayload = {
  messageId: string;
  senderId: string;
  senderUsername: string;
  content: string;
};

type selectedRestaurantType = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export default function Chat() {
  const { data: session } = useSession();
  const username = session?.user?.username;
  const userId = session?.user?.id;
  const router = useRouter();
  const { id } = useParams();
  const dateId = Array.isArray(id) ? id[0] : id;
  const [loading, setLoading] = useState<boolean>(false);
  const [inserting, setInserting] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("Loading chat...");
  const [avatarUrls, setAvatarUrls] = useState<
    { userId: string; username: string; avatarUrl: string | null }[]
  >([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [position, setPosition] = useState({
    lat: 25.01834354450372,
    lng: 121.53977457666448,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dummyElementForScrolling = useRef<HTMLDivElement>(null);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState<
    selectedRestaurantType[]
  >([]);

  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const chineseNumbers = ["一", "二", "三", "四"];

  // initial fetching
  useEffect(() => {
    if (!username) return;
    if (id && !regex.test(dateId)) {
      router.push("/food-dates/my-dates");
      return;
    }
    const fetchMessages = async () => {
      setLoading(true);
      const res = await fetch(`/api/date/chat/${dateId}`);
      if (res.status === 404 || !res.ok) {
        router.push("/food-dates/my-dates");
        return;
      }
      const res2 = await fetch(`/api/date/suggestion/${dateId}`);
      const data: {
        participantUsernames: (string | null)[];
        avatarUrls: {
          userId: string;
          username: string;
          avatarUrl: string | null;
        }[];
        messages: Message[];
      } = await res.json();
      const data2: { suggestedRestaurants: selectedRestaurantType[] } =
        await res2.json();
      setSuggestedRestaurants(data2.suggestedRestaurants);
      const participantCount = data.participantUsernames.length;
      let userList = "";
      for (let i = 0; i < participantCount - 1; i++)
        userList += (data.participantUsernames[i] ?? "[已刪除]") + ", ";
      userList += data.participantUsernames[participantCount - 1];
      setTitle(chineseNumbers[participantCount - 1] + "人團：" + userList);
      setAvatarUrls(data.avatarUrls);
      setMessages(data.messages);
      setLoading(false);
    };
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, dateId]);
  const redMarkerIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  };

  useEffect(() => {
    if (!username || !regex.test(dateId)) return;
    const channelName = `private-${dateId}`;
    try {
      const channel = pusherClient.subscribe(channelName);

      channel.bind(
        "suggestion",
        ({
          placeId,
          name,
          address,
          lat,
          lng,
          add,
        }: selectedRestaurantType & { add: boolean }) => {
          if (add) {
            setSuggestedRestaurants((old) => [
              {
                placeId,
                name,
                address,
                lat,
                lng,
              },
              ...old,
            ]);
            router.refresh();
          } else {
            setSuggestedRestaurants((old) =>
              old.filter((element) => element.placeId !== placeId)
            );
            router.refresh();
          }
        }
      );
      channel.bind(
        "chat:send",
        ({
          messageId,
          senderId,
          senderUsername,
          content,
        }: PusherMessagePayload) => {
          if (senderId === userId) return;
          dummyElementForScrolling.current?.scrollIntoView({
            behavior: "smooth",
          });
          setMessages((messages) => [
            {
              messageId,
              senderUsername,
              content,
            },
            ...messages,
          ]);
          router.refresh();
        }
      );
      return () => {
        channel.unbind("chat:send");
        channel.unbind("suggestion");
        pusherClient.unsubscribe(channelName);
      };
    } catch (error) {
      console.error("Failed to subscribe and bind to channel");
      console.error(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, dateId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = inputRef.current!.value;
    inputRef.current!.value = "";
    if (!content) return;
    dummyElementForScrolling.current?.scrollIntoView({ behavior: "smooth" });
    const res = await fetch(`/api/date/chat/${dateId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    });
    if (!res.ok) return;
    const body: { messageId: string } = await res.json();
    setMessages((messages) => [
      {
        messageId: body.messageId,
        senderUsername: username!,
        content,
      },
      ...messages,
    ]);
    router.refresh();
  }

  const handleMapClick = async (event: any) => {
    const placeId = event.detail.placeId;
    if (!placeId) return;
    document.body.style.cursor = "progress";
    setInserting(true);

    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,formattedAddress,types&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      const addr: string = data.formattedAddress;
      const name: string = data.displayName.text;

      if (
        addr.includes("大安區") ||
        addr.includes("大安区") ||
        addr.includes("中正區") ||
        addr.includes("中正区")
      ) {
        if (data.types.includes("restaurant")) {
          setPosition({
            lat: event.detail.latLng.lat,
            lng: event.detail.latLng.lng,
          });
          const exists = suggestedRestaurants.find(
            (element) => element.placeId === placeId
          );
          if (!exists) {
            // add to list
            await fetch(`/api/date/suggestion/${dateId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                placeId,
                name,
                address: addr,
                lat: event.detail.latLng.lat,
                lng: event.detail.latLng.lng,
                types: data.types,
              }),
            });
            setSuggestedRestaurants((old) => [
              {
                placeId,
                name,
                address: addr,
                lat: event.detail.latLng.lat,
                lng: event.detail.latLng.lng,
              },
              ...old,
            ]);
          } else {
            await fetch(`/api/date/suggestion/${dateId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                placeId,
                name,
                address: addr,
                lat: event.detail.latLng.lat,
                lng: event.detail.latLng.lng,
              }),
            });
            setSuggestedRestaurants((old) =>
              old.filter((element) => element.placeId !== placeId)
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    } finally {
      document.body.style.cursor = "default";
      setInserting(false);
    }
  };

  if (!username || !userId) return;

  return (
    <>
      {loading && (
        <div className="h-full w-3/4 flex justify-center items-center">
          <p className="text-xl text-gray-400">Loading...</p>
        </div>
      )}
      {!loading && (
        <div className="flex w-3/4 h-full">
          <div className="h-full w-2/3 flex-col overflow-y-scroll flex">
            <div className="flex flex-row gap-2 border-b-2 w-full py-3 px-3 overflow-hidden items-center">
              <AvatarGroup spacing="small">
                {avatarUrls.map((element, index) => (
                  <Avatar
                    alt={element.username ?? ""}
                    key={index}
                    src={element.avatarUrl ?? ""}
                  >
                    {element.username.charAt(0) ?? ""}
                  </Avatar>
                ))}
              </AvatarGroup>
              <p className="text-lg w-full whitespace-nowrap text-ellipsis overflow-hidden">
                {title}
              </p>
            </div>
            <div className="px-3 flex flex-col-reverse justify-start gap-2 h-full overflow-y-scroll">
              <div
                style={{ float: "left", clear: "both" }}
                ref={dummyElementForScrolling}
              ></div>
              {messages.map((m, index) => (
                <MessageContainer
                  key={m.messageId}
                  username={username}
                  senderUsername={m.senderUsername}
                  content={m.content}
                  avatarUrls={avatarUrls}
                />
              ))}
            </div>
            <form className="my-5 px-3" onSubmit={handleSubmit}>
              <input
                className="h-10 w-full rounded-full border-none bg-gray-100 p-5 outline-none focus:outline-none"
                placeholder="Aa"
                name="content"
                ref={inputRef}
              />
            </form>
          </div>
          <div className="h-full w-1/3 flex flex-col">
            <div className="w-full h-[100px] flex justify-center">
              <div className="h-full w-3/4 flex flex-row gap-2 items-center justify-center">
                <Info size={50} />
                <div className="w-full">
                  點選餐廳將會把餐廳加入清單或從清單刪除<br></br>
                  紅色標記代表此餐廳在清單中
                </div>
              </div>
            </div>
            <div className="h-full flex-grow">
              <APIProvider
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              >
                <Map
                  center={position}
                  zoom={15}
                  mapId={process.env.NEXT_PUBLIC_MAP_ID}
                  class="h-full"
                  onClick={handleMapClick}
                >
                  {suggestedRestaurants.map((element, index) => {
                    return (
                      <Marker
                        key={index}
                        position={{ lat: element.lat, lng: element.lng }}
                        icon={redMarkerIcon}
                      />
                    );
                  })}
                </Map>
              </APIProvider>
            </div>
          </div>
        </div>
      )}
      <Dialog open={inserting}>
        <div className="p-5 flex flex-col justify-center items-center">
          <div className="mx-5 my-2 loading-spinner h-[30px] w-[30px]"></div>
          <div>載入中...</div>
        </div>
      </Dialog>
    </>
  );
}
