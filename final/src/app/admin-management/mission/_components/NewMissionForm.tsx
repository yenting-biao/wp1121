"use client"

import { Alert, Button, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

type Props = {
  placeId: string;
  restaurantName: string;
  restaurantAddress: string;
}

export default function NewMissionForm ({ placeId, restaurantName, restaurantAddress}: Props) {
  const router = useRouter();
  const [missionName, setMissionName] = useState<string>("");
  const [missionDescription, setMissionDescription] = useState<string>("");
  const [relatedPlaceId, setRelatedPlaceId] = useState<string>("");
  const [prize, setPrize] = useState<number | null>();
  const [startAt, setStartAt] = useState<Dayjs | null>();
  const [endAt, setEndAt] = useState<Dayjs | null>();

  const [loading, setLoading] = useState<boolean>(false);
  const [successSubmit, setSuccessSubmit] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const handleCloseError = () => {
    setHasError(false);
  }
  const handleCloseSuccess = () => {
    setSuccessSubmit(false);
  }

  const handleSubmit = async () => {
    setLoading(true);
    if (!missionName || !missionDescription || !prize || !startAt || !endAt) {
      const missingField = [];
      if (!missionName) {
        missingField.push("任務名稱");
      }
      if (!missionDescription) {
        missingField.push("任務描述");
      }
      if (!prize) {
        missingField.push("任務獎勵");
      }
      if (!startAt) {
        missingField.push("開始時間");
      }
      if (!endAt) {
        missingField.push("結束時間");
      }
      setErrorMessage(`請填寫以下欄位: ${missingField.join(", ")}`);
      setHasError(true);
      setLoading(false);
      return;
    }

    if(startAt >= endAt) {
      setErrorMessage("開始時間必須早於結束時間");
      setHasError(true);
      setLoading(false);
      return;    
    }

    const body = {
      missionName,
      missionDescription,
      relatedPlaceId: relatedPlaceId === "" ? undefined : relatedPlaceId.trim(),
      prize: prize,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };

    const res = await fetch("/api/admin-management/mission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      console.log(error);
      setErrorMessage("系統忙碌中，請稍後再試");
      setHasError(true);
      setLoading(false);
      return;
    } else {
      setMissionName("");
      setMissionDescription("");
      setRelatedPlaceId("");
      setPrize(0);
      setStartAt(null);
      setEndAt(null);
      setSuccessMessage("成功新增任務");
      setSuccessSubmit(true);
      setLoading(false);
      router.refresh();
      return;
    }
  }
  
  return (
    <div className="p-8 border border-gray-600 flex flex-col justify-between h-full">
      <div className="grid sm:grid-cols-4 xs:grid-cols-1 gap-2 w-full items-center justify-between">
        <TextField 
          name="missionName" 
          label="任務名稱" 
          value={missionName} 
          onChange={(e) => setMissionName(e.target.value)} 
        />
        <TextField 
          name="missionDescription" 
          label="任務描述" 
          value={missionDescription} 
          onChange={(e) => setMissionDescription(e.target.value)} 
        />
        <TextField 
          name="relatedPlaceId" 
          label="指定餐廳ID（選填）" 
          value={relatedPlaceId} 
          onChange={(e) => setRelatedPlaceId(e.target.value)} 
        />
        <TextField 
          name="prize" 
          label="任務獎勵" 
          value={prize} 
          type="number"
          inputProps={{ inputMode: 'numeric'}}
          onChange={(e) => setPrize(Number(e.target.value))} 
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker 
            label="任務開始時間"
            value={startAt}
            onChange={(newValue) => {
              setStartAt(newValue);
            }}
            format="YYYY/MM/DD HH:mm"
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker 
            label="任務結束時間"
            value={endAt}
            onChange={(newValue) => {
              setEndAt(newValue);
            }}
            format="YYYY/MM/DD HH:mm"
          />
        </LocalizationProvider>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="flex-grow">
          不知道要選哪間餐廳當任務嗎？參考這間吧：<br/>
          <span className="underline">{restaurantName} ({restaurantAddress}) {placeId}</span>
        </div>
        <div className="w-fit">
          <Button variant="contained" className="bg-blue-500" onClick={handleSubmit} disabled={loading}>
            送出
          </Button>
        </div>
        
      </div>  
      <Snackbar
        open={hasError}
        autoHideDuration={2000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>   
      <Snackbar
        open={successSubmit}
        autoHideDuration={2000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>    
    </div>
  )
}