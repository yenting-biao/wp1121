// TODO: 4. Call the signOut() function when the button is clicked
// hint: You may want to change the first line of this file
"use client"
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

import { publicEnv } from "@/lib/env/public";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  return <Button 
    variant={"outline"} 
    onClick={() => {
      signOut({ callbackUrl: publicEnv.NEXT_PUBLIC_BASE_URL });
      router.push("/");
    }}
    data-testid="sign-out-button"
  >Sign Out</Button>;
}
// TODO: 4. end
