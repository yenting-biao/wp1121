"use client";

//import { sendMessages } from "./action";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  username: string;
  chatroomId: string;
};

export default function SendMessage({ username, chatroomId }: Props) {
  const inputRef = React.createRef<HTMLInputElement>();
  const [isLoading, setIsLoading] = useState(false);
  const [messageValue, setMessageValue] = useState("");

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, inputRef]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //const messageSend = inputRef.current?.value;
    const messageSend = messageValue;
    if (!messageSend) return;
    if (typeof messageSend !== "string") return;
    //console.log("messageSend:", messageSend);
    
    setIsLoading(true);
    const res = await fetch(`/api/chatrooms/${chatroomId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatroomId: chatroomId,
        sender: username,
        message: messageSend,
      }),
    });
    setIsLoading(false);

    if (!res.ok) {
      console.log(res);
      alert("Something went wrong, please try again later.");
      //setIsLoading(false);
      return;
    }

    setMessageValue("");

    
  };

  return (
    <div>
      <form className="flex" onSubmit={handleSubmit}>
        {/*action={async (e) => {
          "use server";
          const messageSend = e.get("message-content");
          if(!messageSend) return;
          if(typeof messageSend !== "string") return;
          /*const result =*/
        /*await sendMessages(username, chatroomId, messageSend);
          e.set("message-content", "");
          e.delete("message-content");

        }}*/}
        <Input
          className="rounded-full border-solid border-white bg-gray-950"
          placeholder="type something..."
          name="message-content"
          ref={inputRef}
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
        <Button
          type="submit"
          className="ml-2 rounded-full hover:bg-gray-500"
          disabled={isLoading}
        >
          SEND
        </Button>
      </form>
    </div>
  );
}
