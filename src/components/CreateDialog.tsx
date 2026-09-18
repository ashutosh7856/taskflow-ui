import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { errorMessage } from "../lib/api";

interface Props {
  open: boolean;
  title: string;
  label?: string;
  pending?: boolean;
  error?: unknown;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function CreateDialog({
  open,
  title,
  label = "Name",
  pending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [value, setValue] = useState("");
  const close = () => {
    setValue("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="xs"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <TextField
          autoFocus
          fullWidth
          label={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
          }}
        />
        {error != null && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage(error)}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!value.trim() || pending}
          onClick={() => onSubmit(value.trim())}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
