"use client"

import TweetInput from "./TweetInput"

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

// all components is src/components/ui are lifted from shadcn/ui
// this is a good set of components built on top of tailwindcss
// see how to use it here: https://ui.shadcn.com/
//import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  //DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
//import { Input } from "@/components/ui/input";
//import { Label } from "@/components/ui/label";
import { validateHandle, validateUsername } from "@/lib/utils";

export default function AddActivityModal() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  //const usernameInputRef = useRef<HTMLInputElement>(null);
  //const handleInputRef = useRef<HTMLInputElement>(null);
  //const [usernameError, setUsernameError] = useState(false);
  //const [handleError, setHandleError] = useState(false);

  
  const usernameparam = searchParams.get("username");
  const handleparam = searchParams.get("handle");
  let keywordparam = searchParams.get("keyword");
  if(!keywordparam) keywordparam = "";
  console.log(keywordparam);
  //const openModalparam = searchParams.get("modal");


  useEffect(() => {
    const username = searchParams.get("username");
    const handle = searchParams.get("handle");
    const modalOpen = searchParams.get("modal");
    console.log("test", modalOpen);
    // if any of the username or handle is not valid, open the dialog
    setDialogOpen(validateUsername(username) && validateHandle(handle) && modalOpen==="true");
  }, [searchParams]);

  /*const handleSave = () => {
    const username = usernameInputRef.current?.value;
    const handle = handleInputRef.current?.value;

    const newUsernameError = !validateUsername(username);
    setUsernameError(newUsernameError);
    const newHandleError = !validateHandle(handle);
    setHandleError(newHandleError);

    if (newUsernameError || newHandleError) {
      return false;
    }

    // when navigating to the same page with different query params, we need to
    // preserve the pathname, so we need to manually construct the url
    // we can use the URLSearchParams api to construct the query string
    // We have to pass in the current query params so that we can preserve the
    // other query params. We can't set new query params directly because the
    // searchParams object returned by useSearchParams is read-only.
    const params = new URLSearchParams(searchParams);
    params.set("username", username!);
    params.set("handle", handle!);
    router.push(`${pathname}?${params.toString()}`);
    setDialogOpen(false);

    return true;
  };*/

  // The Dialog component calls onOpenChange when the dialog wants to open or
  // close itself. We can perform some checks here to prevent the dialog from
  // closing if the input is invalid.
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDialogOpen(true);
    } else {
      const params = new URLSearchParams(searchParams);
      params.set("username", usernameparam!);
      params.set("handle", handleparam!);
      params.set("keyword", "");
      params.set("modal", "false");
      router.push(`${pathname}?${params.toString()}`);
      
      //setDialogOpen(false);
    }
  };

  

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        {/*onOpenChange={handleOpenChange}*/}
      <DialogContent className="w-[70%] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a new activity</DialogTitle>
          <DialogDescription>
            Write down all the information needed to add a new activity for people to join.
          </DialogDescription>
        </DialogHeader>
        <TweetInput />
      </DialogContent>
    </Dialog>
  );
}
