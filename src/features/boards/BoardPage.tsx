import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import GroupAddRounded from "@mui/icons-material/GroupAddRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Alert,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CreateDialog } from "../../components/CreateDialog";
import { api } from "../../lib/api";
import { useUiStore } from "../../store/ui";
import type { Activity, Board, Card as CardType, List } from "../../types";
import { CardDrawer } from "../cards/CardDrawer";

export function BoardPage() {
  const { boardId = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectCard = useUiStore((state) => state.setSelectedCardId);
  const client = useQueryClient();
  const [newListOpen, setNewListOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [notice, setNotice] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
  );
  useEffect(() => {
    const cardId = searchParams.get("card");
    if (cardId) selectCard(cardId);
  }, [searchParams, selectCard]);
  const board = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => (await api.get<Board>(`/boards/${boardId}`)).data,
  });
  const activity = useQuery({
    queryKey: ["board-activity", boardId],
    enabled: activityOpen,
    queryFn: async () =>
      (await api.get<Activity[]>(`/boards/${boardId}/activity`)).data,
  });
  const invalidate = () =>
    client.invalidateQueries({ queryKey: ["board", boardId] });
  const createList = useMutation({
    mutationFn: (name: string) =>
      api.post(`/boards/${boardId}/lists`, { name }),
    onSuccess: () => {
      invalidate();
      setNewListOpen(false);
    },
  });
  const moveCard = useMutation({
    mutationFn: ({
      cardId,
      listId,
      position,
    }: {
      cardId: string;
      listId: string;
      position: number;
    }) => api.patch(`/cards/${cardId}`, { listId, position }),
    onSuccess: invalidate,
  });
  const invite = useMutation({
    mutationFn: () =>
      api.post(`/boards/${boardId}/invites`, {
        email: inviteEmail,
        role: "member",
      }),
    onSuccess: async ({ data }) => {
      setInviteOpen(false);
      setInviteEmail("");
      if (!data.emailSent && data.token) {
        await navigator.clipboard?.writeText(
          `${window.location.origin}/invites/${data.token}`,
        );
      }
      setNotice(
        data.emailSent
          ? "Invitation email sent successfully."
          : "Invitation created. Email was unavailable, so the invite link was copied.",
      );
    },
  });

  const dragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const listId = String(over.data.current?.listId || over.id);
    const list = board.data?.lists?.find((item) => item.id === listId);
    if (list)
      moveCard.mutate({
        cardId: String(active.id),
        listId,
        position: list.cards.length,
      });
  };

  if (board.isLoading)
    return (
      <Box sx={{ minHeight: "80vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (!board.data) return <Typography p={4}>Board not found.</Typography>;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        p: { xs: 1.5, sm: 2, lg: 3 },
        background: "#eef0f4",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        mb={{ xs: 2, md: 3 }}
        color="#111827"
        flexWrap="wrap"
        sx={{
          bgcolor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 3,
          p: { xs: 1, sm: 1.5 },
          boxShadow: "0 6px 18px rgba(15,23,42,.04)",
        }}
      >
        <IconButton onClick={() => navigate("/")} sx={{ color: "#64748b" }}>
          <ArrowBackRounded />
        </IconButton>
        <Typography
          variant="h5"
          noWrap
          sx={{
            maxWidth: { xs: "calc(100% - 56px)", sm: "none" },
            minWidth: 0,
          }}
        >
          {board.data.name}
        </Typography>
        <Chip
          label={`${board.data.members?.length || 0} members`}
          size="small"
          sx={{
            bgcolor: "#f1f5f9",
            color: "#475569",
            display: { xs: "none", sm: "inline-flex" },
          }}
        />
        <Box
          sx={{
            flexGrow: 1,
            flexBasis: { xs: "100%", sm: 0 },
            height: { xs: 0, sm: "auto" },
          }}
        />
        <Tooltip title="Activity">
          <IconButton
            onClick={() => setActivityOpen(true)}
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              color: "#475569",
            }}
          >
            <HistoryRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title="Invite member">
          <IconButton
            onClick={() => setInviteOpen(true)}
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              color: "#475569",
            }}
          >
            <GroupAddRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add list">
          <IconButton
            onClick={() => setNewListOpen(true)}
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              color: "#475569",
            }}
          >
            <AddRounded />
          </IconButton>
        </Tooltip>
        <Button
          color="inherit"
          startIcon={<HistoryRounded />}
          onClick={() => setActivityOpen(true)}
          sx={{ display: { xs: "none", sm: "inline-flex" }, color: "#475569" }}
        >
          Activity
        </Button>
        <Button
          color="inherit"
          startIcon={<GroupAddRounded />}
          onClick={() => setInviteOpen(true)}
          sx={{ display: { xs: "none", sm: "inline-flex" }, color: "#475569" }}
        >
          Invite
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setNewListOpen(true)}
          sx={{ display: { xs: "none", sm: "inline-flex" } }}
        >
          Add list
        </Button>
      </Stack>
      <DndContext sensors={sensors} onDragEnd={dragEnd}>
        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={2}
          sx={{
            overflowX: "auto",
            width: "100%",
            maxWidth: "100%",
            pb: 3,
            mx: { xs: -1.5, sm: 0 },
            px: { xs: 1.5, sm: 0 },
            scrollSnapType: { xs: "x proximity", sm: "none" },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {board.data.lists?.map((list) => (
            <BoardList key={list.id} list={list} boardId={boardId} />
          ))}
          <Button
            onClick={() => setNewListOpen(true)}
            startIcon={<AddRounded />}
            sx={{
              minWidth: { xs: "86vw", sm: 280 },
              bgcolor: "white",
              color: "#475569",
              border: "1px dashed #cbd5e1",
              p: 2,
              justifyContent: "flex-start",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
            }}
          >
            Add another list
          </Button>
        </Stack>
      </DndContext>
      <CreateDialog
        open={newListOpen}
        title="Add list"
        pending={createList.isPending}
        error={createList.error}
        onClose={() => setNewListOpen(false)}
        onSubmit={(value) => createList.mutate(value)}
      />
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Invite to board</DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <TextField
            fullWidth
            autoFocus
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!inviteEmail || invite.isPending}
            onClick={() => invite.mutate()}
          >
            Create invite
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Board activity</DialogTitle>
        <DialogContent dividers>
          {activity.isLoading && (
            <Box sx={{ display: "grid", placeItems: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          )}
          <Stack spacing={2}>
            {activity.data?.map((entry) => (
              <Box key={entry.id}>
                <Typography>
                  <strong>{entry.user?.name || "A member"}</strong>{" "}
                  {activityMessage(entry.action)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(entry.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))}
            {!activity.isLoading && !activity.data?.length && (
              <Typography color="text.secondary">
                No activity has been recorded yet.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <CardDrawer board={board.data} />
      <Snackbar
        open={!!notice}
        autoHideDuration={5000}
        onClose={() => setNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotice("")}
        >
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function activityMessage(action: string) {
  const messages: Record<string, string> = {
    "list.created": "created a list",
    "list.updated": "updated a list",
    "list.deleted": "deleted a list",
    "card.created": "created a card",
    "card.updated": "updated or moved a card",
    "card.deleted": "deleted a card",
    "card.member_added": "assigned a member to a card",
    "comment.created": "commented on a card",
  };
  return messages[action] || action.replaceAll(".", " ");
}

function BoardList({ list, boardId }: { list: List; boardId: string }) {
  const [newCard, setNewCard] = useState(false);
  const client = useQueryClient();
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { listId: list.id },
  });
  const invalidate = () =>
    client.invalidateQueries({ queryKey: ["board", boardId] });
  const create = useMutation({
    mutationFn: (title: string) =>
      api.post(`/lists/${list.id}/cards`, { title }),
    onSuccess: () => {
      invalidate();
      setNewCard(false);
    },
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/lists/${list.id}`),
    onSuccess: invalidate,
  });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        bgcolor: isOver ? "#eff6ff" : "#ffffff",
        width: { xs: "86vw", sm: 300 },
        minWidth: { xs: "86vw", sm: 300 },
        maxWidth: 340,
        scrollSnapAlign: "start",
        borderRadius: 3,
        border: "1px solid #dde2ea",
        boxShadow: "0 6px 18px rgba(15,23,42,.045)",
        p: 1.5,
        transition: ".15s",
      }}
    >
      <Stack direction="row" alignItems="center" px={1} mb={1}>
        <Typography fontWeight={750}>{list.name}</Typography>
        <Chip label={list.cards.length} size="small" sx={{ ml: 1 }} />
        <Box sx={{ flex: 1 }} />
        <IconButton
          size="small"
          onClick={() => {
            if (confirm(`Delete ${list.name}?`)) remove.mutate();
          }}
        >
          <DeleteOutlineRounded fontSize="small" />
        </IconButton>
      </Stack>
      <Stack spacing={1}>
        {list.cards.map((card) => (
          <TaskCard key={card.id} card={card} listId={list.id} />
        ))}
      </Stack>
      <Button
        fullWidth
        startIcon={<AddRounded />}
        sx={{ mt: 1, justifyContent: "flex-start" }}
        onClick={() => setNewCard(true)}
      >
        Add a card
      </Button>
      <CreateDialog
        open={newCard}
        title={`Add card to ${list.name}`}
        label="Card title"
        pending={create.isPending}
        error={create.error}
        onClose={() => setNewCard(false)}
        onSubmit={(value) => create.mutate(value)}
      />
    </Box>
  );
}

function TaskCard({ card, listId }: { card: CardType; listId: string }) {
  const select = useUiStore((state) => state.setSelectedCardId);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card.id, data: { listId } });
  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.65 : 1,
      }}
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 7px rgba(15,23,42,.07)",
        transition: "box-shadow .18s, transform .18s",
        "&:hover": { boxShadow: "0 7px 18px rgba(15,23,42,.11)" },
      }}
      {...listeners}
      {...attributes}
    >
      <CardActionArea onClick={() => select(card.id)}>
        <CardContent sx={{ p: "12px !important" }}>
          <Stack
            direction="row"
            gap={0.5}
            flexWrap="wrap"
            mb={card.labels?.length ? 1 : 0}
          >
            {card.labels?.map(({ label }) => (
              <Box
                key={label.id}
                title={label.name}
                sx={{
                  width: 36,
                  height: 6,
                  borderRadius: 4,
                  bgcolor: label.color,
                }}
              />
            ))}
          </Stack>
          <Typography fontWeight={600}>{card.title}</Typography>
          {card.dueDate && (
            <Typography variant="caption" color="text.secondary">
              Due {new Date(card.dueDate).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
