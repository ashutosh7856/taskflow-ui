import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import GroupAddRounded from "@mui/icons-material/GroupAddRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import EventRounded from "@mui/icons-material/EventRounded";
import PersonRemoveRounded from "@mui/icons-material/PersonRemoveRounded";
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
  Divider,
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
import {
  CreateCardDialog,
  type NewCardInput,
} from "../../components/CreateCardDialog";
import { api, errorMessage } from "../../lib/api";
import { categoryLabel } from "../../lib/workflows";
import { useUiStore } from "../../store/ui";
import type { Activity, Board, Card as CardType, List } from "../../types";
import { CardDrawer } from "../cards/CardDrawer";
import { AiPlannerDialog } from "../../components/AiPlannerDialog";

export function BoardPage() {
  const { boardId = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectCard = useUiStore((state) => state.setSelectedCardId);
  const client = useQueryClient();
  const [newListOpen, setNewListOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-width: 1200px)").matches,
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<"all" | "high" | "urgent">("all");
  const [status, setStatus] = useState<"all" | "active" | "completed">("all");
  const [insightsOpen, setInsightsOpen] = useState(false);
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
  const addWorkspaceMember = useMutation({
    mutationFn: (userId: string) =>
      api.post(`/boards/${boardId}/members`, { userId, role: "member" }),
    onSuccess: () => {
      invalidate();
      setNotice("Workspace member added to this board.");
    },
  });
  const removeBoardMember = useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/boards/${boardId}/members/${userId}`),
    onSuccess: () => {
      invalidate();
      setNotice("Member removed from this board.");
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
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        We couldn’t load this board. Check your connection and try again.
      </Alert>
    );
  if (!board.data) return <Typography p={4}>Board not found.</Typography>;
  const memberAlreadyExists = board.data.members?.some(
    (member) =>
      member.user?.email?.trim().toLowerCase() === normalizedInviteEmail,
  );
  const availableWorkspaceMembers =
    board.data.workspaceMembers?.filter(
      (workspaceMember) =>
        !board.data?.members?.some(
          (boardMember) => boardMember.userId === workspaceMember.userId,
        ),
    ) || [];
  const canManageMembers =
    board.data.role === "owner" || board.data.role === "admin";

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        p: { xs: 2, sm: 3, lg: 4 },
        background: "#f2f0e9",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        mb={{ xs: 3, md: 4 }}
        color="#181817"
        flexWrap="wrap"
        sx={{
          borderBottom: "1px solid #aaa59a",
          pb: { xs: 2, sm: 2.5 },
        }}
      >
        <IconButton
          aria-label="Back to workspaces"
          onClick={() => navigate("/app")}
          sx={{
            color: "#181817",
            bgcolor: "#d8ff63",
            ml: -1,
            border: "1px solid #181817",
            "&:hover": { bgcolor: "#e5ff94" },
          }}
        >
          <ArrowBackRounded />
        </IconButton>
        <Typography
          component="h1"
          variant="h4"
          noWrap
          sx={{
            maxWidth: { xs: "calc(100% - 56px)", sm: "none" },
            minWidth: 0,
            fontSize: { xs: 28, md: 38 },
            ml: 1,
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
        <Tooltip title="View and manage board members">
          <Box
            component="button"
            type="button"
            aria-label="View and manage board members"
            onClick={() => setInviteOpen(true)}
            sx={{
              appearance: "none",
              border: 0,
              bgcolor: "transparent",
              p: 0,
              cursor: "pointer",
              mr: 0.5,
            }}
          >
            <AvatarGroup
              max={4}
              total={board.data.members?.length || 0}
              sx={{
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  bgcolor: "#181817",
                  color: "#d8ff63",
                  borderColor: "#f2f0e9",
                  fontWeight: 800,
                },
              }}
            >
              {board.data.members?.slice(0, 4).map((member) => (
                <Avatar
                  key={member.userId}
                  alt={member.user?.name || "Member"}
                  src={member.user?.avatarUrl || undefined}
                >
                  {member.user?.name?.[0]?.toUpperCase() || "?"}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        </Tooltip>
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
        <Tooltip title="Board members">
          <IconButton
            aria-label="Open board members"
            onClick={() => setInviteOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "#475569",
            }}
          >
            <GroupAddRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title="Paste meeting notes, PRs, commit logs, emails, briefs, or content plans">
          <Button
            variant="contained"
            startIcon={<AutoAwesomeRounded />}
            onClick={() => setAiOpen(true)}
            sx={{
              bgcolor: "#d8ff63",
              color: "#181817",
              boxShadow: "none",
              "&:hover": { bgcolor: "#e5ff94", boxShadow: "none" },
            }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Import with AI
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              AI import
            </Box>
          </Button>
        </Tooltip>
        <Button
          color="inherit"
          startIcon={<GroupAddRounded />}
          onClick={() => setInviteOpen(true)}
          sx={{ display: { xs: "none", md: "inline-flex" }, color: "#343430" }}
        >
          Members
        </Button>
      </Stack>
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={1.25}
            mb={2.5}
            alignItems={{ sm: "center" }}
          >
            <TextField
              size="small"
              placeholder="Search cards, labels or descriptions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchRounded sx={{ mr: 1, color: "#77736b" }} />
                  ),
                },
              }}
              sx={{ width: { xs: "100%", sm: 360 } }}
            />
            <Stack direction="row" gap={0.75}>
              {(["all", "high", "urgent"] as const).map((value) => (
                <Chip
                  key={value}
                  label={value === "all" ? "All priorities" : value}
                  onClick={() => setPriority(value)}
                  sx={{
                    bgcolor: priority === value ? "#181817" : "#e8e5dc",
                    color: priority === value ? "#fff" : "#4b4842",
                    textTransform: "capitalize",
                  }}
                />
              ))}
            </Stack>
            <Stack
              direction="row"
              gap={0.75}
              sx={{ maxWidth: "100%", overflowX: "auto", pb: 0.25 }}
            >
              {(["all", "active", "completed"] as const).map((value) => (
                <Chip
                  key={value}
                  label={value === "all" ? "Any status" : value}
                  onClick={() => setStatus(value)}
                  sx={{
                    bgcolor: status === value ? "#356000" : "transparent",
                    color: status === value ? "#fff" : "#4b4842",
                    border: "1px solid #aaa59a",
                    textTransform: "capitalize",
                  }}
                />
              ))}
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Button
              startIcon={<InsightsRounded />}
              onClick={() => setInsightsOpen(true)}
            >
              Insights
            </Button>
          </Stack>
          <DndContext sensors={sensors} onDragEnd={dragEnd}>
            <Stack
              direction="row"
              className="board-scroll"
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
                <BoardList
                  key={list.id}
                  list={list}
                  boardId={boardId}
                  search={search}
                  priority={priority}
                  status={status}
                  board={board.data}
                />
              ))}
              <Button
                onClick={() => setNewListOpen(true)}
                startIcon={<AddRounded />}
                sx={{
                  minWidth: { xs: "86vw", sm: 280 },
                  bgcolor: "rgba(255,254,249,.55)",
                  color: "#3e3b36",
                  border: "1px dashed #807c73",
                  borderRadius: 3,
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
        {activityOpen && (
          <Box
            component="aside"
            aria-label="Board activity"
            sx={{
              position: { xs: "fixed", lg: "static" },
              inset: { xs: "68px 0 0 auto", lg: "auto" },
              zIndex: { xs: 1250, lg: "auto" },
              width: { xs: "min(88vw, 360px)", lg: 320 },
              flex: "0 0 320px",
              bgcolor: "#181817",
              color: "#fff",
              border: "1px solid #181817",
              borderRadius: { xs: 0, lg: 3 },
              p: 2.5,
              maxHeight: {
                xs: "calc(100vh - 68px)",
                lg: "calc(100vh - 190px)",
              },
              boxShadow: {
                xs: "-16px 0 40px rgba(0,0,0,.18)",
                lg: "5px 5px 0 #ff5c35",
              },
              overflowY: "auto",
            }}
          >
            <Stack direction="row" alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: "#d8ff63",
                  mr: 1.5,
                }}
              />
              <Typography fontWeight={800} sx={{ flex: 1 }}>
                Live activity
              </Typography>
              <IconButton
                size="small"
                aria-label="Close activity"
                onClick={() => setActivityOpen(false)}
                sx={{ color: "#fff" }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>
            {activity.isLoading && <CircularProgress size={24} />}
            <Stack spacing={2}>
              {activity.data?.map((entry) => (
                <Box
                  key={entry.id}
                  sx={{ pl: 2, borderLeft: "1px solid #4b4a47" }}
                >
                  <Typography variant="body2">
                    <strong>{entry.user?.name || "A member"}</strong>{" "}
                    {activityMessage(entry.action)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#918f88" }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
              {!activity.isLoading && !activity.data?.length && (
                <Typography variant="body2" sx={{ color: "#918f88" }}>
                  No activity yet.
                </Typography>
              )}
            </Stack>
          </Box>
        )}
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
        maxWidth="sm"
      >
        <DialogTitle>Board members</DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          <Typography color="text.secondary" mb={2.5}>
            {canManageMembers
              ? "See everyone with board access, add an existing workspace member, or invite someone new by email."
              : "See everyone who currently has access to this board."}
          </Typography>
          <Stack spacing={1}>
            {board.data.members?.map((member) => (
              <Stack
                key={member.userId}
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{ p: 1.25, borderRadius: 2, bgcolor: "#eeebe2" }}
              >
                <Avatar
                  src={member.user?.avatarUrl || undefined}
                  sx={{ bgcolor: "#181817", color: "#d8ff63" }}
                >
                  {member.user?.name?.[0]?.toUpperCase() || "?"}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontWeight={800} noWrap>
                    {member.user?.name || "Board member"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {member.user?.email}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={member.role}
                  sx={{ textTransform: "capitalize" }}
                />
                {canManageMembers && member.role !== "owner" && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<PersonRemoveRounded />}
                    disabled={removeBoardMember.isPending}
                    onClick={() => {
                      const name = member.user?.name || "this member";
                      if (
                        confirm(
                          `Remove ${name} from this board? Their card assignments on this board will also be removed. They will remain a workspace member.`,
                        )
                      ) {
                        removeBoardMember.mutate(member.userId);
                      }
                    }}
                    sx={{ minWidth: { xs: 44, sm: "auto" } }}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: "none", sm: "inline" } }}
                    >
                      Remove
                    </Box>
                  </Button>
                )}
              </Stack>
            ))}
          </Stack>

          {canManageMembers && !!availableWorkspaceMembers.length && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography fontWeight={850}>Add from this workspace</Typography>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                These people already belong to the workspace, so no new invite
                is needed.
              </Typography>
              <Stack spacing={1}>
                {availableWorkspaceMembers.map((member) => (
                  <Stack
                    key={member.userId}
                    direction="row"
                    alignItems="center"
                    gap={1.25}
                    sx={{
                      p: 1.25,
                      border: "1px solid #d4d0c5",
                      borderRadius: 2,
                    }}
                  >
                    <Avatar src={member.user?.avatarUrl || undefined}>
                      {member.user?.name?.[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={750} noWrap>
                        {member.user?.name || "Workspace member"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {member.user?.email}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={addWorkspaceMember.isPending}
                      onClick={() => {
                        const name = member.user?.name || "this person";
                        if (confirm(`Add ${name} to this board?`)) {
                          addWorkspaceMember.mutate(member.userId);
                        }
                      }}
                    >
                      Add to board
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </>
          )}

          {canManageMembers && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography fontWeight={850} mb={0.5}>
                Invite someone new
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                We’ll email a secure seven-day invitation link.
              </Typography>
              <TextField
                fullWidth
                label="Email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                error={!!memberAlreadyExists}
                helperText={
                  memberAlreadyExists
                    ? "This person is already a board member."
                    : "Enter the teammate’s email address."
                }
              />
            </>
          )}
          {(addWorkspaceMember.error || removeBoardMember.error) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage(
                addWorkspaceMember.error || removeBoardMember.error,
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Close</Button>
          {canManageMembers && (
            <Button
              variant="contained"
              disabled={
                !normalizedInviteEmail ||
                !!memberAlreadyExists ||
                invite.isPending
              }
              onClick={() => invite.mutate()}
            >
              Send invitation
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <CardDrawer board={board.data} />
      <AiPlannerDialog
        open={aiOpen}
        boardId={boardId}
        onClose={() => setAiOpen(false)}
      />
      <BoardInsightsDialog
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        board={board.data}
      />
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
    "board.member_removed": "removed a member from the board",
    "comment.created": "commented on a card",
  };
  return messages[action] || action.replaceAll(".", " ");
}

function BoardList({
  list,
  boardId,
  search,
  priority,
  status,
  board,
}: {
  list: List;
  boardId: string;
  search: string;
  priority: "all" | "high" | "urgent";
  status: "all" | "active" | "completed";
  board: Board;
}) {
  const [newCard, setNewCard] = useState(false);
  const client = useQueryClient();
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { listId: list.id },
  });
  const invalidate = () =>
    client.invalidateQueries({ queryKey: ["board", boardId] });
  const create = useMutation({
    mutationFn: (input: NewCardInput) =>
      api.post(`/lists/${list.id}/cards`, input),
    onSuccess: () => {
      invalidate();
      setNewCard(false);
    },
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/lists/${list.id}`),
    onSuccess: invalidate,
  });
  const term = search.trim().toLowerCase();
  const visibleCards = list.cards.filter((card) => {
    const matchesText =
      !term ||
      card.title.toLowerCase().includes(term) ||
      card.description?.toLowerCase().includes(term) ||
      card.labels?.some(({ label }) => label.name.toLowerCase().includes(term));
    const matchesStatus =
      status === "all" ||
      (status === "completed" ? card.isCompleted : !card.isCompleted);
    return (
      matchesText &&
      matchesStatus &&
      (priority === "all" || card.priority === priority)
    );
  });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        bgcolor: isOver ? "#e9f7b9" : "#e8e5dc",
        width: { xs: "86vw", sm: 300 },
        minWidth: { xs: "86vw", sm: 300 },
        maxWidth: 340,
        scrollSnapAlign: "start",
        borderRadius: 3,
        border: isOver ? "2px solid #181817" : "1px solid #d4d0c5",
        boxShadow: isOver ? "5px 5px 0 #181817" : "none",
        p: 1.25,
        transition: ".15s",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        px={1}
        mb={1.5}
        sx={{ borderBottom: "1px solid #aaa59a", pb: 1.25 }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "#ff5c35",
            mr: 1,
          }}
        />
        <Typography fontWeight={800}>{list.name}</Typography>
        <Typography
          className="mono-label"
          color="text.secondary"
          sx={{ ml: 1.25 }}
        >
          {String(list.cards.length).padStart(2, "0")}
        </Typography>
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
        {visibleCards.map((card) => (
          <TaskCard
            key={card.id}
            card={card}
            listId={list.id}
            boardId={boardId}
            template={board.template}
          />
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
      <CreateCardDialog
        open={newCard}
        listName={list.name}
        board={board}
        pending={create.isPending}
        error={create.error}
        onClose={() => setNewCard(false)}
        onSubmit={(value) => create.mutate(value)}
      />
    </Box>
  );
}

function TaskCard({
  card,
  listId,
  boardId,
  template,
}: {
  card: CardType;
  listId: string;
  boardId: string;
  template?: string;
}) {
  const select = useUiStore((state) => state.setSelectedCardId);
  const client = useQueryClient();
  const complete = useMutation({
    mutationFn: () =>
      api.patch(`/cards/${card.id}`, { isCompleted: !card.isCompleted }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["board", boardId] }),
  });
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
        borderRadius: 2.5,
        boxShadow: "none",
        transition: "border-color .15s, transform .15s",
        bgcolor: "#fffef9",
        border: card.isCompleted
          ? "1px solid #86a82c"
          : "1px solid transparent",
        opacity: card.isCompleted ? 0.78 : 1,
        "&:hover": {
          borderColor: "#181817",
          transform: "translateY(-2px) rotate(-.3deg)",
          boxShadow: "3px 3px 0 #181817",
        },
      }}
      {...listeners}
      {...attributes}
    >
      <CardActionArea
        aria-label={`Open card: ${card.title}`}
        onClick={() => select(card.id)}
      >
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
                  px: 0.9,
                  display: "flex",
                  alignItems: "center",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 800,
                  borderRadius: 1,
                  bgcolor: label.color,
                }}
              >
                {label.name}
              </Box>
            ))}
          </Stack>
          <Stack direction="row" alignItems="flex-start" gap={1}>
            <Box
              component="span"
              role="checkbox"
              tabIndex={0}
              aria-checked={card.isCompleted}
              aria-label={
                card.isCompleted ? "Mark card active" : "Mark card complete"
              }
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                complete.mutate();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  complete.mutate();
                }
              }}
              sx={{
                display: "inline-flex",
                cursor: "pointer",
                color: card.isCompleted ? "#638000" : "#aaa59a",
              }}
            >
              {card.isCompleted ? (
                <CheckCircleRounded />
              ) : (
                <RadioButtonUncheckedRounded />
              )}
            </Box>
            <Typography
              fontWeight={700}
              sx={{
                letterSpacing: "-.015em",
                textDecoration: card.isCompleted ? "line-through" : "none",
                flex: 1,
              }}
            >
              {card.title}
            </Typography>
          </Stack>
          <Typography
            className="mono-label"
            color="text.secondary"
            sx={{ mt: 1, textTransform: "uppercase" }}
          >
            {categoryLabel(template, card.category || "task")}
          </Typography>
          {card.priority && card.priority !== "medium" && (
            <Typography
              className="mono-label"
              sx={{
                display: "inline-block",
                mt: 1,
                color: card.priority === "urgent" ? "#b42318" : "#8a4b00",
              }}
            >
              {card.priority} priority
            </Typography>
          )}
          {card.dueDate && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75 }}
            >
              <EventRounded sx={{ fontSize: 14 }} />
              Due {new Date(card.dueDate).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function BoardInsightsDialog({
  open,
  onClose,
  board,
}: {
  open: boolean;
  onClose: () => void;
  board: Board;
}) {
  const allCards = board.lists?.flatMap((list) => list.cards) || [];
  const now = Date.now();
  const overdue = allCards.filter(
    (card) =>
      card.dueDate &&
      new Date(card.dueDate).getTime() < now &&
      !card.isArchived,
  ).length;
  const urgent = allCards.filter(
    (card) => card.priority === "urgent" || card.priority === "high",
  ).length;
  const assigned = allCards.filter((card) => card.members?.length).length;
  const completion = allCards.filter((card) => card.isCompleted).length;
  const metrics = [
    { label: "Total cards", value: allCards.length },
    { label: "Completed", value: completion },
    { label: "Overdue", value: overdue },
    { label: "High priority", value: urgent },
    { label: "Assigned", value: assigned },
  ];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: "#fffef9", borderRadius: 3 } }}
    >
      <DialogTitle>Board pulse</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" mb={3}>
          A live operational snapshot based on the board right now.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 1.5,
          }}
        >
          {metrics.map((metric, index) => (
            <Box
              key={metric.label}
              sx={{
                bgcolor: index === 0 ? "#181817" : "#eeebe2",
                color: index === 0 ? "#fff" : "#181817",
                borderRadius: 2,
                p: 2.5,
                gridColumn: index === 0 ? "span 2" : "auto",
              }}
            >
              <Typography
                className="display-type"
                sx={{ fontSize: index === 0 ? 52 : 36 }}
              >
                {metric.value}
              </Typography>
              <Typography
                className="mono-label"
                sx={{ color: index === 0 ? "#d8ff63" : "#67635b" }}
              >
                {metric.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
