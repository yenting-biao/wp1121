import { useState } from "react";

//import { Delete as DeleteIcon } from "@mui/icons-material";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
//import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import useCards from "@/hooks/useCards";
import { createCard, updateCard } from "@/utils/client";

// this pattern is called discriminated type unions
// you can read more about it here: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
// or see it in action: https://www.typescriptlang.org/play#example/discriminate-types
type NewCardDialogProps = {
  variant: "new";
  open: boolean;
  onClose: () => void;
  listId: string;
};

type EditCardDialogProps = {
  variant: "edit";
  open: boolean;
  onClose: () => void;
  listId: string;
  cardId: string;
  title: string;
  description: string;
  link: string;
};

type CardDialogProps = NewCardDialogProps | EditCardDialogProps;

export default function CardDialog(props: CardDialogProps) {
  const { variant, open, onClose, listId } = props;
  const title = variant === "edit" ? props.title : "";
  const description = variant === "edit" ? props.description : "";
  const link = variant === "edit" ? props.link : "";

  const [edittingTitle, setEdittingTitle] = useState(variant === "new");
  const [edittingDescription, setEdittingDescription] = useState(
    variant === "new",
  );
  const [edittingLink, setEdittingLink] = useState(variant === "new");

  // using a state variable to store the value of the input, and update it on change is another way to get the value of a input
  // however, this method is not recommended for large forms, as it will cause a re-render on every change
  // you can read more about it here: https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description);
  const [newLink, setNewLink] = useState(link);
  const [newListId, setNewListId] = useState(listId);

  const { lists, fetchCards } = useCards();

  const handleClose = () => {
    onClose();
    if (variant === "edit") {
      setNewTitle(title);
      setNewDescription(description);
      setNewLink(link);
      setNewListId(listId);
    }
  };

  const handleSave = async () => {
    try {
      if (variant === "new") {
        if(newTitle === "" ) {
          setNewTitle(title);
          alert("Please fill in the name of the song to save the song.");
          return;
        } else if(newDescription === "") {
          alert("Please fill in the singer to save the song.");
          return;
        } else if(newLink === "") {
          alert("Please fill in the link to save the song.");
          return;
        } else{
          await createCard({
            title: newTitle,
            description: newDescription,
            link: newLink,
            list_id: listId,
          });
        }
        
      } else {
        if (
          newTitle === title &&
          newDescription === description &&
          newLink === link &&
          newListId === listId
        ) {
          return;
        } else if (newListId !== listId) {
          if(newTitle === "" ) {
            alert("Please fill in the name of the song to save the song.");
            return;
          } else if(newDescription === "") {
            alert("Please fill in the singer to save the song.");
            return;
          } else if(newLink === "") {
            alert("Please fill in the link to save the song.");
            return;
          } else{
            await createCard({
              title: newTitle,
              description: newDescription,
              link: newLink,
              list_id: newListId,
            });
          }
          
        } else {
          // typescript is smart enough to know that if variant is not "new", then it must be "edit"
          // therefore props.cardId is a valid value
          if(newTitle === "" ) {
            alert("Please fill in the name of the song to save the song.");
            return;
          } else if(newDescription === "") {
            alert("Please fill in the singer to save the song.");
            return;
          } else if(newLink === "") {
            alert("Please fill in the link to save the song.");
            return;
          } else{
            await updateCard(props.cardId, {
              title: newTitle,
              description: newDescription,
              link: newLink,
              list_id: newListId,
            });
          }
        }
      }
      fetchCards();
      handleClose();
    } catch (error) {
      alert("Please fill in all the fields to save the song!!");
    } finally {
      handleClose();
    }
  };

  /*const handleDelete = async () => {
    if (variant !== "edit") {
      return;
    }
    try {
      await deleteCard(props.cardId);
      fetchCards();
    } catch (error) {
      alert("Error: Failed to delete card");
    } finally {
      handleClose();
    }
  };*/

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="flex gap-4">
        {edittingTitle ? (
          <ClickAwayListener
            onClickAway={() => {
              if (variant === "edit") {
                setEdittingTitle(false);
              }
            }}
          >
            <Input
              autoFocus
              defaultValue={title}
              onChange={(e) => setNewTitle(e.target.value)}
              className="grow"
              placeholder="Add a song to this playlist..."
            />
          </ClickAwayListener>
        ) : (
          <button
            onClick={() => setEdittingTitle(true)}
            className="w-full rounded-md p-2 hover:bg-white/10"
          >
            <Typography className="text-start">{newTitle}</Typography>
          </button>
        )}

        <Select
          value={newListId}
          onChange={(e) => setNewListId(e.target.value)}
        >
          {lists.map((list) => (
            <MenuItem value={list.id} key={list.id}>
              {list.name}
            </MenuItem>
          ))}
        </Select>

        {/*variant === "edit" && (
          <IconButton color="error" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        )*/}
      </DialogTitle>
      <DialogContent className="w-[600px]">
        {edittingDescription ? (
          <ClickAwayListener
            onClickAway={() => {
              if (variant === "edit") {
                setEdittingDescription(false);
              }
            }}
          >
            <textarea
              className="bg-white/0 p-2"
              autoFocus
              defaultValue={description}
              placeholder="Add the singer to the song..."
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </ClickAwayListener>
        ) : (
          <button
            onClick={() => setEdittingDescription(true)}
            className="w-full rounded-md p-2 hover:bg-white/10"
          >
            <Typography className="text-start">{newDescription}</Typography>
          </button>
        )}

        {edittingLink ? (
          <ClickAwayListener
            onClickAway={() => {
              if (variant === "edit") {
                setEdittingLink(false);
              }
            }}
          >
            <textarea
              className="bg-white/0 p-2"
              autoFocus
              defaultValue={link}
              placeholder="Add the link to the song..."
              onChange={(e) => setNewLink(e.target.value)}
            />
          </ClickAwayListener>
        ) : (
          <button
            onClick={() => setEdittingLink(true)}
            className="w-full rounded-md p-2 hover:bg-white/10"
          >
            <Typography className="text-start">{newLink}</Typography>
          </button>
        )}
        <DialogActions>
          <Button onClick={handleSave}>save</Button>
          <Button onClick={handleClose}>close</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
