import { Typography } from "@mui/material";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { getLeaderBoard } from "./action";

type Props = {
  userId: string;
  username: string;
  coins: number;
}

export default async function Leaderboard ({ userId, username, coins }: Props) {
  const top20 = await getLeaderBoard();
  let userRanking = -1;
  for (let i = 0; i < top20.length; i++) {
    if (i > 0 && top20[i].coins === top20[i - 1].coins) {
      top20[i].ranking = top20[i - 1].ranking;
    } else {
      top20[i].ranking = i + 1;
    }
        
    if (top20[i].userId === userId) {            
      userRanking = top20[i].ranking;
    }
  }
  
  return (
    <div className="w-1/4 p-5 border-2 border-gray-800 rounded-xl h-10/12">
      <Typography 
        variant="h4" 
        className="text-center font-semibold mb-5"
      >
        Leaderboard
      </Typography>
      <div className="flex flex-col gap-3 w-full p-2 ml-1 overflow-y-scroll max-h-[60vh]">
        {top20.map((user, i) => 
          <Container 
            key={i}
            ranking={user.ranking}
            username={user.username}
            coins={user.coins}
          />
        )}  
      </div>
      <div className="flex flex-col gap-3 w-full p-2 ml-1">
        <div className="w-full p-1 text-center">
          ...
        </div>      
        <Container 
          ranking={
            userRanking === -1 ? "n" : userRanking
          }
          username={`(你) ${username}`}
          coins={coins}
        />
      </div>
    </div>
  )
}

type ContainerProps = {
  ranking: number | string;
  username: string;
  coins: number;
}

function Container({ ranking, username, coins }: ContainerProps) {
  let RankingDiv;
  if (ranking === 1) {
    RankingDiv = (
      <div className="flex items-center gap-2 ml-1">
        <WorkspacePremiumIcon sx={{ color: 'gold', width: 32, height: 32 }}/>        
      </div>
    )
  } else if (ranking === 2) {
    RankingDiv = (
      <div className="flex items-center gap-2 ml-1">
        <WorkspacePremiumIcon sx={{ color: 'silver', width: 32, height: 32 }}/>       
      </div>
    )
  } else if (ranking === 3) {
    RankingDiv = (
      <div className="flex items-center gap-2 ml-1">
        <WorkspacePremiumIcon sx={{ color: 'brown', width: 32, height: 32 }}/>        
      </div>
    )
  } else {
    RankingDiv = (
      <div className="flex items-center justify-center border-2 border-gray-500 rounded-full w-8 h-8 ml-1">
        <Typography variant="subtitle1" className="mt-0.5">
          {ranking}
        </Typography>
      </div>      
    )  
  }
  return (
    <div className="flex items-center gap-2 w-full justify-between border-black border rounded-xl p-1">
      <div className="w-1/6">
        {RankingDiv}
      </div>      
      <Typography variant="h6" className="text-start w-3/6 overflow-hidden overflow-ellipsis whitespace-nowrap">
        {username}
      </Typography>
      <div className="mr-3 w-1/6 text-right">
        {coins}
      </div>
    </div>
  )
}