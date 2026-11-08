import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { errorMessage } from "../lib/api";

const templates = [
  { id: "blank", name: "Blank", detail: "Start from a clean board" },
  { id: "software", name: "Software", detail: "Backlog → review → done" },
  { id: "marketing", name: "Marketing", detail: "Ideas → published" },
  { id: "operations", name: "Operations", detail: "Requests → resolved" },
] as const;

export function CreateBoardDialog({
  open,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  pending?: boolean;
  error?: unknown;
  onClose: () => void;
  onSubmit: (value: {
    name: string;
    template: (typeof templates)[number]["id"];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [template, setTemplate] =
    useState<(typeof templates)[number]["id"]>("software");
  const close = () => {
    setName("");
    setTemplate("software");
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: "#fffef9", borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontSize: 28, pb: 1 }}>Start a board</DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <Typography color="text.secondary" mb={3}>
          Choose a proven workflow and customize it as your team grows.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Board name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Typography
          className="mono-label"
          color="text.secondary"
          mt={3}
          mb={1.5}
        >
          Workflow template
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
            gap: 1,
          }}
        >
          {templates.map((item) => (
            <Box
              component="button"
              type="button"
              key={item.id}
              onClick={() => setTemplate(item.id)}
              sx={{
                textAlign: "left",
                p: 2,
                borderRadius: 2,
                border:
                  template === item.id
                    ? "2px solid #181817"
                    : "1px solid #d4d0c5",
                bgcolor: template === item.id ? "#e9f7b9" : "transparent",
                cursor: "pointer",
              }}
            >
              <Typography fontWeight={800}>{item.name}</Typography>
              <Typography fontSize={13} color="text.secondary">
                {item.detail}
              </Typography>
            </Box>
          ))}
        </Box>
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
          disabled={!name.trim() || pending}
          onClick={() => onSubmit({ name: name.trim(), template })}
        >
          Create board
        </Button>
      </DialogActions>
    </Dialog>
  );
}
