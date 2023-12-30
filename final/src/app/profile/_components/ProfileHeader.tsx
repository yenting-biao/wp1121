"use client"
import { useState } from "react";
import { Avatar, Button, Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, Snackbar, TextField, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import PaidIcon from '@mui/icons-material/Paid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { signOut, useSession } from "next-auth/react";
import { CldUploadWidget } from 'next-cloudinary';
import { publicEnv } from "@/lib/env/public";
import { useRouter } from "next/navigation";
import MuiAlert from '@mui/material/Alert';
import type { AlertProps } from '@mui/material/Alert';
import React from "react";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type Props = {
  username: string | undefined;
  coinsLeft: number | undefined;
  avatarUrl: string | undefined;
  width: string;
}

export default function ProfileHeader({ username, coinsLeft, width, avatarUrl }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState<boolean>(false);
  const [url, setUrl] = useState<string>(avatarUrl ?? "");
  const [newUsername, setNewUsername] = useState<string>(username ?? "");
  const [edittingUsername, setEdittingUsername] = useState<boolean>(false);

  const [successSubmit, setSuccessSubmit] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChangeUsername = async () => {
    if (newUsername.length > 20) {
      setEdittingUsername(false);
      setErrorMessage("暱稱不可超過 20 個字");
      setHasError(true);
      setNewUsername(username ?? "");
      return;
    }
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: newUsername,
      }),
    });    

    if(!res.ok) {
      setEdittingUsername(false);
      setErrorMessage("系統忙碌中，請稍後再試");
      setHasError(true);
      setNewUsername(username ?? "");
      console.log(res.status);
    } else {
      setEdittingUsername(false);
      setSuccessMessage("成功更改暱稱");
      setSuccessSubmit(true);
      username = newUsername;
      update();
      router.refresh();
    }
  }

  return (
    <div className={`flex items-center gap-2 ${width} bg-white`}>
      <Snackbar 
        open={successSubmit} 
        autoHideDuration={1500} 
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
      <div className="flex w-full items-center gap-5 text-4xl">
        <CldUploadWidget 
          options={{ 
            sources: ['local', 'url', 'camera', 'google_drive', 'dropbox'], 
            resourceType: 'image',
            clientAllowedFormats: ['gif', 'png', 'jpg', 'jpeg', 'heif'],
          }}
          uploadPreset={publicEnv.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={async (result) => {
            console.log(result); 
            
            if (result && typeof result.info === 'object' && 'secure_url' in result.info){
              const newAvatarUrl: string = String(result.info.secure_url);
              const res = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  avatarUrl: newAvatarUrl,
                }),
              });             
              if(!res.ok) {
                console.log("error");
              } else {
                setUrl(newAvatarUrl);
                update();
                router.refresh();
              }
            }               
          }}
        >
          {({ open }) => {
            return (
              <Tooltip title="點擊以更改頭像">
                <Avatar
                  sx={{ width: 72, height: 72 }}
                  className="text-3xl hover: cursor-pointer"
                  src={url}
                  onClick={() => open()}
                />
              </Tooltip>                
            );
          }}
        </CldUploadWidget>  
              
        {edittingUsername ? (
          <TextField 
            variant="standard" 
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onBlur={() => setEdittingUsername(false)}
            onKeyDown={(e) => {
              if(e.key === 'Enter') {
                handleChangeUsername();
              }            
            }}
            inputProps={{ style: { fontSize: '2rem' } }}
          />
        ) : (
          <Tooltip title="點擊以更改暱稱">
            <Typography 
              variant="h4" 
              className="overflow-hidden overflow-ellipsis whitespace-nowrap hover: cursor-pointer"
              onClick={() => setEdittingUsername(true)}
            >
              {newUsername}
            </Typography>
          </Tooltip>          
        )}
        {!isSmallScreen && <div className="flex items-center text-lg gap-2">
          <PaidIcon sx={{ color: 'gold', width: 32, height: 32 }} />
            <Typography variant="h6" className="mt-0.5">
              {coinsLeft}
            </Typography>         
          <button
            className="hover:bg-gray-100 active:bg-gray-200 rounded-full p-2"
            onClick={() => setOpen(true)}
          >
            <AddCircleOutlineIcon
              sx={{ width: 24, height: 24 }}
            />
          </button>
        </div>}
      </div>

      <div>
        <Button
          variant="contained"
          className="bg-blue-500"
          onClick={handleLogout}
        >
          登出
        </Button>
      </div>
      <PayDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

type PayDialogProps = {
  open: boolean;
  onClose: () => void;
}

function PayDialog({ open, onClose }: PayDialogProps) {
  const router = useRouter();
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle className="font-semibold">想獲得更多金幣嗎？</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 12,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers className="pt-1">
        <List>
          <Tooltip 
            title={<Typography variant="subtitle2">{publicEnv.NEXT_PUBLIC_BASE_URL}/missions</Typography>}
          >
            <ListItem 
              divider
              onClick={() => router.push(`${publicEnv.NEXT_PUBLIC_BASE_URL}/missions`)}
              className="hover:cursor-pointer hover:text-blue-500 hover:underline"
            >
              去每日任務賺取金幣吧～點我前往每日任務頁面！
            </ListItem>
          </Tooltip>          
          <ListItem>
            不想慢慢解任務嗎？歡迎課金支持我們，但我們還沒有這個功能 QQ
          </ListItem>
        </List>        
      </DialogContent>
    </Dialog>
  );
}
