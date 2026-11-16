import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { errorMessage } from "../lib/api";
import { useTemplates, type BoardTemplate } from "../lib/workflows";

const groups: Array<{ id: BoardTemplate["group"]; title: string }> = [
  { id: "client", title: "Client work · portal-ready" },
  { id: "team", title: "Team & internal" },
];

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
  onSubmit: (value: { name: string; template: string }) => void;
}) {
  const catalog = useTemplates();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("client");
  const selected = catalog.data?.find((item) => item.id === template);
  const close = () => {
    setName("");
    setTemplate("client");
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { bgcolor: "#fffef9", borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontSize: 28, pb: 1 }}>Start a board</DialogTitle>
      <DialogContent sx={{ pt: "12px !important" }}>
        <Typography color="text.secondary" mb={3}>
          Pick the kind of work. Each template comes with its own stages, card
          fields, starter checklists and client approval step.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label="Board name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {catalog.isLoading && (
          <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {catalog.error != null && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage(catalog.error)}
          </Alert>
        )}
        {groups.map((group) => {
          const items = catalog.data?.filter((item) => item.group === group.id);
          if (!items?.length) return null;
          return (
            <Box key={group.id}>
              <Typography
                className="mono-label"
                color="text.secondary"
                mt={3}
                mb={1.5}
              >
                {group.title}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2,1fr)",
                    md: "repeat(3,1fr)",
                  },
                  gap: 1,
                }}
              >
                {items.map((item) => (
                  <Box
                    component="button"
                    type="button"
                    key={item.id}
                    aria-pressed={template === item.id}
                    onClick={() => setTemplate(item.id)}
                    sx={{
                      textAlign: "left",
                      p: 1.75,
                      borderRadius: 2,
                      font: "inherit",
                      color: "inherit",
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
                      {item.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
        {selected && selected.lists.length > 0 && (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 2,
              border: "1px dashed #b9b7af",
            }}
          >
            <Typography fontSize={13} fontWeight={800} mb={0.75}>
              {selected.name}: stages
            </Typography>
            <Typography fontSize={14}>
              {selected.lists.map((list, index) => (
                <Box
                  component="span"
                  key={list.name}
                  sx={{
                    fontWeight: list.role === "review" ? 800 : 400,
                    color: list.role === "done" ? "#4f6c00" : "inherit",
                  }}
                >
                  {index > 0 && " → "}
                  {list.name}
                </Box>
              ))}
            </Typography>
            {selected.fields.length > 0 && (
              <Typography fontSize={13} color="text.secondary" mt={0.75}>
                Card fields:{" "}
                {selected.fields.map((field) => field.label).join(", ")}
              </Typography>
            )}
          </Box>
        )}
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
