import { Button } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home () {
  const session = await auth();
  if(session?.user?.email) {
    redirect("/restaurants");
  }
  return (
    <>
      <div className="relative flex flex-col p-5 gap-0 text-xl z-10 animate-slide-up">
        <div className="self-start flex items-end gap-3 mt-32 md:text-6xl sm:text-5xl xs:text-4xl p-5">
          <Image
            src="/map-and-location.png"
            alt="Food Date"
            height={100}
            width={100}            
          />
          找到附近的朋友，一起吃飯吧！
        </div>     
        <div className="self-start text-lg p-5 pt-1 w-4/6">
        找不到人一起吃飯嗎？那你來對地方了！FOOD DATE 是一款食物社交平台，你可以在這裡找到附近的朋友，探索新的餐廳。你可以在這裡發起或加入一個食物聚會，吃完飯後，別忘了留下你的評論。覺得這間餐廳不錯嗎？那就加入你的收藏清單吧！FOOD DATE 還有許多其他功能，快來發掘吧！
        </div>   
        <Link href="/login">
          <Button
            className="rounded-3xl bg-blue-500 text-white text-xl hover:bg-blue-600 active:bg-blue-500 w-fit ml-4 px-7 py-3"
          >
            註冊 / 登入
          </Button>
        </Link>
      </div>
      <div className="fixed right-[-35vw] bottom-[-35vw] w-[75vw] h-[75vw] rounded-full bg-blue-400 z-0 animate-slide-up" />
    </>
  );
}