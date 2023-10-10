//import AppBar from "@mui/material/AppBar";
import { useState } from "react";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '15ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

type SubHeaderBarProps = {
  onclickAdd: () => void;
  onclickDelete: () => void;
  deleteText: boolean;
  onSearch: (t: string) => void;
};

export default function SubHeaderBar({
  onclickAdd,
  onclickDelete,
  deleteText,
  onSearch
}: SubHeaderBarProps) {
  const [searchText, setSearchText] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // 用户按下了 Enter 键，执行搜索操作
      console.log(searchText);
      onSearch(searchText);
    }
  };

  return (
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        My Playlists
      </Typography>

      <Search >
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search playlist…"
          inputProps={{ 'aria-label': 'search' }}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </Search>

      <Button onClick={onclickAdd}>Add</Button>
      <Button onClick={onclickDelete}>{deleteText ? "Done" : "Delete"}</Button>
    </Toolbar>
  );
}
