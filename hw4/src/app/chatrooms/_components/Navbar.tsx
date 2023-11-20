//"use client"
//import Image from "next/image"
//import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  /*PlusSquare,*/
  UserCircle2,
} from "lucide-react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { publicEnv } from "@/lib/env/public";

//import { Input } from "@/components/ui/input";
//import { useSearchParams } from 'next/navigation'
//import ChatPreview from "./ChatPreview";
import AddChatroomDialog from "./AddChatroomDialog";
import SearchBarAndChatroomsList from "./SearchBarAndChatroomsList";
import { getChatrooms } from "./action";

export default async function Navbar() {
  //const searchParams = useSearchParams();
  const session = await auth();
  if (!session || !session?.user?.username) {
    redirect(publicEnv.NEXT_PUBLIC_BASE_URL);
  }
  const username = session.user.username;
  const chatrooms = await getChatrooms(username);
  //console.log("chatrooms ",chatrooms);
  ///const username = searchParams.get('username');
  return (
    <nav className="my-2 flex h-full w-full flex-col gap-5 pb-1 pl-3 pr-3 pt-3">
      <div className="flex flex-row items-center gap-3">
        {/*<Image src="/messenger.png" alt="messenger icon" width={25} height={25} />*/}
        <h1 className="ml-1 text-2xl font-semibold">Chats</h1>
        <div className="ml-auto">
          {/*<Button className="hover:bg-slate-800 rounded-full mr-2" size="icon">
            <PlusSquare />
  </Button>*/}
          <AddChatroomDialog username={username} />
        </div>
      </div>
      <SearchBarAndChatroomsList
        username={username}
        initialChatrooms={chatrooms}
      />
      {/*<div>
        <Input
          type="search"
          placeholder="Search user..."
          className="rounded-full border-solid w-full border-white bg-gray-800"
        />
      </div>
      <div className="flex-grow gap-5 overflow-y-scroll">
        {chatrooms.map((chatroom, i) => {
          return (
            <Link
              className=""
              href={`/chatrooms/${chatroom.chatroomID}/?chattername=${username === chatroom.user1name ? chatroom.user2name : chatroom.user1name}`}
              key={i}
            >
              <ChatPreview
                key={i}
                username={username === chatroom.user1name ? chatroom.user2name : chatroom.user1name}
                lastMessage={chatroom.message ? chatroom.message : "New chatroom! Start chatting..."}
              />
            </Link>
          );
        })}
        
      </div>*/}
      <div className="mt-full flex flex-row items-center pl-1">
        <div className="flex-grow">
          <div className="flex flex-row items-center gap-1">
            <UserCircle2 />
            <span className="ml-1 text-xl font-bold">{username}</span>
          </div>
        </div>

        <Link href={`/auth/signout`}>
          <Button className="mr-2 rounded-full hover:bg-slate-800" size="icon">
            <LogOut />
          </Button>
        </Link>
        {/*<Link href={`/auth/signout`}>
          <Button
            variant={"ghost"}
            type={"submit"}
            className="hover:bg-slate-200"
          >
            Sign Out
          </Button>
        </Link>*/}
      </div>
    </nav>
  );
}

/*<div>Fake data</div>
        {Array.from({ length: 15 }).map((_, index) => (
          <Link
            className=""
            href={`/chatrooms/${index}`}
            key={index}
          >
            <ChatPreview
              key={index}
              username={`Person ${index}`}
              lastMessage="Hello! iam person hii jiii klklkl klkfldkf l;lf;sf jlk rererew rewtw dsgslk123ewewewrf fd rer "
            />
          </Link>
          
        ))}*/
