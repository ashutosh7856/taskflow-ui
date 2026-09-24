import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import GroupAddRounded from "@mui/icons-material/GroupAddRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
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
  Avatar,
  AvatarGroup,
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
  const [activityOpen, setActivityOpen] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [notice, setNotice] = useState("");
  const normalizedInviteEmail = inviteEmail.trim().toLowerCase();
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
  if (board.isError)
    return <Alert severity="error" sx={{ m: 4 }}>We couldn’t load this board. Check your connection and try again.</Alert>;
  if (!board.data) return <Typography p={4}>Board not found.</Typography>;
  const memberAlreadyExists = board.data.members?.some(
    (member) => member.user?.email?.trim().toLowerCase() === normalizedInviteEmail,
  );

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        p: { xs: 2, sm: 3, lg: 4 },
        background: "#f6f6f3",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        mb={{ xs: 3, md: 5 }}
        color="#111827"
        flexWrap="wrap"
        sx={{
          borderBottom: "1px solid #c9c9c2",
          pb: { xs: 2, sm: 2.5 },
        }}
      >
        <IconButton aria-label="Back to workspaces" onClick={() => navigate("/")} sx={{ color: "#4f4f49", bgcolor: "#e9e9e4", ml: -1, "&:hover": { bgcolor: "#ddddD6" } }}>
          <ArrowBackRounded />
        </IconButton>
        <Typography
          component="h1"
          variant="h4"
          noWrap
          sx={{
            maxWidth: { xs: "calc(100% - 56px)", sm: "none" },
            minWidth: 0,
          }}
        >
          {board.data.name}
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
            flexBasis: { xs: "100%", sm: 0 },
            height: { xs: 0, sm: "auto" },
          }}
        />
        <AvatarGroup max={3} total={board.data.members?.length || 0} sx={{ mr: .5, "& .MuiAvatar-root": { width: 32, height: 32, fontSize: 13, bgcolor: "#e2e2dc", color: "#282825", borderColor: "#f6f6f3", fontWeight: 800 } }}>
          {board.data.members?.slice(0, 2).map((member) => <Avatar key={member.userId} alt={member.user?.name || "Member"}>{member.user?.name?.[0]?.toUpperCase() || "?"}</Avatar>)}
        </AvatarGroup>
        <Tooltip title={activityOpen ? "Hide activity" : "Show activity"}>
          <IconButton
            onClick={() => setActivityOpen((value) => !value)}
            sx={{
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
              display: { xs: "inline-flex", md: "none" },
              color: "#475569",
            }}
          >
            <GroupAddRounded />
          </IconButton>
        </Tooltip>
        <Button
          color="inherit"
          startIcon={<GroupAddRounded />}
          onClick={() => setInviteOpen(true)}
          sx={{ display: { xs: "none", md: "inline-flex" }, color: "#343430" }}
        >
          Invite
        </Button>
      </Stack>
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
      <DndContext sensors={sensors} onDragEnd={dragEnd}>
        <Stack
          direction="row"
          alignItems="flex-start"
            spacing={2.5}
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
              bgcolor: "transparent",
              color: "#343430",
              border: "1px dashed #8a8a82",
              p: 2,
              justifyContent: "flex-start",
              "&:hover": { bgcolor: "#fff", borderColor: "#111" },
            }}
          >
            Add another list
          </Button>
        </Stack>
      </DndContext>
      </Box>
      {activityOpen && <Box component="aside" aria-label="Board activity" sx={{ position: { xs: "fixed", lg: "static" }, inset: { xs: "64px 0 0 auto", lg: "auto" }, zIndex: { xs: 1250, lg: "auto" }, width: { xs: "min(88vw, 360px)", lg: 320 }, flex: "0 0 320px", bgcolor: "#fff", border: "1px solid #d7d7d0", borderRadius: { xs: 0, lg: 2 }, p: 2.5, maxHeight: { xs: "calc(100vh - 64px)", lg: "calc(100vh - 190px)" }, boxShadow: { xs: "-16px 0 40px rgba(0,0,0,.18)", lg: "none" }, overflowY: "auto" }}>
        <Stack direction="row" alignItems="center" mb={2}><Typography fontWeight={800} sx={{ flex: 1 }}>Activity</Typography><IconButton size="small" aria-label="Close activity" onClick={() => setActivityOpen(false)}><CloseRounded fontSize="small" /></IconButton></Stack>
        {activity.isLoading && <CircularProgress size={24} />}
        <Stack spacing={2}>{activity.data?.map((entry) => <Box key={entry.id}><Typography variant="body2"><strong>{entry.user?.name || "A member"}</strong> {activityMessage(entry.action)}</Typography><Typography variant="caption" color="text.secondary">{new Date(entry.createdAt).toLocaleString()}</Typography></Box>)}{!activity.isLoading && !activity.data?.length && <Typography variant="body2" color="text.secondary">No activity yet.</Typography>}</Stack>
      </Box>}
      </Box>
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
            error={!!memberAlreadyExists}
            helperText={memberAlreadyExists ? "This person is already a board member." : "Enter the teammate’s email address."}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!normalizedInviteEmail || !!memberAlreadyExists || invite.isPending}
            onClick={() => invite.mutate()}
          >
            Create invite
          </Button>
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
        bgcolor: isOver ? "#fff5ad" : "transparent",
        width: { xs: "86vw", sm: 300 },
        minWidth: { xs: "86vw", sm: 300 },
        maxWidth: 340,
        scrollSnapAlign: "start",
        borderRadius: 2,
        border: isOver ? "2px solid #111" : "1px solid transparent",
        boxShadow: "none",
        p: 1,
        transition: ".15s",
      }}
    >
      <Stack direction="row" alignItems="center" px={1} mb={1.5} sx={{ borderBottom: "2px solid #111", pb: 1.25 }}>
        <Typography fontWeight={750}>{list.name}</Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ ml: 1.25 }}>{list.cards.length}</Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton
          aria-label={`Delete ${list.name} list`}
          size="small"
          onClick={() => {
            if (confirm(`Delete ${list.name}?`)) remove.mutate();
          }}
        >
          <DeleteOutlineRounded fontSize="small" />
        </IconButton>
      </Stack>
      <Stack spacing={1.25}>
        {list.cards.map((card) => (
          <TaskCard key={card.id} card={card} listId={list.id} />
        ))}
      </Stack>
      <Button
        fullWidth
        startIcon={<AddRounded />}
        sx={{ mt: 1.25, justifyContent: "flex-start", color: "#565650" }}
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
        boxShadow: "none",
        transition: "border-color .15s, transform .15s",
        "&:hover": { borderColor: "#111", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(0,0,0,.08)" },
      }}
      {...listeners}
      {...attributes}
    >
      <CardActionArea aria-label={`Open card: ${card.title}`} onClick={() => select(card.id)}>
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
                  minHeight: 22,
                  px: .9,
                  display: "flex",
                  alignItems: "center",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 800,
                  borderRadius: 1,
                  bgcolor: label.color,
                }}
              >{label.name}</Box>
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
