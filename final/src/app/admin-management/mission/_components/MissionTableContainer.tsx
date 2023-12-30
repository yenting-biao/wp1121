"use client"
import { Alert, Button, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  missions: {
    missionId: string;
    missionName: string;
    missionDescription: string | null;
    relatedPlaceId: string | null;
    prize: number;
    startAt: Date;
    endAt: Date;
  }[];
};

export default function MissionTableContainer ({ title, missions }: Props) {
  const router = useRouter();

  const [expanded, setExpanded] = useState<boolean>(false);
  const headClassname = "bg-gray-200 font-semibold";
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>, missionId: string) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setSelectedMissionId(missionId);
    console.log("missionId: " + missionId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMissionId(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMissionId(null);
  };

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

  const handleDeleteMission = async () => {
    setLoading(true);
    
    const res = await fetch("/api/admin-management/mission", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        missionId: selectedMissionId,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.log(error);
      setHasError(true);
      setErrorMessage("系統忙碌中，請稍後再試");
      setLoading(false);
      handleCloseDialog();
    } else {
      setSuccessSubmit(true);
      setSuccessMessage("成功刪除此任務");
      setLoading(false);
      handleCloseDialog();
      router.refresh();
    }    
  }

  return (
    <div>
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
      <Tooltip title="點擊展開/收合" placement="bottom-start">
        <Typography 
          variant="h5" 
          className="mb-2 hover:cursor-pointer w-fit"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess className="mr-3"/> : <ExpandMore className="mr-3"/>}
          {title}
        </Typography>
      </Tooltip>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Table stickyHeader sx={{ minWidth: 650 }} className="border border-gray-800">
          <TableHead className="bg-gray-700">
            <TableRow>
              <TableCell align="left" className={headClassname}>任務名稱</TableCell>
              <TableCell align="left" className={headClassname}>任務描述</TableCell>
              <TableCell align="left" className={headClassname}>指定餐廳Id</TableCell>
              <TableCell align="left" className={headClassname}>任務獎勵</TableCell>
              <TableCell align="left" className={headClassname}>開始時間</TableCell>
              <TableCell align="left" className={headClassname}>結束時間</TableCell>
            </TableRow>
          </TableHead>
        
          <TableBody>
            {missions.map((mission) => (
              <TableRow
                key={mission.missionId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                onClick={(event) => handleClick(event, mission.missionId)}
                className={`hover:bg-gray-100 hover:cursor-pointer ${mission.missionId === selectedMissionId ? 'bg-red-100' : ''}`}
              >
                <TableCell component="th" scope="row">
                  {mission.missionName}
                </TableCell>
                <TableCell align="left">{mission.missionDescription ?? "null"}</TableCell>
                <TableCell align="left">{mission.relatedPlaceId ?? "null"}</TableCell>
                <TableCell align="left">{mission.prize}</TableCell>
                <TableCell align="left">{mission.startAt.toLocaleString()}</TableCell>
                <TableCell align="left">{mission.endAt.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleOpenDialog}>刪除此任務</MenuItem>
          </Menu>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
          >
            <DialogTitle>刪除任務</DialogTitle>
            <DialogContent>
              <DialogContentText>
                確定要刪除此任務嗎？
              </DialogContentText>
            </DialogContent>
            <DialogActions>              
              <Button onClick={handleDeleteMission} color="primary" disabled={loading}>
                確定
              </Button>
              <Button onClick={handleCloseDialog} disabled={loading}>
                取消
              </Button>
            </DialogActions>
          </Dialog>
        </Table>
      </Collapse>        
    </div>
  )
}