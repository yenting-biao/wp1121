import { Typography } from "@mui/material";
import { getFutureMission, getInProgressMission, getPastMission, getRandomPlaceId } from "./_components/action";
import NewMissionForm from "./_components/NewMissionForm";
import MissionTableContainer from "./_components/MissionTableContainer";

export default async function AdminMissionPage () {
  const inProgressMission = await getInProgressMission();
  const futureMission = await getFutureMission();
  const pastMission = await getPastMission();
  const randomlyPickedRestaurant = await getRandomPlaceId();
  //console.log(inProgressMission); 
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Typography variant="h5" className="mb-2">
          新增任務
        </Typography>        
        <NewMissionForm 
          placeId={randomlyPickedRestaurant.placeId}
          restaurantName={randomlyPickedRestaurant.name}
          restaurantAddress={randomlyPickedRestaurant.address} 
        />
      </div>
      <MissionTableContainer 
        title="進行中的任務" 
        missions={inProgressMission} 
      />
      <MissionTableContainer
        title="尚未開始的任務"
        missions={futureMission}
      />
      <MissionTableContainer
        title="已結束的任務"
        missions={pastMission}
      />
    </div>
  );
}