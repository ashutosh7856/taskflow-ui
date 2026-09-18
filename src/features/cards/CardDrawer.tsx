import AddRounded from "@mui/icons-material/AddRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useUiStore } from "../../store/ui";
import type { Board, Card, Checklist, Label } from "../../types";

const labelColors = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

export function CardDrawer({ board }: { board: Board }) {
  const cardId = useUiStore((state) => state.selectedCardId);
  const close = useUiStore((state) => state.setSelectedCardId);
  const client = useQueryClient();
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState(labelColors[5]);
  const card = useQuery({
    queryKey: ["card", cardId],
    enabled: !!cardId,
    queryFn: async () => (await api.get<Card>(`/cards/${cardId}`)).data,
  });
  useEffect(
    () => setDescription(card.data?.description || ""),
    [card.data?.description],
  );
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["card", cardId] });
    client.invalidateQueries({ queryKey: ["board", board.id] });
  };
  const update = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch(`/cards/${cardId}`, data),
    onSuccess: refresh,
  });
  const addComment = useMutation({
    mutationFn: () =>
      api.post(`/cards/${cardId}/comments`, { content: comment }),
    onSuccess: () => {
      setComment("");
      refresh();
    },
  });
  const addChecklist = useMutation({
    mutationFn: () =>
      api.post(`/cards/${cardId}/checklists`, { title: "Checklist" }),
    onSuccess: refresh,
  });
  const addMember = useMutation({
    mutationFn: (userId: string) =>
      api.post(`/cards/${cardId}/members`, { userId }),
    onSuccess: refresh,
  });
  const addLabel = useMutation({
    mutationFn: (labelId: string) =>
      api.post(`/cards/${cardId}/labels`, { labelId }),
    onSuccess: refresh,
  });
  const createLabel = useMutation({
    mutationFn: async () =>
      (
        await api.post<Label>(`/boards/${board.id}/labels`, {
          name: labelName.trim(),
          color: labelColor,
        })
      ).data,
    onSuccess: async (label) => {
      if (cardId) {
        await api.post(`/cards/${cardId}/labels`, { labelId: label.id });
      }
      setLabelDialogOpen(false);
      setLabelName("");
      refresh();
    },
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/cards/${cardId}`),
    onSuccess: () => {
      close(null);
      refresh();
    },
  });

  return (
    <Drawer
      anchor="right"
      open={!!cardId}
      onClose={() => close(null)}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 560 },
          p: { xs: 2, sm: 3 },
          pb: { xs: 10, sm: 3 },
        },
      }}
    >
      <Stack direction="row" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          {card.data?.title || "Card"}
        </Typography>
        <IconButton onClick={() => close(null)}>
          <CloseRounded />
        </IconButton>
      </Stack>
      {card.isLoading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        card.data && (
          <Stack spacing={3}>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {card.data.members?.map(({ user }) => (
                <Chip
                  key={user.id}
                  avatar={<Avatar>{user.name[0]}</Avatar>}
                  label={user.name}
                />
              ))}
              {card.data.labels?.map(({ label }) => (
                <Chip
                  key={label.id}
                  label={label.name}
                  sx={{ bgcolor: label.color, color: "white" }}
                />
              ))}
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <TextField
                select
                label="Add member"
                size="small"
                sx={{ minWidth: 0, flex: "1 1 190px" }}
                value=""
                onChange={(e) => addMember.mutate(e.target.value)}
              >
                {board.members
                  ?.filter(
                    (member) =>
                      !card.data?.members?.some(
                        (entry) => entry.userId === member.userId,
                      ),
                  )
                  .map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {member.user?.name || member.userId}
                    </MenuItem>
                  ))}
              </TextField>
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={() => setLabelDialogOpen(true)}
                sx={{ whiteSpace: "nowrap", flex: "0 0 auto" }}
              >
                New label
              </Button>
              <TextField
                select
                label="Add label"
                size="small"
                sx={{ minWidth: 0, flex: "1 1 190px" }}
                value=""
                onChange={(e) => addLabel.mutate(e.target.value)}
              >
                {board.labels
                  ?.filter(
                    (label) =>
                      !card.data?.labels?.some(
                        (entry) => entry.labelId === label.id,
                      ),
                  )
                  .map((label) => (
                    <MenuItem key={label.id} value={label.id}>
                      {label.name}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                type="date"
                label="Due date"
                size="small"
                sx={{ minWidth: 0, flex: "1 1 170px" }}
                InputLabelProps={{ shrink: true }}
                value={card.data.dueDate?.slice(0, 10) || ""}
                onChange={(e) =>
                  update.mutate({
                    dueDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            </Stack>
            <Box>
              <Typography fontWeight={700} mb={1}>
                Description
              </Typography>
              <TextField
                multiline
                minRows={4}
                fullWidth
                placeholder="Add details, links, or acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description !== (card.data?.description || ""))
                    update.mutate({ description });
                }}
              />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" mb={1}>
                <CheckCircleOutlineRounded sx={{ mr: 1 }} />
                <Typography fontWeight={700}>Checklists</Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                  startIcon={<AddRounded />}
                  onClick={() => addChecklist.mutate()}
                >
                  Add
                </Button>
              </Stack>
              {card.data.checklists?.map((checklist) => (
                <ChecklistView
                  key={checklist.id}
                  checklist={checklist}
                  refresh={refresh}
                />
              ))}
            </Box>
            <Box>
              <Typography fontWeight={700} mb={1}>
                Comments
              </Typography>
              <Stack direction="row" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  disabled={!comment.trim()}
                  onClick={() => addComment.mutate()}
                >
                  Send
                </Button>
              </Stack>
              <Stack spacing={1.5} mt={2}>
                {card.data.comments?.map((entry) => (
                  <Box key={entry.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 28, height: 28 }}>
                        {entry.user.name[0]}
                      </Avatar>
                      <Typography fontWeight={650}>
                        {entry.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Typography sx={{ ml: 4.5 }}>{entry.content}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Divider />
            <Button
              color="error"
              startIcon={<DeleteOutlineRounded />}
              onClick={() => {
                if (confirm("Delete this card?")) remove.mutate();
              }}
            >
              Delete card
            </Button>
          </Stack>
        )
      )}
      <Dialog
        open={labelDialogOpen}
        onClose={() => setLabelDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create label</DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <TextField
            autoFocus
            fullWidth
            label="Label name"
            value={labelName}
            onChange={(event) => setLabelName(event.target.value)}
          />
          <Typography variant="body2" fontWeight={700} mt={3} mb={1.5}>
            Color
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {labelColors.map((color) => (
              <Box
                component="button"
                type="button"
                key={color}
                aria-label={`Select ${color}`}
                onClick={() => setLabelColor(color)}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  border:
                    labelColor === color
                      ? "3px solid #111827"
                      : "3px solid transparent",
                  bgcolor: color,
                  cursor: "pointer",
                  boxShadow:
                    labelColor === color ? "0 0 0 2px white inset" : "none",
                }}
              />
            ))}
          </Stack>
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}>
            <Typography variant="caption" color="text.secondary">
              Preview
            </Typography>
            <Box mt={1}>
              <Chip
                label={labelName || "Label name"}
                sx={{ bgcolor: labelColor, color: "white", fontWeight: 700 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabelDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!labelName.trim() || createLabel.isPending}
            onClick={() => createLabel.mutate()}
          >
            Create and apply
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

function ChecklistView({
  checklist,
  refresh,
}: {
  checklist: Checklist;
  refresh: () => void;
}) {
  const [title, setTitle] = useState("");
  const done = checklist.items.filter((item) => item.isDone).length;
  const progress = checklist.items.length
    ? (done / checklist.items.length) * 100
    : 0;
  const toggle = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
      api.patch(`/checklist-items/${id}`, { isDone }),
    onSuccess: refresh,
  });
  const add = useMutation({
    mutationFn: () =>
      api.post(`/checklists/${checklist.id}/items`, {
        title,
        position: checklist.items.length,
      }),
    onSuccess: () => {
      setTitle("");
      refresh();
    },
  });
  return (
    <Box sx={{ mb: 2, bgcolor: "#f8fafc", borderRadius: 2, p: 2 }}>
      <Typography fontWeight={650}>{checklist.title}</Typography>
      <Stack direction="row" alignItems="center" gap={1} my={1}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ flex: 1, height: 7, borderRadius: 4 }}
        />
        <Typography variant="caption">{Math.round(progress)}%</Typography>
      </Stack>
      {checklist.items.map((item) => (
        <FormControlLabel
          key={item.id}
          control={
            <Checkbox
              size="small"
              checked={item.isDone}
              onChange={() =>
                toggle.mutate({ id: item.id, isDone: !item.isDone })
              }
            />
          }
          label={
            <Typography
              sx={{ textDecoration: item.isDone ? "line-through" : "none" }}
            >
              {item.title}
            </Typography>
          }
        />
      ))}
      <Stack direction="row" gap={1} mt={1}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add an item"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button disabled={!title.trim()} onClick={() => add.mutate()}>
          Add
        </Button>
      </Stack>
    </Box>
  );
}
