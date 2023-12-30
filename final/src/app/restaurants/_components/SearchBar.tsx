import { styled, alpha } from '@mui/material/styles';
import { InputBase } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
interface SearchBarProps {
  onSearch: (searchText: string) => void;
}
export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    if (onSearch) {
      onSearch(event.target.value);
    }
  };
  const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
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
    },
  }));

  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase autoFocus
        value={searchText}
        onChange={handleInputChange}
        placeholder="Search for restaurant..."
       
        className="border-2 rounded-full w-full"
      />
    </Search>
  );
}