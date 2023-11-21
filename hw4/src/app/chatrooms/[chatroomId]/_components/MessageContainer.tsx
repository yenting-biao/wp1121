"use client";

import { useState } from "react";
import Linkify from "react-linkify";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/shadcn";

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

type MessageProps = {
  isMyOwn: boolean;
  message: string;
  messageId: string;
  chatroomId: string;
  username: string;
  validity: string;
};

export default function MessageContainer({
  isMyOwn,
  message,
  messageId,
  chatroomId,
  username,
  validity,
}: MessageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  //console.log("validity: " + validity);
  const seenable =
    validity === "valid" || (validity === "senderInvalid" && !isMyOwn);

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!seenable) return;
    // Handle right click event here
    setModalOpen(true);
  };
  return (
    <div
      className={`mb-2 flex flex-row justify-start gap-2 ${
        isMyOwn ? "justify-end" : "justify-start"
      }`}
    >
      {/*<div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-gray-500">
        <div className="text-white">
          Other
        </div>
  </div>*/}
      <div
        className={cn(
          `flex flex-col items-end justify-center break-all rounded-xl px-2 py-1 text-white
        ${
          isMyOwn
            ? "rounded-br-none bg-blue-600 hover:bg-blue-500"
            : "rounded-bl-none bg-gray-500 hover:bg-gray-400"
        } max-w-md 
        ${modalOpen ? "z-10 backdrop-blur-none" : ""}`,
          `${
            !seenable
              ? "border-2 border-solid border-gray-500 bg-black text-gray-400 hover:bg-black"
              : ""
          }`,
        )}
        onContextMenu={handleRightClick}
      >
        <p className="break-all">
          {validity === "valid" ? (
            <Urlify message={message} />
          ) : validity === "invalid" ? (
            "The message has been unsent for everyone"
          ) : seenable ? (
            <Urlify message={message} />
          ) : (
            "The message has been unsent for you"
          )}
        </p>
      </div>
      {modalOpen && (
        <MessageDialog
          onClose={() => setModalOpen(false)}
          messageId={messageId}
          chatroomId={chatroomId}
          username={username}
          isMyOwn={isMyOwn}
        />
      )}
    </div>
  );
}

type MessageDialogProps = {
  onClose: () => void;
  messageId: string;
  chatroomId: string;
  username: string;
  isMyOwn: boolean;
};

function MessageDialog({
  onClose,
  messageId,
  chatroomId,
  username,
  isMyOwn,
}: MessageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnsend = async (type: string) => {
    //console.log(type);
    if (type !== "senderInvalid" && type !== "invalid") {
      return;
    }

    setIsLoading(true);

    const res = await fetch(`/api/chatrooms/${chatroomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: messageId,
        chatroomId: chatroomId,
        sender: username,
        validity: type,
      }),
    });

    setIsLoading(false);

    if (!res.ok) {
      console.log(res);
      onClose();
      return;
    }

    onClose();
  };

  const handlePin = async () => {
    setIsLoading(true);

    const res = await fetch(`/api/chatroomInfo/${chatroomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatroomId: chatroomId,
        pinnedMessageId: messageId,
      }),
    });

    setIsLoading(false);

    if (!res.ok) {
      console.log(res);
      onClose();
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="backdrop-brightness-sm absolute inset-0 backdrop-blur-xs"
        onClick={onClose}
      ></div>
      <div className="relative z-10 flex flex-col gap-2 rounded bg-white p-6 text-black shadow-lg">
        <span
          onClick={onClose}
          className="absolute right-2 top-1 inline-block cursor-pointer"
        >
          &#10006;
        </span>
        <Button
          className="rounded-full font-semibold hover:bg-slate-200"
          onClick={() => handlePin()}
          disabled={isLoading}
        >
          Pin this message
        </Button>
        {isMyOwn && (
          <div className="flex flex-col gap-2">
            <hr className="mb-2 mt-2 border-gray-800" />
            <Button
              className="rounded-full font-semibold hover:bg-slate-200"
              onClick={() => handleUnsend("senderInvalid")}
              disabled={isLoading}
            >
              Unsend for you
            </Button>
            <Button
              className="rounded-full font-semibold hover:bg-slate-200"
              onClick={() => handleUnsend("invalid")}
              disabled={isLoading}
            >
              Unsend for everyone
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
