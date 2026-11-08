import AddTaskRounded from "@mui/icons-material/AddTaskRounded";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { errorMessage } from "../lib/api";
import { boardWorkflow } from "../lib/workflows";
import type { Board } from "../types";

export interface NewCardInput {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate?: string;
  estimateMinutes?: number;
  labelIds: string[];
  isCompleted?: boolean;
}

export function CreateCardDialog({
  open,
  listName,
  board,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  listName: string;
  board: Board;
  pending?: boolean;
  error?: unknown;
  onClose: () => void;
  onSubmit: (value: NewCardInput) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const workflow = boardWorkflow(board.template);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<NewCardInput["priority"]>("medium");
  const [category, setCategory] = useState(workflow.categories[0].value);
  const [dueDate, setDueDate] = useState("");
  const [estimate, setEstimate] = useState("");
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (open) setCategory(workflow.categories[0].value);
  }, [open, workflow.categories]);

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory(workflow.categories[0].value);
    setDueDate("");
    setEstimate("");
    setLabelIds([]);
    setCompleted(false);
    onClose();
  };
  const submit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate
        ? new Date(`${dueDate}T12:00:00`).toISOString()
        : undefined,
      estimateMinutes: estimate ? Number(estimate) : undefined,
      labelIds,
      isCompleted: completed || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "#d8ff63",
              display: "grid",
              placeItems: "center",
            }}
          >
            <AddTaskRounded />
          </Box>
          <Box>
            <Typography variant="h5">New {workflow.cardNoun}</Typography>
            <Typography variant="body2" color="text.secondary">
              {listName} · {workflow.name} workflow
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Stack spacing={2.25}>
          <Alert icon={false} severity="info" sx={{ py: 0.5 }}>
            {workflow.helper}
          </Alert>
          <TextField
            autoFocus
            required
            fullWidth
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            inputProps={{ maxLength: 180 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Description"
            placeholder="Context, expected outcome, links, or acceptance criteria…"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              select
              label="Type"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {workflow.categories.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as NewCardInput["priority"])
              }
            >
              {(["low", "medium", "high", "urgent"] as const).map((value) => (
                <MenuItem
                  key={value}
                  value={value}
                  sx={{ textTransform: "capitalize" }}
                >
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Due date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="number"
              label="Estimate (minutes)"
              value={estimate}
              onChange={(event) => setEstimate(event.target.value)}
              inputProps={{ min: 0, max: 100000 }}
            />
          </Box>
          {!!board.labels?.length && (
            <Box>
              <Typography fontWeight={750} mb={1}>
                Labels
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {board.labels.map((label) => {
                  const selected = labelIds.includes(label.id);
                  return (
                    <Chip
                      key={label.id}
                      label={label.name}
                      clickable
                      onClick={() =>
                        setLabelIds((current) =>
                          selected
                            ? current.filter((id) => id !== label.id)
                            : [...current, label.id],
                        )
                      }
                      sx={{
                        bgcolor: selected ? label.color : "#eeebe2",
                        color: selected ? "#fff" : "#35332f",
                        border: selected
                          ? "2px solid #181817"
                          : "2px solid transparent",
                        fontWeight: 750,
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={completed}
                onChange={(event) => setCompleted(event.target.checked)}
              />
            }
            label="Create as completed"
          />
          {error != null && (
            <Alert severity="error">{errorMessage(error)}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={
            !title.trim() || pending || (!!estimate && Number(estimate) < 0)
          }
          onClick={submit}
        >
          {pending ? "Creating…" : `Create ${workflow.cardNoun}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
