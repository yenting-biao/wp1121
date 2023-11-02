"use client";

import { useRef } from "react";

import UserAvatar from "@/components/UserAvatar";
import useTweet from "@/hooks/useTweet";
import useUserInfo from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

type ReplyInputProps = {
  replyToTweetId: number;
  replyToHandle: string;
};

export default function ReplyInput({
  replyToTweetId,
  //replyToHandle,
}: ReplyInputProps) {
  const { handle } = useUserInfo();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { postTweet, loading } = useTweet();

  const handleReply = async () => {
    const content = textareaRef.current?.value;
    if (!content) return;
    if (!handle) return;
    if (content.length > 200){
      alert("Your comment is too long!");
      return;
    }

    try {
      await postTweet({
        handle,
        content,
        replyToTweetId,
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
      alert("Error posting reply");
    }
  };

  const handleEnterKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // 阻止 Enter 换行
      handleReply(); // 调用回复处理函数
    }
  };

  return (
    // this allows us to focus (put the cursor in) the textarea when the user
    // clicks anywhere on the div
    <div onClick={() => textareaRef.current?.focus()}>
      <div className="flex flex-row gap-4 px-4 pt-4 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <UserAvatar className="col-start-1 row-start-2 h-12 w-12" />
        {/*<p className="col-start-2 row-start-1 text-gray-500">
          Replying to <span className="text-brand">@{replyToHandle}</span>
        </p>*/}
        <textarea
          ref={textareaRef}
          className="bg-transparent text-xl outline-none placeholder:text-gray-500 break-all w-full"
          placeholder="Leave some comments about the activity"
          onKeyDown={handleEnterKeyPress}
        />
      </div>
      <div className="p-4 text-end">
        <button
          className={cn(
            "my-2 rounded-full bg-brand px-4 py-2 text-white transition-colors hover:bg-brand/70",
            "disabled:cursor-not-allowed disabled:bg-brand/40 disabled:hover:bg-brand/40",
          )}
          onClick={handleReply}
          disabled={loading}
        >
          Reply
        </button>
      </div>
    </div>
  );
}
