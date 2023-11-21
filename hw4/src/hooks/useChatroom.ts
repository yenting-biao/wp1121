import { useEffect } from "react";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

import { pusherClient } from "@/lib/pusher/client";

type PusherPayload = {
  senderUsername: string;
  message: {
    id: string;
    chatroomId: string;
    messageContent: string;
    messageSender: string;
  };
};

export const useChatroom = () => {
  let { chatroomId } = useParams();
  chatroomId = Array.isArray(chatroomId) ? chatroomId[0] : chatroomId;

  //const [message, setMessage] = useState<Message | null>(null);
  const router = useRouter();

  const { data: session } = useSession();
  const username = session?.user?.username;
  //console.log(username);

  /*useEffect(() => {
      const res = await fetch (`/api/chatrooms/${chatroomId}`, {
        method: "GET"
      })
    }, [router]);*/

  useEffect(() => {
    const channelName = `private-${chatroomId}`;
    const channel = pusherClient.subscribe(channelName);
    channel.bind(
      "chatroom:newMessage",
      ({ senderUsername, message }: PusherPayload) => {
        console.log("new message");
        console.log(senderUsername);
        console.log(message);
        //setMessage(message);
      },
    );
  }, [chatroomId, router, username]);

  return {
    chatroomId,
  };
};
