import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Avatar,
  IconButton,
  Typography,
  Rating,
  Paper,
  Box,
} from "@mui/material";
import { blue, red } from '@mui/material/colors';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClearIcon from '@mui/icons-material/Clear';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Props = {
  reviewId: string;
  username: string;
  reviewerId: string;
  reviewDate: string;
  starsCount: number;
  content: string;
  userAvatarUrl:string;
  expense: number;
}

export default function ReviewCard({ reviewId, username,userAvatarUrl,reviewerId, reviewDate, starsCount, content,expense }: Props) {
  const [isDelete,setIsDelete] = useState(false);
  const { data: session, status } = useSession();
  const isCurrentUser = session?.user?.id === reviewerId;
  const displayExpense = (value:number) => {
    switch (value) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '';
    }
  };
  const hasMedia = false; // temporary
  useEffect(()=>{
    //console.log(session?.user?.username)
    //console.log(reviewId)
    //console.log(reviewDate);
  },[session])
  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  const handleDelete = async () => {
    try {
      const res = await fetch('/api/review', {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
        })
      });
      if (!res.ok) {
        return;
      }
      setIsDelete(true);
    } catch(error){
        return;
      }
    }
  return (!isDelete&&
    <Paper elevation={1}>
      <Card className="border border-slate-500 rounded-xl">
        <CardHeader
          avatar={
            <Avatar src={userAvatarUrl} sx={{ bgcolor: blue[500] }} aria-label="recipe"/>
          }
          action={isCurrentUser &&(
            <IconButton aria-label="settings" onClick={handleDelete}>
              <ClearIcon/>
            </IconButton>)
          }
          title={username}
          subheader={formatTimestamp(reviewDate)}
        />
        {hasMedia && <CardMedia
          component="img"
          height="194"
          image="/taiwan.jpeg"
          alt="taiwan"
        />}
        <CardContent className="pt-0">
          <Box display="flex" flexDirection="row" alignItems="center" gap={1}>         
            <Rating 
              value={starsCount} 
              readOnly
              precision={0.1}
            /><p style={{ fontSize: 'smaller', textAlign: 'right' }}>{displayExpense(expense)}</p>                             
          </Box>
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        </CardContent>       
      </Card>
    </Paper>
    
  );
}
