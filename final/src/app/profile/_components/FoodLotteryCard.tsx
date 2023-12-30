"use client"

import { FerrisWheel } from 'lucide-react';
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import React from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  name: string;
  description: string;
  price: number;
}

export default function FoodLotteryCard ({ name, description, price }: Props) {
  const router = useRouter();

  return (
    <>
      <Card sx={{ maxWidth: 345 }} className='border border-gray-500'>
        <CardMedia
          sx={{ height: 140 }}
          title="Icon"
        >
          <FerrisWheel className="w-full h-full" />
        </CardMedia>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" className="flex items-center">
            {name} &nbsp; <PaidIcon sx={{color: 'gold'}} className="mr-1"/> {price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
        <CardActions className="ml-1">        
          <Button size="small" onClick={() => router.push("/restaurants")}>去抽餐廳！</Button>
        </CardActions>
      </Card>      
    </>
  );
}