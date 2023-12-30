"use client"

import { Button, Card, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import PaidIcon from '@mui/icons-material/Paid';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

type Props = {
  name: string;
  description: string;
  price: number;
}

export default function ProductCard ({ name, description, price }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  
  return (
    <>
      <Card sx={{ maxWidth: 345 }} className='border border-gray-500'>
        <CardMedia
          sx={{ height: 140 }}
          title="Icon"
        >
          <CategoryIcon className="w-full h-full" />
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
          <Button size="small" onClick={() => setOpen(true)}>查看更多</Button>
        </CardActions>
      </Card>
      <ProductDialog
        name={name}
        description={description}
        price={price}
        open={open}
        handleClose={() => setOpen(false)}        
      />
    </>
  );
}

type DialogProps = {
  name: string;
  description: string;
  price: number;
  open: boolean;
  handleClose: () => void;
}

function ProductDialog({ name, description, price, open, handleClose } : DialogProps) {
  
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
    >
      <DialogTitle variant='h4' className='flex justify-between items-center'>
        <div className='flex items-center'>
          {name} &nbsp;<PaidIcon sx={{color: 'gold', width: 40, height: 40}} className="mr-1"/> {price}
        </div>        
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant='h6'>
          {description}
          <div className="text-red-500">
            但很抱歉現在沒有人要跟我們合作，所以沒有優惠券可以兌換 QAQ
          </div>
          <div className='text-red-400'>
            敬請期待未來的合作事宜！（希望有）
          </div>
        </DialogContentText>        
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" className="bg-blue-500">回到上一頁</Button>
      </DialogActions>      
    </Dialog>
  )
}