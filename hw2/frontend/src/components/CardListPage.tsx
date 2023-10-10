import { useRef, useState } from "react";

//import AddIcon from "@mui/icons-material/Add";
//import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
//import Divider from "@mui/material/Divider";
//import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
//import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import useCards from "@/hooks/useCards";
import { updateList } from "@/utils/client";
import { deleteCard } from "@/utils/client";

import Card from "./Card";
import type { CardProps } from "./Card";
import CardDialog from "./CardDialog";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export type CardListPageProps = {
  id: string;
  name: string;
  description: string;
  cards: CardProps[];
};

export default function CardListPage({
  id,
  name,
  description,
  cards,
}: CardListPageProps) {
  const [openNewCardDialog, setOpenNewCardDialog] = useState(false);
  const [edittingName, setEdittingName] = useState(false);
  const [edittingDescription, setEdittingDescription] = useState(false);
  const { fetchLists } = useCards();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRefDes = useRef<HTMLInputElement>(null);

  const [selectAll, setSelectAll] = useState(false);

  const [openDeleteCardDialog, setOpenDeleteCardDialog] = useState(false);
  const [openPleaseSelectDialog, setOpenPleaseSelectDialog] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [hasSelect, setHasSelect] = useState(false);
  const { fetchCards } = useCards();

  const handleUpdateName = async () => {
    if (!inputRef.current) return;

    const newName = inputRef.current.value;
    if (newName === ""){
      alert("Please enter a new name for this playlist")
    }
    else if (newName !== name) {
      try {
        await updateList(id, { name: newName });
        fetchLists();
      } catch (error) {
        alert("Error: Failed to update playlist name");
      }
    }
    setEdittingName(false);
  };

  const handleUpdateDescription = async () => {
    if (!inputRefDes.current) return;

    const newDescription = inputRefDes.current.value;
    if (newDescription == ""){
      alert("Please enter a new description for this playlist")
    }
    else if (newDescription !== description) {
      try {
        await updateList(id, { description: newDescription });
        fetchLists();
      } catch (error) {
        alert("Error: Failed to update playlist description");
      }
    }
    setEdittingDescription(false);
  };

  const handleClose = () => {
    setOpenDeleteCardDialog(false);
    setOpenPleaseSelectDialog(false);
  };

  const handleDelete = async () => {
    /*try {
      await deleteCard(cardId);
      fetchCards();
    } catch (error) {
      alert("Error: Failed to delete card");
    } finally {
      handleClose();
    }*/
    //console.log(selectedCards);
    const updatedSelectedCards = [...selectedCards];
    for (const cardId of selectedCards) {
      try {
        await deleteCard(cardId);
        //fetchCards();
        const index = updatedSelectedCards.indexOf(cardId);
        if (index > -1) {
          updatedSelectedCards.splice(index, 1);
        }
      } catch (error) {
        setSelectedCards(updatedSelectedCards);
        setSelectAll(false);
        if (updatedSelectedCards.length > 0) {
          setHasSelect(true);
        } else {
          setHasSelect(false);
        }

        alert("Error: Failed to delete card");
        console.error(`Error deleting card with ID ${cardId}: ${error}`);
      }
    }
    setSelectAll(false);
    handleClose();
    fetchCards();
    setSelectedCards(updatedSelectedCards);
    if (updatedSelectedCards.length > 0) {
      setHasSelect(true);
    } else {
      setHasSelect(false);
    }
  };

  const handleToggleSelect = (cardId: string) => {
    const updatedSelectedCards = [...selectedCards];

    if (selectedCards.includes(cardId)) {
      // 如果卡片已經被選中，則取消選中
      const index = updatedSelectedCards.indexOf(cardId);
      if (index > -1) {
        updatedSelectedCards.splice(index, 1);
      }

      if (selectAll) {
        setSelectAll(false);
      }
    } else {
      // 否則選中卡片
      updatedSelectedCards.push(cardId);

      if (updatedSelectedCards.length === cards.length) {
        setSelectAll(true);
      }
    }

    setSelectedCards(updatedSelectedCards);

    if (updatedSelectedCards.length > 0) {
      setHasSelect(true);
    } else {
      setHasSelect(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 选择所有卡片
      const allCardIds = cards.map((card) => card.id);
      setSelectedCards(allCardIds);
    } else {
      // 取消选择所有卡片
      setSelectedCards([]);
    }
    setSelectAll(checked);
    setHasSelect(checked);
  };

  return (
    <>
      <div className="mb-10 flex gap-4">
        <img src="/vite.svg" className="h-20" />
        <div className="flex-grow">
          {edittingName ? (
            <ClickAwayListener onClickAway={handleUpdateName}>
              <Input
                autoFocus
                defaultValue={name}
                className="w-full" //"grow"
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
          {/*<div className="grid place-items-center">
							<IconButton color="error" onClick={handleDelete}>
								<DeleteIcon />
							</IconButton>
						</div>*/}
          {edittingDescription ? (
            <ClickAwayListener onClickAway={handleUpdateDescription}>
              <Input
                autoFocus
                defaultValue={description}
                className="w-full" //"grow"
                placeholder="Enter a new description for this list..."
                sx={{ fontSize: "1rem" }}
                inputRef={inputRefDes}
              />
            </ClickAwayListener>
          ) : (
            <button
              onClick={() => setEdittingDescription(true)}
              className="w-full rounded-md p-2 hover:bg-white/10"
            >
              <Typography className="text-left" variant="body2">
                {description}
              </Typography>
            </button>
          )}
        </div>
      </div>
      {/*<Divider variant="middle" sx={{ mt: 1, mb: 2 }} />*/}
      <div className="mb-10 space-x-5">
        <Button
          variant="contained"
          onClick={() => {
            setSelectAll(false);
            handleSelectAll(false);
            return setOpenNewCardDialog(true);
          }}
        >
          ADD
        </Button>
        <Button
          variant="contained"
          className="ml-5"
          onClick={
            /*handleDelete*/ () => {
              if (hasSelect) {
                return setOpenDeleteCardDialog(true);
              } else {
                return setOpenPleaseSelectDialog(true);
              }
            }
          }
        >
          DELETE
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-row items-center p-2">
          <div className="basis-1/10">
            {" "}
            {/* 全選用的checkbox */}
            <Checkbox
              {...label}
              checked={selectAll}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </div>
          <div className="basis-1/3 font-bold">Song</div>
          <div className="basis-1/3 font-bold">Singer</div>
          <div className="basis-1/3 font-bold">Link</div>
        </div>
        {cards.map((card) => (
          <Card
            key={card.id}
            {...card}
            handleSelected={handleToggleSelect}
            selected={/*selectAll||*/ selectedCards.includes(card.id)}
          />
        ))}
      </div>

      <CardDialog
        variant="new"
        open={openNewCardDialog}
        onClose={() => setOpenNewCardDialog(false)}
        listId={id}
      />

      {/* delete card dialog */}
      <Dialog
        open={openDeleteCardDialog /*&& hasSelect*/}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="break-all"
      >
        <>
          <DialogTitle id="alert-dialog-title">
            Are you sure to delete the following songs?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <div className="flex flex-col gap-4">
                <div className="flex w-full flex-row items-center p-2">
                  <div className="basis-1/3 font-bold">Song</div>
                  <div className="basis-1/3 font-bold">Singer</div>
                  <div className="basis-1/3 font-bold">Link</div>
                </div>
                {cards.map((card) => {
                  if (!selectedCards.find((c) => c === card.id)) {
                    return null;
                  }

                  return (
                    <div
                      key={card.id}
                      className="flex w-full flex-row items-center p-2"
                    >
                      <div className="basis-1/3">{card.title}</div>
                      <div className="basis-1/3">{card.description}</div>
                      <div className="basis-1/3 underline">
                        <a
                          href={card.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {card.link}
                        </a>
                      </div>
                    </div>
                  );
                })}
                {/*selectedCards.map((cardId) => {
                  // 假设 cards 是包含所有卡片信息的数组
                  const card = cards.find((c) => c.id === cardId);

                  if (!card) {
                    return null; // 如果找不到匹配的卡片，则跳过
                  }

                  return (
                    <div key={card.id} className="flex flex-row w-full p-2 items-center">
                      
                      <div className="basis-1/3">
                        {card.title}
                      </div>
                      <div className="basis-1/3">
                        {card.description}
                      </div>
                      <div className="basis-1/3">
                        <a href={card.link} target="_blank" rel="noopener noreferrer">
                          {card.link}
                        </a>
                      </div>
                    </div>
                  );
                })*/}
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDelete}>I want to Delete</Button>
            <Button onClick={handleClose} autoFocus>
              Let me think again.
            </Button>
          </DialogActions>
        </>
      </Dialog>

      <Dialog
        open={openPleaseSelectDialog /*&& (!hasSelect)*/}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="break-all"
      >
        <>
          <DialogTitle id="alert-dialog-title">
            Please select at least one song to delete.
          </DialogTitle>
          <Button onClick={handleClose} autoFocus>
            Ok.
          </Button>
        </>
      </Dialog>
    </>
  );
}
