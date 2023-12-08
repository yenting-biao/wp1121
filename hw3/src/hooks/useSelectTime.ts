import { useState } from "react";

import { useRouter } from "next/navigation";

export default function useSelectTime() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectActivityTime = async ({
    userHandle,
    tweetId,
    selectedTime,
  }: {
    userHandle: string;
    tweetId: number;
    selectedTime: string;
  }) => {
    if (loading) return;
    setLoading(true);

    const res = await fetch("/api/selectTimes", {
      method: "POST",
      body: JSON.stringify({
        tweetId,
        userHandle,
        selectedTime
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    router.refresh();
    setLoading(false);
  };

  const unSelectActivityTime = async ({
    userHandle,
    tweetId,
    selectedTime,
  }: {
    userHandle: string;
    tweetId: number;
    selectedTime: string | undefined;
  }) => {
    if (loading) return;

    setLoading(true);
    const res = await fetch("/api/selectTimes", {
      method: "DELETE",
      body: JSON.stringify({
        tweetId,
        userHandle,
        selectedTime
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error);
    }

    router.refresh();
    setLoading(false);
  };

  const deleteAllActivityTime = async ({
    userHandle,
    tweetId,
  }: {
    userHandle: string;
    tweetId: number;
  }) => {
    //if (loading) return;

    //setLoading(true);
    const res = await fetch("/api/deleteAllselectTimes", {
      method: "DELETE",
      body: JSON.stringify({
        userHandle,
        tweetId,        
      }),
    });

    if (!res.ok) {
      console.log("hook: ", res);
      const body = await res.json();
      //console.log("hook: ", body);
      throw new Error(body.error);
    }

    router.refresh();
    //setLoading(false);
  };

  return {
    selectActivityTime,
    unSelectActivityTime,
    deleteAllActivityTime,
    loading,
  };
}
