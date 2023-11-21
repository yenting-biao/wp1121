"use client";

import { useRef, useEffect, useState } from "react";
import Linkify from "react-linkify";

import { useRouter } from "next/navigation";

import { Pin } from "lucide-react";

import { pusherClient } from "@/lib/pusher/client";
import type { Message, MessageWithValidity } from "@/lib/types/db";

//import { getMessages } from "./action";
import MessageContainer from "./MessageContainer";

type UrifyProps = {
  message: string;
};

function Urlify({ message }: UrifyProps) {
  return (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <a
          target="blank"
          href={decoratedHref}
          key={key}
          className="hover:underline"
        >
          {decoratedText}
        </a>
      )}
    >
      {message}
    </Linkify>
  );
}

type Props = {
  chatroomId: string;
  chattername: string;
  initialMessages: Message[];
  username: string;
  initialPinnedMessage: string | null;
};

type PusherPayloadNew = {
  senderUsername: string;
  message: Message;
};

type PusherPayloadUnsent = {
  senderUsername: string;
  message: MessageWithValidity;
};

type PusherPayloadPin = {
  senderUsername: string;
  message: {
    chatroomId: string;
    pinnedMessageId: string | number;
    pinnedMessageContent: string;
  };
};

export default function ChatMessages({
  chatroomId,
  chattername,
  initialMessages,
  username,
  initialPinnedMessage,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [messages, setMessages] = useState(initialMessages);
  const [pinnedMessage, setPinnedMessage] = useState(initialPinnedMessage);
  

  console.log(chattername);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    const channelName = `private-${chatroomId}`;
    const channel = pusherClient.subscribe(channelName);
    
    

    channel.bind(
      "chatroom:newMessage",
      ({ senderUsername, message }: PusherPayloadNew) => {
        //if(senderUsername === username){
        //  return;
        //}
        console.log("new: ", senderUsername, message);
        //console.log("old:", messages);
        // message is the new message received
        setMessages((prevMessages) => [...prevMessages, message]);
        messagesEndRef.current?.scrollIntoView();

        router.refresh();
      },
    );

    channel.bind(
      "chatroom:unsentMessage",
      ({ senderUsername, message }: PusherPayloadUnsent) => {
        console.log("unsentMessage: ", senderUsername, message);
        // 找到 message.id 的該則訊息，並更新他的 validity
        setMessages((prevMessages) => {
          // Find the message
          const foundMessage = prevMessages.find(
            (msg) => String(msg.id) === String(message.id),
          );

          // If found, update its validity
          if (foundMessage) {
            foundMessage.validity = message.validity;
            //console.log("found!");
          } else {
            //console.log("not found!");
            //console.log("desireID = ", message.id);
          }

          // Return the updated messages array
          return [...prevMessages];
        });
        router.refresh();
      },
    );

    channel.bind(
      "chatroom:pinnedMessage",
      ({ senderUsername, message }: PusherPayloadPin) => {
        console.log("pin", senderUsername);
        setPinnedMessage(message.pinnedMessageContent);
        router.refresh();
      },
    );

    //console.log("received?", messages);
    return () => {
      channel.unbind_all(); //TODO: new
      pusherClient.unsubscribe(channelName);
    };
  }, [chatroomId, router, messages]);

  return (
    <div className="relative flex-grow gap-1 overflow-y-scroll pr-4">
      {pinnedMessage && (
        <div className="max-auto z-5 sticky top-1 mb-5 flex w-full gap-2 rounded-full border-2 border-white bg-slate-700 py-1 pl-2">
          <Pin className="scale-75" />
          <div>
            <Urlify message={pinnedMessage} />
          </div>
        </div>
      )}
      {messages.map((message, i) => (
        <div key={i}>
          <MessageContainer
            isMyOwn={
              message.sender === username
                ? true
                : false /*message.sender === chattername ? false : true*/
            }
            message={message.message}
            messageId={message.id}
            chatroomId={chatroomId}
            username={username}
            validity={message.validity}
          />
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
