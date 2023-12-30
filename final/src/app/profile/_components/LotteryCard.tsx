"use client"

import { FerrisWheel } from 'lucide-react';
import { Button, Card, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Typography } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import MuiAlert from '@mui/material/Alert';
import type { AlertProps } from '@mui/material/Alert';
import React, { useState } from 'react';
//import { Wheel } from 'react-custom-roulette'
import { type WheelData } from 'react-custom-roulette/dist/components/Wheel/types';
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// This is inorder to fix: ReferenceError: window is not defined
const Wheel = dynamic(
  () => {
    return import("react-custom-roulette").then((mod) => mod.Wheel);
  },
  { ssr: false }
);

type Props = {
  name: string;
  description: string;
  price: number;
  userCoins: number;
}

export default function LotteryCard ({ name, description, price, userCoins }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [userLeftCoins, setUserLeftCoins] = useState<number>(userCoins);
  //console.log("userCoins", userId, userCoins);

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
          <Button size="small" onClick={() => setOpen(true)}>查看更多</Button>
        </CardActions>
      </Card>
      <LotteryDialog 
        name={name}
        description={description}
        price={price}
        open={open}
        handleClose={() => setOpen(false)}
        userCoins={userLeftCoins}
        setUserCoins={(newCoins: number) => setUserLeftCoins(newCoins)}
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
  userCoins: number;
  setUserCoins: (newCoins: number) => void;
}

function LotteryDialog ({ name, description, price, open, handleClose, userCoins, setUserCoins }: DialogProps) {
  const dataProb = [
    { option: '1000', optionSize: 1 },
    { option: '500', optionSize: 2 },
    { option: '200', optionSize: 4 },
    { option: '100', optionSize: 8 },
    { option: '50', optionSize: 30 },
    { option: '10', optionSize: 40 },
    { option: '1', optionSize: 15 },
  ];
  const data: WheelData[] = [
    { option: '1000', optionSize: 1 },
    { option: '500', optionSize: 1 },
    { option: '200', optionSize: 1 },
    { option: '100', optionSize: 1 },
    { option: '50', optionSize: 1 },
    { option: '10', optionSize: 1 },
    { option: '1', optionSize: 1 },    
  ];
  const weightedData: string[] = [];
  dataProb.forEach(item => {
    for (let i = 0; i < item.optionSize!; i++) {
      weightedData.push(item.option!);
    }
  });

  const router = useRouter();

  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [successSubmit, setSuccessSubmit] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [mustSpin, setMustSpin] = useState<boolean>(false);
  const [prizeNumber, setPrizeNumber] = useState<number>(0);

  const handleSpinClick = async () => {
    if (!mustSpin) {
      if (userCoins < price) {
        setHasError(true);
        setErrorMessage("你的金幣不足");
        return;
      } else {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coins: -price,
          }),
        });
        if (!res.ok) {
          const mes = await res.json();
          console.log(mes);
          setHasError(true);
          setErrorMessage("系統忙碌中，請稍後再試");          
          return;
        } else {
          setUserCoins(userCoins - price);
          setMustSpin(true);

          const newPrizeNumber = Math.floor(Math.random() * weightedData.length);
          const prize = weightedData[newPrizeNumber];
          const prizeIndex = data.findIndex(item => item.option === prize);
          setPrizeNumber(prizeIndex);          
          
          setLoading(true);
          router.refresh();
        }
      }      
    }
  };

  const onStopSpinning = async () => {
    setMustSpin(false);
    const prize = data[prizeNumber].option;
    
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coins: Number(prize),
      }),
    });

    if(!res.ok) {
      const mes = await res.json();
      console.log(mes);
      console.log("currentPrizeNumber", prizeNumber);
      setHasError(true);
      setErrorMessage("系統忙碌中，請稍後再試。已退還你的金幣");
      setUserCoins(userCoins + price); 
      router.refresh();
      console.log(res.status);
    } else {
      setSuccessMessage(`恭喜 你抽到了 ${prize} 金幣`);    
      setSuccessSubmit(true);  
      setUserCoins(userCoins + Number(prize));
      router.refresh();
    }

    setLoading(false);
  }

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
        <div className='text-lg'>
          你還剩下 &nbsp;<PaidIcon sx={{color: 'gold', width: 30, height: 30}} className="mr-0.5"/> {userCoins}
        </div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant='h6'>
          {description}
        </DialogContentText>
        <div className="flex flex-col items-center">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            backgroundColors={['#f9dd50', '#ff8f43', '#0b3351', '#70bbe0', '#0b3351', '#70bbe0', '#0b3351']}
            textColors={['white']}
            fontFamily={'Noto Sans'}
            fontSize={20}
            fontWeight={'bold'}
            outerBorderColor={'#eeeeee'}
            outerBorderWidth={5}
            innerRadius={0}
            innerBorderColor={'#30261a'}
            innerBorderWidth={0}
            radiusLineColor={'#eeeeee'}
            radiusLineWidth={1}
            spinDuration={0.4}
            startingOptionIndex={prizeNumber}
            perpendicularText
            textDistance={65}
            onStopSpinning={onStopSpinning}
          />
          <Button variant="outlined" onClick={handleSpinClick} disabled={loading}>
            花費 {price} 金幣抽獎
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" className="bg-blue-500" disabled={loading}>回到上一頁</Button>
      </DialogActions>
      <Snackbar 
        open={successSubmit} 
        autoHideDuration={2000} 
        onClose={() => setSuccessSubmit(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessSubmit(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar 
        open={hasError} 
        autoHideDuration={3000} 
        onClose={() => setHasError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setHasError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar> 
    </Dialog>
  )
}