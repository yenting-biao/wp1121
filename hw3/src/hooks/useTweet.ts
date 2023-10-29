import { useState } from "react";

import { useRouter } from "next/navigation";

export default function useTweet() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const postTweet = async ({
    handle,
    content,
    replyToTweetId,
    startAt,
    finishAt,
  }: {
    handle: string;
    content: string;
    replyToTweetId?: number;
    startAt?: Date | String;
    finishAt?: Date | String;
  }) => {
    setLoading(true);

    const res = await fetch("/api/tweets", {
      method: "POST",
      body: JSON.stringify({
        handle,
        content,
        replyToTweetId,
        startAt,
        finishAt,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    const responseJson = await res.json();
    console.log("useTweet: ", responseJson.body);

    // router.refresh() is a Next.js function that refreshes the page without
    // reloading the page. This is useful for when we want to update the UI
    // from server components.
    router.refresh();
    setLoading(false);

    return responseJson.body;
  };

  return {
    postTweet,
    loading,
  };
}
