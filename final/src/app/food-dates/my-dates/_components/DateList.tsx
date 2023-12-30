"use client";
import { useEffect, useState } from "react";
import DatePreview from "./DatePreview";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { datePreviewType } from "../layout";
import { pusherClient } from "@/lib/pusher/client";
import { useSession } from "next-auth/react";

type PusherPreviewPayload = {
  dateId: string;
  senderId: string;
  senderUsername: string;
  content: string;
};

export default function chatListPage(props: { dates: datePreviewType[] }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const pathname = usePathname();
  const router = useRouter();
  const { id } = useParams();
  const currDateId = Array.isArray(id) ? id[0] : id;
  const [dates, setDates] = useState<datePreviewType[]>(props.dates);
  const [selectedDateId, setSelectedDateId] = useState<string>("");

  useEffect(() => {
    if (pathname === "/chat") setSelectedDateId("");
    else setSelectedDateId(currDateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname]);

  useEffect(() => {
    setDates(props.dates);
  }, [props.dates]);

  useEffect(() => {
    const channelName = `private-${userId}`;
    try {
      const channel = pusherClient.subscribe(channelName);
      channel.bind(
        "chat:send",
        ({
          dateId,
          senderId,
          senderUsername,
          content,
        }: PusherPreviewPayload) => {
          if (senderId === userId) return;
          setDates((dates) =>
            dates.map((element) => {
              if (element.dateId !== dateId) return element;
              return {
                ...element,
                lastMessage: senderUsername + ": " + content,
              };
            })
          );
          router.refresh();
        }
      );
      return () => {
        channel.unbind("chat:send");
        pusherClient.unsubscribe(channelName);
      };
    } catch (error) {
      console.error("Failed to subscribe and bind to channel");
      console.error(error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-1/4 border-r-2 h-full overflow-y-scroll px-1 flex flex-col items-center">
      <h2 className="w-full text-center font-bold text-2xl py-3 bg-white">
        我的聚會
      </h2>
      <div className="flex flex-col w-full">
        {!dates.length && (
          <div className="text-center w-full text-gray-400">
            立即
            <Link className="underline" href="/food-dates/find-dates">
              找飯友
            </Link>
          </div>
        )}
        {dates.map((date) => (
          <DatePreview
            key={date.dateId}
            dateId={date.dateId}
            title={date.title}
            lastMessage={date.lastMessage}
            avatarUrls={date.avatarUrls}
            selected={date.dateId === selectedDateId}
          />
        ))}
      </div>
    </div>
  );
}
