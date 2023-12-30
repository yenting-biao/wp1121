import { auth } from "@/lib/auth";
import Leaderboard from "./_components/Leaderboard";
import MissionCard from "./_components/MissionCard";
import { Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env/public";
import { getFinishedMission, getUnfinishedMission } from "./_components/action";
import PaidIcon from '@mui/icons-material/Paid';

export default async function MissionPage () {
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`${publicEnv.NEXT_PUBLIC_BASE_URL}/login`);
  }
  const userId = session?.user?.id;
  const username = session?.user?.username;
  const coins = session?.user?.coins;

  const unFinisedMissions = await getUnfinishedMission(userId);
  const finishedMissions = await getFinishedMission(userId);

  return (
    <>
      <Leaderboard 
        userId={userId}
        username={username}
        coins={coins}
      />
      <div className="w-full p-4 border-black rounded-xl border-2 ml-4">
        <div className="flex flex-col gap-3 items-center w-full">
          <Typography variant="h3" className="text-center w-full">
            任務列表
          </Typography>
          <Typography variant="h6" className="flex items-center">            
            你有 &nbsp;
            <PaidIcon sx={{ color: 'gold', width: 24, height: 24, marginBottom: 0.5, marginRight: 0.5 }}/>
            {` ${coins}`} 
          </Typography>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4 overflow-y-scroll max-h-[75vh]">
          {unFinisedMissions.map((mission) => {
            return (
              <MissionCard 
                key={mission.missionId}
                missionId={mission.missionId}                
                missionName={mission.missionName}
                missionDescription={mission.missionDescription ?? ""}
                relatedPlaceId={mission.relatedPlaceId}
                prize={mission.prize}
                finished={false}
                startAt={mission.startAt}
                endAt={mission.endAt}
              />    
            )
          })}
          {finishedMissions.map((mission) => {
            return (
              <MissionCard 
                key={mission.missionId}
                missionId={mission.missionId ?? ""}                
                missionName={mission.missionName}
                missionDescription={mission.missionDescription ?? ""}
                relatedPlaceId={mission.relatedPlaceId}
                prize={mission.prize}
                finished={true}
                startAt={mission.startAt}
                endAt={mission.endAt}
              />    
            );
          })}          
        </div>
      </div>
    </>
  );
}