import React from "react";
import { Divider } from "@mui/material";
import { redirect } from "next/navigation";

import ProfileHeader from "./_components/ProfileHeader";
import { publicEnv } from "@/lib/env/public";
import { auth } from "@/lib/auth";
import ProfileContent from "./_components/ProfileContent";
import CoinExchange from "./_components/CoinExchange";


export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/login`);
  }

  const username = session?.user?.username;
  const userId = session?.user?.id;
  const email = session?.user?.email;
  const bio = session?.user?.bio;
  const coinsLeft = session?.user?.coins;
  const avatarUrl = session?.user?.avatarUrl;
  
  const width = "w-7/12";
  return (<>{!!session && 
    <div className="flex flex-col items-center gap-3">
      <ProfileHeader 
        username={username}
        coinsLeft={coinsLeft}
        width={width}
        avatarUrl={avatarUrl}
      />
      <Divider 
        sx={{ borderColor: 'gray', borderWidth: 2 }} 
        className={`${width}`}
      />
      <div className={`${width}`}>
        <ProfileContent
          email={email}
          bio={bio}
        />        
      </div>
      <Divider 
        sx={{ borderColor: 'gray', borderWidth: 2 }} 
        className={`${width}`}
      />
      <div className={`${width}`}>
        <CoinExchange
          userId={userId}
          coins={coinsLeft}
        />     
      </div>
    </div>}</>    
  );
}