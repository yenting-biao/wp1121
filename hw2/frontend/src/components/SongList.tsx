// https://mui.com/material-ui/react-chttps://mui.com/material-ui/react-card/ard/
//import * as React from 'react';
import { CardActionArea } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

export default function Song() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image="/vite.svg"
          alt="green iguana"
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            101 Songs
          </Typography>
          <Typography variant="h5" component="div" sx={{ marginTop: "10px" }}>
            My PlayList 1
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
