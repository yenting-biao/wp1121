//import { useRef, useState } from "react";
//import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { CardActionArea } from "@mui/material";
//import Badge from '@mui/material/Badge';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
//import Button from "@mui/material/Button";
//import ClickAwayListener from "@mui/material/ClickAwayListener";
//import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
//import Input from "@mui/material/Input";
//import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import useCards from "@/hooks/useCards";
import { deleteList } from "@/utils/client";

//import myCard from "./Card";
import type { CardProps } from "./Card";

//import CardDialog from "./CardDialog";

export type CardListProps = {
  id: string;
  name: string;
  description: string;
  cards: CardProps[];
  showDelete: boolean;
  onclickCard: () => void;
};

export default function CardList({
  id,
  name,
  /*description,*/ cards,
  showDelete,
  onclickCard,
}: CardListProps) {
  //const [openNewCardDialog, setOpenNewCardDialog] = useState(false);
  //const [edittingName, setEdittingName] = useState(false);
  const { fetchLists } = useCards();
  //const inputRef = useRef<HTMLInputElement>(null);

  /*const handleUpdateName = async () => {
    if (!inputRef.current) return;

    const newName = inputRef.current.value;
    if (newName !== name) {
      try {
        await updateList(id, { name: newName });
        fetchLists();
      } catch (error) {
        alert("Error: Failed to update list name");
      }
    }
    setEdittingName(false);
  };*/

  const handleDelete = async () => {
    try {
      await deleteList(id);
      fetchLists();
    } catch (error) {
      alert("Error: Failed to delete list");
    }
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <div className="relative flex items-start gap-4">
          {showDelete && (
            <div className="absolute right-0 top-0 grid place-items-center">
              <IconButton onClick={handleDelete}>
                <DeleteIcon className="text-red-500" />
              </IconButton>
            </div>
          )}
          <CardMedia
            component="img"
            height="140"
            image="/vite.svg"
            alt="playlist cover"
            onClick={onclickCard}
          />
        </div>

        <CardContent onClick={onclickCard}>
          <Typography variant="body2" color="text.secondary">
            {cards.length} Songs
          </Typography>
          <Typography variant="h5" component="div" sx={{ marginTop: "10px" }}>
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  /*return (
    <>
      <Paper className="w-80 p-6">
        <div className="flex gap-4">
          {edittingName ? (
            <ClickAwayListener onClickAway={handleUpdateName}>
              <Input
                autoFocus
                defaultValue={name}
                className="grow"
                placeholder="Enter a new name for this list..."
                sx={{ fontSize: "2rem" }}
                inputRef={inputRef}
              />
            </ClickAwayListener>
          ) : (
            <button
              onClick={() => setEdittingName(true)}
              className="w-full rounded-md p-2 hover:bg-white/10"
            >
              <Typography className="text-start" variant="h4">
                {name} 
              </Typography>
            </button>
          )}
          <div className="grid place-items-center">
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
        <Divider variant="middle" sx={{ mt: 1, mb: 2 }} />
        <div className="flex flex-col gap-4">
          {cards.map((card) => (
            <myCard key={card.id} {...card} />
          ))}
          <Button
            variant="contained"
            onClick={() => setOpenNewCardDialog(true)}
          >
            <AddIcon className="mr-2" />
            Add a card
          </Button>
        </div>
      </Paper>
      <CardDialog
        variant="new"
        open={openNewCardDialog}
        onClose={() => setOpenNewCardDialog(false)}
        listId={id}
      />
    </>
  );*/
}
