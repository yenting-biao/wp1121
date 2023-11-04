"use client";

import { useRef } from "react";

import { useRouter, useSearchParams} from "next/navigation";


//import GrowingTextarea from "@/components/GrowingTextarea";
import UserAvatar from "@/components/UserAvatar";
import { Separator } from "@/components/ui/separator";
import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";
//import { start } from "repl";

function testDate(year: number, month: number, day: number): boolean{
  console.log("Date: " + year + " " + month + " " + day);
  if(year < 1000 || year > 3000 || month == 0 || month > 12) return false;
  
  const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  return day > 0 && day <= monthLength[month - 1];
}

function isDateValid(startDate: string, endDate: string): boolean {
  const dateFormatRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[01]) (0\d|1\d|2[0-3])$/;
  return (
    dateFormatRegex.test(startDate) && 
    dateFormatRegex.test(endDate) && 
    testDate(Number(startDate.substring(0, 4)), 
      Number(startDate.substring(5, 7)), 
      Number(startDate.substring(8, 10))) &&
    testDate(Number(endDate.substring(0, 4)), 
      Number(endDate.substring(5, 7)), 
      Number(endDate.substring(8, 10)))  
    );
}

function isDateDiffValid(startDate: string, endDate: string): boolean {
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);

  const timeDifference = date2.valueOf() - date1.valueOf();
  if(timeDifference <= 0){
    return false;
  }

  return (timeDifference <= 7 * 1000 * 60 * 60 * 24);
}

export default function TweetInput() {
  const { handle } = useUserInfo();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startdateareaRef = useRef<HTMLInputElement>(null);
  const enddateareaRef = useRef<HTMLInputElement>(null);
  const { postTweet, loading } = useTweet();

  const router = useRouter();
  const searchParams = useSearchParams();
  //const pathname = usePathname();
  
  const usernameparam = searchParams.get("username");
  const handleparam = searchParams.get("handle");

  const handleTweet = async () => {
    const content = textareaRef.current?.value;
    let startDate = startdateareaRef.current?.value;
    let endDate = enddateareaRef.current?.value;
    
    if (!handle) return;
    if(!startDate || !endDate || !content){
      alert("Please fill in all the fields!");
      return;
    } 
    if (content.length > 200){
      alert("The activity title is too long!");
      return;
    }

    if(!isDateValid(startDate, endDate)){
      alert("Please make sure the date and time format is correct (YYYY-MM-DD HH) and exists (You cannot enter a year that is too faraway from now).");
      return;
    }

    startDate = startDate + ":00:00";
    endDate = endDate + ":00:00";

    if(!isDateDiffValid(startDate, endDate)){
      alert("Please make sure that your input satisfy the followings: the period of the start time and the end time should be less than 7 days, and the start time should be earlier than the end time.");
      return;
    }

    const startDateFormat = new Date(startDate).toISOString();
    const endDateFormat = new Date(endDate).toISOString();
    console.log(startDateFormat);
    console.log(endDateFormat);

    let postResult;
    try {
      postResult = await postTweet({
        handle: handle,
        content: content,
        startAt: startDateFormat,
        finishAt: endDateFormat,
      });
      textareaRef.current.value = "";
      // this triggers the onInput event on the growing textarea
      // thus triggering the resize
      // for more info, see: https://developer.mozilla.org/en-US/docs/Web/API/Event
      textareaRef.current.dispatchEvent(
        new Event("input", { bubbles: true, composed: true }),
      );

      
    } catch (e) {
      console.error(e);
      alert("Error posting tweet");
    } finally {
      console.log("postResult", postResult);
      const params = new URLSearchParams(searchParams);
      params.set("username", usernameparam!);
      params.set("handle", handleparam!);
      params.set("keyword", "");
      params.set("modal", "false");

      router.push(`/tweet/${postResult}?${params.toString()}`);
    }
  };

  return (
    <div>
      <div className="flex gap-4" >{/*onClick={() => textareaRef.current?.focus()}*/}
        <div className="flex flex-col items-center gap-2">
          <UserAvatar className="h-12 w-12" />
          <button className="flex w-full items-center justify-center rounded-full border-[1px] border-gray-300 px-2 text-sm font-bold text-brand">
              {handle}
          </button>
        </div>
        
        <div className="flex w-full flex-col px-2">
         
          <div className="flex w-full flex-row">
            <div>
              <p>
                <label htmlFor="actvity-start-date" className="font-bold">From</label>
              </p>
              <input 
                id="actvity-start-date"
                placeholder="YYYY-MM-DD HH"
                className="bg-transparent outline-none"
                ref={startdateareaRef}
              />
            </div>
            <div>
              <p>
                <label htmlFor="actvity-end-date" className="font-bold">To</label>
              </p>
              <input 
                id="actvity-end-date"
                placeholder="YYYY-MM-DD HH"
                className="bg-transparent outline-none"
                ref={enddateareaRef}
              />
            </div>
          </div>
          <div className="mb-2 mt-6">
              <p>
                <label htmlFor="activity-title" className="font-bold">Activity Title</label>
              </p>
            <textarea
              id="activity-title"
              ref={textareaRef}
              className="bg-transparent outline-none w-full"
              placeholder="Activity Title"
            />
          </div>
          <Separator />
          <div className="flex justify-end">
            <button
              className={cn(
                "my-2 rounded-full bg-brand px-4 py-2 text-white transition-colors hover:bg-brand/70",
                "disabled:cursor-not-allowed disabled:bg-brand/40 disabled:hover:bg-brand/40",
              )}
              onClick={handleTweet}
              disabled={loading}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}
