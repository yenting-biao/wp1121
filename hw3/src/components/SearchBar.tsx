"use client"

import {
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";


import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

type searchBarProps = {
  className: string;
};

export default function SearchBar({className}: searchBarProps){
  const searchInputRef = useRef<HTMLInputElement>(null);

  //const { searchTweets, loading } = useTweet();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const usernameparam = searchParams.get("username");
  const handleparam = searchParams.get("handle");
  const keywordparam = searchParams.get("keyword");

  useEffect(() => {
    const username = searchParams.get("username");
    const handle = searchParams.get("handle");
    const keyword = searchParams.get("keyword");
    searchInputRef.current!.value = keyword ? keyword : "";
  }, [searchParams]);

  const handleSearch = async () => {
    const keyword = searchInputRef.current?.value;
    

    const params = new URLSearchParams(searchParams);
    params.set("username", usernameparam!);
    params.set("handle", handleparam!);
    params.set("keyword", keyword ? keyword: "");
    router.push(`${pathname}?${params.toString()}`);

    /*try {
      const result = await searchTweets({
        keyword,
      });
      console.log(result);
    } catch (e) {
      console.error(e);
      alert("Error handling search");
    }*/

    
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Input 
        className="w-full h-10"
        placeholder="Search for activities..."
        ref={searchInputRef}
      />
  
      <HeaderButton 
        Icon={Search} 
        text="Search" 
        onClick={handleSearch}
      />
      
    </div>
  )
}

type HeaderButtonProps = {
  // allow size, and strokeWidth to be string to match lucide-react's size prop
  // this is basically a interface so that we can pass in custom component if we need to
  Icon: React.ComponentType<{
    size?: number | string;
    strokeWidth?: number | string;
  }>;
  text: string;
  active?: boolean;
  onClick: () => void;
};

function HeaderButton({ Icon, text, active, onClick }: HeaderButtonProps) {
  return (
    <button className="group w-full" onClick={onClick}>
      <div
        // prefix a class with hover: to make it only apply when the element is hovered
        className="flex w-fit items-center gap-2 rounded-full p-2 transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4 ml-1"
      >
        <div className="grid h-[30px] w-[30px] place-items-center">
          <Icon
            // now that we defined the interface for Icon, we can pass in the size and strokeWidth props safely
            size={23}
            strokeWidth={active ? 3 : 2}
          />
        </div>
        <span
          // the `cn` helper function basically concatenate your tailwind classes in a safe way
          // on the surface, it will remove any falsy values from the array, it also remove any redundant classes
          // this is useful for conditional classes
          // prefixing a class with max-lg: makes it only apply to screen size below lg, this is the tailwind way of media queries
          // likewise, prefixing a class with lg: makes it only apply to screen size above lg
          // read more about tailwind responsive design here: https://tailwindcss.com/docs/responsive-design
          className={cn("text-xl max-lg:hidden", active && "font-bold")}
        >
          {text}
        </span>
      </div>
    </button>
  );
}

