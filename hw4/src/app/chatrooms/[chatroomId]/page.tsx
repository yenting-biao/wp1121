//"use client";
//import { useEffect, useRef } from "react";
//import { useChatroom } from "@/hooks/useChatroom";
//import Message from "./_components/MessageContainer";
//import { Info, User2 } from "lucide-react";
import { auth } from "@/lib/auth";

import ChatMessages from "./_components/ChatMessages";
//import { Button } from "@/components/ui/button";
import Header from "./_components/Header";
import SendMessage from "./_components/SendMessage";
import {
  getMessages,
  getPinnedMessage,
  getChatroomInfo,
} from "./_components/action";

type Props = {
  params: { chatroomId: string };
  /*searchParams: {
    // this came from the query string: ?chattername=madmaxieee
    chattername?: string;
  };*/
};

export default async function ChatroomPage({
  params: { chatroomId },
} //searchParams: { chattername },
: Props) {
  //console.log("params: " + chatroomId);

  const session = await auth();
  if (!session?.user?.username) return null;
  const username = session.user.username;

  const messages = await getMessages(chatroomId);

  const [pinnedMessage] = await getPinnedMessage(chatroomId);

  const chatroomInfo = await getChatroomInfo(chatroomId);
  const chattername =
    chatroomInfo.user1name === username
      ? chatroomInfo.user2name
      : chatroomInfo.user1name;

  //console.log(pinnedMessage);

  //console.log("-------messages-------\n");
  //console.log(messages);

  //const { title, setTitle, content, setContent } = useDocument();
  /*const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);*/

  return (
    <div className="flex h-full w-full flex-col gap-5 py-2 ">
      <Header chattername={chattername} chatroomId={chatroomId} />
      <ChatMessages
        chatroomId={chatroomId}
        chattername={chattername!}
        initialMessages={messages}
        username={username}
        initialPinnedMessage={
          pinnedMessage ? pinnedMessage.pinnedMessage : null
        }
      />
      {/*<div className="flex-grow gap-5 pr-4 overflow-y-scroll">
        
        
        {/*messages.map((message, i) => (
          <div key={i}>
            <Message isMyOwn={message.sender === chattername ? false : true} message={message.message}/>
          </div>
        ))*/
      /*}
        <ChatMessages chatroomId={chatroomId} chattername={chattername!} initialMessages={messages}/>
        {/*<div ref={messagesEndRef} />*/
      /*}
      </div>*/}
      <SendMessage username={username} chatroomId={chatroomId} />
    </div>
  );
}

{
  /*<Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={false} message="Hi" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={false} message="Hi" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={false} message="Hi" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={false} message="Hi" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={false} message="Hi" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={false} message="Helloffffffffffffffffffffffffffffffffffffsdffffffffffffffffffffffffffffffffffffffsdvdgdfgfdgfdgfdgdfgfdbdfbdfbfffffsfdsvtrtrtrtergfd我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={true} message="Hello" />
        <Message isMyOwn={true} message="Helloffffffffffffffffffffffffffffffffffffsdffffffffffffffffffffffffffffffffffffffsdvdgdfgfdgfdgfdgdfgfdbdfbdfbfffffsfdsvtrtrtrtergfd我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我我" />
        <Message isMyOwn={false} message="Hi" />
  <div>Fake messages end</div>*/
}
