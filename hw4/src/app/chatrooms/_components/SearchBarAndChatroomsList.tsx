"use client";

import {
  useState,
  useEffect
} from "react";

import Link from "next/link";

import { Input } from "@/components/ui/input";

import ChatPreview from "./ChatPreview";

import { pusherClient } from "@/lib/pusher/client";
import { useRouter } from "next/navigation";

type Props = {
  username: string;
  initialChatrooms: {
    user1name: string;
    user2name: string;
    chatroomID: string;
    message: string | null;
    messageID: string | number | null;
    pinnedMessage: string | null;
  }[];
};

type PusherPayloadDeleteChat = {
  senderUsername: string;
  message:{
    chatroomID: string;
  };  
};

type PusherPayloadNewChat = {
  senderUsername: string;
  message: {
    chatroomId: string;
    user1name: string;
    user2name: string;
  }
}

type PusherPayloadNewMessage = {
  senderUsername: string;
  message: {
    id: number | string;
    chatroomID: string;
    sender: string;
    message: string;
    validity: string;
  },
}

export default function SearchBarAndChatroomsList({
  username,
  initialChatrooms,
}: Props) {
  const [keyword, setKeyword] = useState("");
  const [chatrooms, setChatrooms] = useState(initialChatrooms);
  const router = useRouter();
  //const chatrooms = initialChatrooms;

  useEffect(() => {
    const channelName = `private-${username}`;
    const channel = pusherClient.subscribe(channelName);
    
    channel.bind("chatroom:deleteChatroom", ({ senderUsername, message }: PusherPayloadDeleteChat) => {
      //if(senderUsername === username){
      //  return;
      //}

      console.log("DELETE: ", senderUsername, message.chatroomID);
      //console.log("Old: ", chatrooms);
      // console.log("old:", messages);

      // delete chatrooms.chatroomID = message.chatroomId
      setChatrooms(chatrooms.filter((chatroom) => chatroom.chatroomID != message.chatroomID));

      //console.log("After", chatrooms);
      
      //router.refresh();
      router.push("/chatrooms/");
    });

    channel.bind("newChatroom", ({senderUsername, message}: PusherPayloadNewChat) => {
      console.log("newChatroom: ", senderUsername, message);

      // append this new chatroom to the chatrooms list
      const newChatroom = {
        user1name: message.user1name,
        user2name: message.user2name,
        chatroomID: message.chatroomId,
        message: null,
        messageID: null,
        pinnedMessage: null,
      };
      setChatrooms(prevChatrooms => [newChatroom, ...prevChatrooms]);
      router.refresh();
    });

    channel.bind("chatroom:newMessage", ({ senderUsername, message }: PusherPayloadNewMessage) => {
      console.log("newMessage [navbar]: ", senderUsername, message);

      // update the chatroom's last message
      setChatrooms(prevChatrooms => {
        const newChatrooms = [...prevChatrooms];
        const chatroomIndex = newChatrooms.findIndex((chatroom) => chatroom.chatroomID === message.chatroomID);
        if(chatroomIndex === -1){
          return newChatrooms;
        }
        newChatrooms[chatroomIndex].message = message.message;
        newChatrooms[chatroomIndex].messageID = message.id;
        return newChatrooms;
      });
    });

    //console.log("received?", messages);
    return () => {
      pusherClient.unbind_all();
      pusherClient.unsubscribe(channelName);
    }
  }, [router, username, chatrooms]);

  return (
    <>
      <div>
        <Input
          type="search"
          placeholder="Search user..."
          className="w-full rounded-full border-solid border-white bg-gray-800"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <div className="flex-grow gap-5 overflow-y-scroll">
        {chatrooms.map((chatroom, i) => {
          return (
            ((chatroom.user1name !== username &&
              chatroom.user1name.includes(keyword)) ||
              (chatroom.user2name !== username &&
                chatroom.user2name.includes(keyword)) ||
              keyword === "") && (
              <Link
                className=""
                href={`/chatrooms/${chatroom.chatroomID}`}
                key={i}
              >
                <ChatPreview
                  key={i}
                  username={
                    username === chatroom.user1name
                      ? chatroom.user2name
                      : chatroom.user1name
                  }
                  lastMessage={
                    chatroom.message
                      ? chatroom.message
                      : "New chatroom! Start chatting..."
                  }
                />
              </Link>
            )
          );
        })}

        {keyword !== "" && (
          <>
            <hr className="mb-2 mt-2 border-gray-200" />
            <p className="pl-2 pr-5 text-justify">
              User not found? <br /> Try to add a new chatroom with him/her!
            </p>
          </>
        )}
      </div>
    </>
  );
}
