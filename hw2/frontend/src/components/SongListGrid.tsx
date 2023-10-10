// https://mui.com/material-ui/react-grid2/#responsive-values
//import * as React from 'react';
//import { experimentalStyled as styled } from '@mui/material/styles';
import Box from "@mui/material/Box";
//import Paper from '@mui/material/Paper';
import Grid from "@mui/material/Unstable_Grid2";

import SongList from "./SongList";

/*const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));*/

export type SongListProps = {
  id: string;
  name: string;
  //cards: CardProps[];
};

export default function ResponsiveGrid(/*{ id, name, cards }: SongListProps*/) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 2, sm: 8, md: 12, lg: 16, xl: 24 }}
      >
        {Array.from(Array(13)).map((_, index) => (
          <Grid xs={2} sm={4} md={4} key={index}>
            <SongList />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
