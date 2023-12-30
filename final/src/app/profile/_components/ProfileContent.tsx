"use client"
import React, { useState } from "react";
import { Button, Collapse,  List, ListItem, ListItemButton, ListItemText, Snackbar, TextField, Typography } from "@mui/material";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import MuiAlert from '@mui/material/Alert';
import type { AlertProps } from '@mui/material/Alert';
import EmailIcon from '@mui/icons-material/Email';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type Props = {
  email: string;
  bio: string;
}

export default function ProfileContent ({ email, bio }: Props) {
  const [changePasswordButton, setChangePasswordButton] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [newBio, setNewBio] = useState<string>(bio ?? "");

  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [successSubmit, setSuccessSubmit] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [changingBio, setChangingBio] = useState<boolean>(false);

  const handleChangePassword = async () => {
    setChangingPassword(true);
    const isNewPasswordValid = newPassword.length >= 8 && newPassword.length <= 20 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /\d/.test(newPassword);
    if (newPassword !== confirmPassword) {
      setHasError(true);
      setErrorMessage("新密碼與確認密碼不相符");
      return;
    } else if (!isNewPasswordValid)   {
      setHasError(true);
      setErrorMessage("新密碼長度要介於 8-20 個字元，且包含大小寫英文與數字");
      return;
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });
    if(!res.ok) {
      if (res.status === 401) {
        setHasError(true);
        setErrorMessage("舊密碼輸入錯誤，請再試一次");
      } else {
        setHasError(true);
        setErrorMessage("系統忙碌中，請稍後再試"); 
      }      
      console.log(res.status);
    } else {
      setSuccessSubmit(true);
      setSuccessMessage("成功更改密碼！");
    }

    setChangingPassword(false);
  };

  const handleChangeBio = async () => {
    setChangingBio(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bio: newBio,
      }),
    });    
    setChangingBio(false);
    if(!res.ok) {
      setHasError(true);
      setErrorMessage("系統忙碌中，請稍後再試"); 
      console.log(res.status);
    } else {
      setSuccessSubmit(true);
      setSuccessMessage("成功更改自我介紹！");
    }
  }

  return (
    <List
      sx={{ bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className="w-full"
    >
      <ListItem className="gap-3">
        <EmailIcon />
        電子郵件（不可更改）
        <ListItemText primary={email} />
      </ListItem>        
      <ListItemButton 
        onClick={() => {
          setChangePasswordButton(!changePasswordButton);
        }}
        className={`rounded-tl-lg rounded-tr-lg ${changePasswordButton && "bg-gray-100 hover:bg-gray-200"}`}
      >
        <ListItemText primary="更改密碼" />
        {changePasswordButton ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={changePasswordButton} timeout="auto" unmountOnExit className="bg-gray-100 rounded-bl-lg rounded-br-lg">
        <List component="div" disablePadding>
          <ListItem className="ml-2 w-full">                
            <TextField 
              label="請輸入舊密碼"
              variant="outlined" 
              type="password"
              className="w-full"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
              }}
            />
          </ListItem>
          <ListItem className="ml-2 w-full">                
            <TextField 
              label="請輸入新密碼"
              variant="outlined" 
              type="password"
              className="w-full"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
          </ListItem>
          <ListItem className="ml-2 w-full">                
            <TextField 
              label="請再輸入一次新密碼"
              variant="outlined" 
              type="password"
              className="w-full"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
          </ListItem>
          <ListItem>
            <Button 
              className="ml-auto"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              確定
            </Button>
          </ListItem>
        </List>
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
      </Collapse>
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
      <ListItem className="flex flex-col items-start">
        <Typography>
          自我介紹
        </Typography>
        <TextareaAutosize 
          className="border-gray-500 placeholder-slate-500 border rounded-lg mt-2 w-full min-h-12 p-3"
          minRows={4}
          value={newBio}
          placeholder="你是誰？你喜歡吃什麼呢？留下任何你想跟大家分享的事吧！"
          onChange={(e) => {
            setNewBio(e.target.value);
          }}
        />
      </ListItem>
      <ListItem>
        <Button 
          className="ml-auto"
          onClick={handleChangeBio}
          disabled={changingBio}
        >
          儲存
        </Button>
      </ListItem>
    </List>
  )
}