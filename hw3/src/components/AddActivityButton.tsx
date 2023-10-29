"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PlusCircle } from "lucide-react";

type HeaderButtonProps = {
  // allow size, and strokeWidth to be string to match lucide-react's size prop
  // this is basically a interface so that we can pass in custom component if we need to
  
  text: string;
  active?: boolean;
};

export default function AddActivityButton({ text, active }: HeaderButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const username = searchParams.get("username");
  const handle = searchParams.get("handle");
  const openModal = searchParams.get("modal");


  const handleOnclick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("username", username!);
    params.set("handle", handle!);
    params.set("modal", "true");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
        <button 
          className="group w-full"
          onClick={handleOnclick}
        >
        <div
          // prefix a class with hover: to make it only apply when the element is hovered
          className="flex w-fit items-center gap-4 rounded-full p-2 transition-colors duration-300 group-hover:bg-gray-200 lg:pr-4"
        >
          <div className="grid h-[40px] w-[40px] place-items-center">
            <PlusCircle
              // now that we defined the interface for Icon, we can pass in the size and strokeWidth props safely
              size={26}
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
    </div>
    
  );
}