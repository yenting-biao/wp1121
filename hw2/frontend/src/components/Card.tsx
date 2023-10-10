import { useState } from "react";

import { Paper } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";

import CardDialog from "./CardDialog";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export type CardProps = {
  id: string;
  title: string;
  description: string;
  link: string;
  listId: string;

  selected: boolean;
  handleSelected: (input: string) => void;
};

export default function Card({
  id,
  title,
  description,
  link,
  listId,
  selected,
  handleSelected,
}: CardProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  //const [checked, setChecked] = useState(false);

  const handleClickCheckbox = () => {
    handleSelected(id);
    selected = !selected;
    //return setChecked(!checked);
  };

  return (
    <>
      <button className="w-full text-start">
        <div className="flex flex-row">
          <Paper
            className="flex w-full flex-row items-center p-2"
            elevation={6}
          >
            <div className="basis-1/10">
              <Checkbox
                {...label}
                checked={selected}
                onClick={handleClickCheckbox}
              />
            </div>
            <div className="flex w-full flex-row items-center p-2">
              <div className="basis-1/3" onClick={handleClickOpen}>
                {title}
              </div>
              <div className="basis-1/3" onClick={handleClickOpen}>
                {description}
              </div>
              <div className="basis-1/3">
                <Link target="_blank" href={link} underline="always">
                  {link}
                </Link>
              </div>
            </div>
          </Paper>
        </div>
      </button>

      <CardDialog
        variant="edit"
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        link={link}
        listId={listId}
        cardId={id}
      />
    </>
  );
}
