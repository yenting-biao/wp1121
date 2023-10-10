//import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

type SubHeaderBarProps = {
  onclickAdd: () => void;
  onclickDelete: () => void;
  deleteText: boolean;
};

export default function SubHeaderBar({
  onclickAdd,
  onclickDelete,
  deleteText,
}: SubHeaderBarProps) {
  return (
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        My Playlists
      </Typography>
      <Button onClick={onclickAdd}>Add</Button>
      <Button onClick={onclickDelete}>{deleteText ? "Done" : "Delete"}</Button>
    </Toolbar>
  );
}
