"use client";

import { useRouter } from "next/navigation";

import UserAvatar from "@/components/UserAvatar";
import useUserInfo from "@/hooks/useUserInfo";

import { cn } from "@/lib/utils";

export default function ProfileButton() {
  const { username, handle } = useUserInfo();
  const router = useRouter();

  return (
    <div className="flex items-center align-center mr-5">
      <button
        className={cn("flex items-center gap-2 rounded-full p-3 text-center transition-colors duration-300 hover:bg-gray-200 w-36 h-10", "text-center")}
        // go to home page without any query params to allow the user to change their username and handle
        // see src/components/NameDialog.tsx for more details
        onClick={() => router.push("/")}
      >
          Change user
        {/*<MoreHorizontal size={24} className="max-lg:hidden" />*/}
      </button>
      <div className="flex items-center gap-2 rounded-full p-3 text-start ">
        <UserAvatar />
        <div className="w-28 max-lg:hidden">
          <p className="text-sm font-bold">{username ?? "..."}</p>
          <p className="text-sm text-gray-500">{`@${handle}`}</p>
        </div>
      </div>
    </div>
  );
}
