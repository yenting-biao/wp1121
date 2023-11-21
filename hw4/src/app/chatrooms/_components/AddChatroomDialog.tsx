"use client";

import { useState } from "react";

//import { createChatroom } from "./action";
//import { revalidatePath } from "next/cache";
import {
  /*redirect,*/
  useRouter,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { publicEnv } from "@/lib/env/public";

type Props = {
  username: string;
};

export default function AddChatroomDialog({ username }: Props) {
  const router = useRouter();
  //const searchParams = useSearchParams();
  //const oldChattername = searchParams.get('username');

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newChatter, setNewChatter] = useState("");

  const handleSubmit = async () => {
    //"use server";
    //const chatterUsername = e.get("chattername");
    const chatterUsername = newChatter;

    //console.log("username: ", username, "chattername: ", chatterUsername);

    if (!chatterUsername) return;
    if (typeof chatterUsername !== "string") return;

    setIsLoading(true);
    const res = await fetch(`/api/chatroomInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user1name: username,
        user2name: chatterUsername,
      }),
    });

    //console.log("add chatroom res: ", res);

    /*.then(res => res.json())
      .then(data => {
        console.log('Success:', data);
        const newChatroomId = data.chatroomId;
        
        if(newChatroomId){
          router.push(`${publicEnv.NEXT_PUBLIC_BASE_URL}/chatrooms/${newChatroomId}/?chattername=${chatterUsername}`);                  
        }
        setIsOpen(false);
      })
      .catch((error) => {
        console.log(error);
        alert("The user you are trying to chat with does not exist, or you have already been chatting with this user.");
      });*/

    if (res.ok) {
      const body = await res.json();

      //console.log("add response:", body);

      const newChatroomId = body.chatroomId;

      if (newChatroomId) {
        router.push(
          `${publicEnv.NEXT_PUBLIC_BASE_URL}/chatrooms/${newChatroomId}`,
        );
      }
      setIsOpen(false);
      setIsLoading(false);
      setNewChatter("");
      router.refresh();
    } else {
      //chatterUsername = oldChattername ? oldChattername : "";
      console.log("add chatroom error");
      if (res.status == 404){
        alert(
          "The user you are trying to chat with does not exist. Please try again."
        );
      } else {
        alert("You have already been chatting with this user.");
        setIsOpen(false);
        setNewChatter("");
      }
      

      router.push(`${publicEnv.NEXT_PUBLIC_BASE_URL}/chatrooms`);

      setIsLoading(false);
      //setNewChatter("");
      //router.refresh();
      return;
    }

    /*const newChatroomID = await createChatroom(username, chatterUsername);
    if(!newChatroomID){
      console.log("NOT found");
      //alert("The user you are trying to chat with does not exist.");
      return; // TODO: fix invalid operation
    }
    revalidatePath("/chatrooms");
    redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/chatrooms/${newChatroomID}/?chattername=${chatterUsername}`);*/
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mr-2 rounded-full hover:bg-slate-800" size="icon">
          ADD
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950">
        <DialogHeader>
          <DialogTitle>Add chatroom</DialogTitle>
          <DialogDescription>Start chatting with other user.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-row gap-4"
          //onSubmit={handleSubmit}
        >
          <Input
            placeholder="Search username"
            name="chattername"
            value={newChatter}
            onChange={(e) => setNewChatter(e.target.value)}
          />
          <Button
            type="submit"
            className="rounded-3xl hover:bg-gray-500"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
