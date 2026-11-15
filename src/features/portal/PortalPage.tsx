import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import EventRounded from "@mui/icons-material/EventRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import BlurText from "../../components/bits/BlurText";
import CountUp from "../../components/bits/CountUp";
import { errorMessage } from "../../lib/api";
import type { PublicPortal, PublicPortalCard } from "../../types";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

const NAME_KEY = "danto-portal-name";
function storedName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}
function rememberName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* private mode: name just won't be remembered */
  }
}

const statusMeta = {
  pending: { label: "Awaiting your approval", bg: "#fff1c2", fg: "#7a4d00" },
  approved: { label: "Approved", bg: "#e3f6c8", fg: "#2f5a00" },
  changes_requested: {
    label: "Changes requested",
    bg: "#ffe1d8",
    fg: "#9a2a0b",
  },
  none: null,
} as const;

export function PortalPage() {
  const { token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [openCardId, setOpenCardId] = useState<string | null>(
    searchParams.get("card"),
  );
  const [requestOpen, setRequestOpen] = useState(false);
  const portal = useQuery({
    queryKey: ["portal", token],
    queryFn: async () =>
      (await publicApi.get<PublicPortal>(`/portal/${token}`)).data,
    refetchInterval: 60_000,
    retry: false,
  });

  const data = portal.data;
  const accent = data?.brand.color || "#181817";
  const allCards = useMemo(
    () => data?.lists.flatMap((list) => list.cards) || [],
    [data],
  );
  const openCard = allCards.find((card) => card.id === openCardId) || null;
  const pending = allCards.filter((card) => card.approvalStatus === "pending");
  const percent = data?.stats.total
    ? Math.round((data.stats.completed / data.stats.total) * 100)
    : 0;

  useEffect(() => {
    if (data) document.title = `${data.board.name} · ${data.brand.name}`;
  }, [data]);

  if (portal.isLoading)
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (portal.isError || !data)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          p: 3,
          textAlign: "center",
        }}
      >
        <Box>
          <Typography variant="h4">This portal isn’t available</Typography>
          <Typography color="text.secondary" mt={1}>
            The link may have been turned off or replaced. Ask your project
            contact for a new link.
          </Typography>
        </Box>
      </Box>
    );

  return (
    <Box
      className="portal-page"
      sx={{ minHeight: "100vh", "--portal-accent": accent } as never}
    >
      <Box component="header" className="portal-header">
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" gap={1.5} minHeight={68}>
            {data.brand.logoUrl ? (
              <Box
                component="img"
                src={data.brand.logoUrl}
                alt={data.brand.name}
                sx={{ height: 34, maxWidth: 160, objectFit: "contain" }}
              />
            ) : (
              <Box className="portal-monogram">
                {data.brand.name.slice(0, 1).toUpperCase()}
              </Box>
            )}
            <Typography fontWeight={850} letterSpacing="-.03em" noWrap>
              {data.brand.name}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Chip
              size="small"
              label="Live"
              sx={{
                bgcolor: "#e3f6c8",
                fontWeight: 800,
                "&::before": {
                  content: '""',
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#3f8a00",
                  ml: 1,
                  animation: "portal-pulse 1.8s infinite",
                },
              }}
            />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Typography className="eyebrow">
          {data.board.clientName
            ? `Project portal · ${data.board.clientName}`
            : "Project portal"}
        </Typography>
        <BlurText
          text={data.board.name}
          className="portal-title"
          animateBy="words"
          delay={60}
          trigger="load"
        />
        {data.board.welcome && (
          <Typography
            sx={{
              mt: 2,
              maxWidth: 720,
              color: "#56534d",
              fontSize: 18,
              whiteSpace: "pre-line",
            }}
          >
            {data.board.welcome}
          </Typography>
        )}

        <Box className="portal-stats">
          <Box className="portal-stat portal-stat-main">
            <Typography className="portal-stat-label">
              Overall progress
            </Typography>
            <Typography className="portal-stat-value">
              <CountUp to={percent} duration={1.4} />%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                mt: 1.5,
                height: 10,
                borderRadius: 99,
                bgcolor: "rgba(255,255,255,.18)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#d8ff63",
                  borderRadius: 99,
                },
              }}
            />
          </Box>
          <Box className="portal-stat">
            <Typography className="portal-stat-label">Delivered</Typography>
            <Typography className="portal-stat-value">
              <CountUp to={data.stats.completed} duration={1.2} />
              <Box
                component="span"
                sx={{ fontSize: ".45em", color: "#8a867d" }}
              >
                {" "}
                / {data.stats.total}
              </Box>
            </Typography>
          </Box>
          <Box
            className={`portal-stat ${data.stats.awaitingApproval ? "portal-stat-alert" : ""}`}
          >
            <Typography className="portal-stat-label">
              Needs your review
            </Typography>
            <Typography className="portal-stat-value">
              <CountUp to={data.stats.awaitingApproval} duration={1} />
            </Typography>
          </Box>
        </Box>

        {pending.length > 0 && (
          <Box component="section" mt={6}>
            <SectionTitle
              title="Waiting on you"
              detail="Approve or request changes. It takes one click."
            />
            <Box className="portal-approval-grid">
              {pending.map((card) => (
                <Box key={card.id} className="portal-approval-card">
                  <Chip
                    size="small"
                    icon={<HourglassTopRounded />}
                    label="Ready for review"
                    sx={{ bgcolor: "#fff1c2", fontWeight: 800, mb: 1.5 }}
                  />
                  <Typography
                    fontWeight={850}
                    fontSize={18}
                    className="wrap-anywhere"
                  >
                    {card.title}
                  </Typography>
                  {card.description && (
                    <Typography
                      color="text.secondary"
                      mt={0.75}
                      className="portal-clamp"
                    >
                      {card.description}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => setOpenCardId(card.id)}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Review
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box component="section" mt={7}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "flex-end" }}
            gap={2}
          >
            <SectionTitle
              title="Where everything stands"
              detail={`Updated ${formatDistanceToNow(new Date(data.board.updatedAt))} ago`}
            />
            <Box sx={{ flex: 1 }} />
            {data.board.allowRequests && (
              <Button
                variant="outlined"
                startIcon={<EditNoteRounded />}
                onClick={() => setRequestOpen(true)}
                sx={{ mb: 2.5 }}
              >
                Submit a request
              </Button>
            )}
          </Stack>
          <Box className="portal-stages">
            {data.lists.map((list) => (
              <Box key={list.id} className="portal-stage">
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <Typography fontWeight={850}>{list.name}</Typography>
                  <Chip size="small" label={list.cards.length} />
                </Stack>
                <Stack gap={1}>
                  {list.cards.map((card) => (
                    <PortalCardRow
                      key={card.id}
                      card={card}
                      onOpen={() => setOpenCardId(card.id)}
                    />
                  ))}
                  {!list.cards.length && (
                    <Typography variant="body2" color="text.secondary">
                      Nothing here right now.
                    </Typography>
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {data.brand.showBadge && (
        <Box component="footer" className="portal-footer">
          <Link to="/?ref=portal">
            Client portal by <strong>danto</strong> · Make one for your clients,
            free →
          </Link>
        </Box>
      )}

      {openCard && (
        <CardDialog
          token={token}
          card={openCard}
          onClose={() => setOpenCardId(null)}
        />
      )}
      <RequestDialog
        token={token}
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
      />
    </Box>
  );
}

function SectionTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <Box mb={2.5}>
      <Typography variant="h5">{title}</Typography>
      <Typography color="text.secondary" variant="body2">
        {detail}
      </Typography>
    </Box>
  );
}

function PortalCardRow({
  card,
  onOpen,
}: {
  card: PublicPortalCard;
  onOpen: () => void;
}) {
  const status = statusMeta[card.approvalStatus];
  return (
    <Box
      component="button"
      onClick={onOpen}
      className={`portal-card ${card.isCompleted ? "is-done" : ""}`}
    >
      <Stack direction="row" gap={1.25} alignItems="flex-start">
        {card.isCompleted ? (
          <CheckCircleRounded sx={{ color: "#3f8a00", mt: "2px" }} />
        ) : (
          <RadioButtonUncheckedRounded sx={{ color: "#aaa59a", mt: "2px" }} />
        )}
        <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
          <Typography
            fontWeight={750}
            className="portal-card-title wrap-anywhere"
          >
            {card.title}
          </Typography>
          <Stack direction="row" gap={1} mt={0.75} flexWrap="wrap">
            {status && (
              <Chip
                size="small"
                label={status.label}
                sx={{ bgcolor: status.bg, color: status.fg, fontWeight: 800 }}
              />
            )}
            {card.dueDate && !card.isCompleted && (
              <Chip
                size="small"
                icon={<EventRounded />}
                label={format(new Date(card.dueDate), "MMM d")}
                variant="outlined"
              />
            )}
            {card.checklist.total > 0 && (
              <Chip
                size="small"
                variant="outlined"
                label={`${card.checklist.done}/${card.checklist.total} steps`}
              />
            )}
            {card.feedback.length > 0 && (
              <Chip
                size="small"
                variant="outlined"
                icon={<ChatBubbleOutlineRounded />}
                label={card.feedback.length}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function CardDialog({
  token,
  card,
  onClose,
}: {
  token: string;
  card: PublicPortalCard;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [name, setName] = useState(storedName);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"comment" | "changes_requested">("comment");
  const respond = useMutation({
    mutationFn: (kind: "approved" | "changes_requested" | "comment") =>
      publicApi.post(`/portal/${token}/cards/${card.id}/respond`, {
        kind,
        authorName: name.trim(),
        message: message.trim(),
      }),
    onSuccess: () => {
      rememberName(name.trim());
      setMessage("");
      client.invalidateQueries({ queryKey: ["portal", token] });
    },
  });
  const canAct = card.approvalStatus === "pending";
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }} className="wrap-anywhere">
        {card.title}
      </DialogTitle>
      <DialogContent>
        <Stack gap={2.5}>
          {card.description && (
            <Typography sx={{ whiteSpace: "pre-line" }} color="#3e3b36">
              {card.description}
            </Typography>
          )}
          {card.checklist.total > 0 && (
            <Box>
              <Typography variant="body2" fontWeight={700}>
                {card.checklist.done} of {card.checklist.total} steps done
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(card.checklist.done / card.checklist.total) * 100}
                sx={{ mt: 0.75, height: 8, borderRadius: 99 }}
              />
            </Box>
          )}
          {card.feedback.length > 0 && (
            <Stack gap={1}>
              <Typography fontWeight={800}>Conversation</Typography>
              {card.feedback.map((entry) => (
                <Box key={entry.id} className="portal-feedback">
                  <Typography variant="body2" fontWeight={800}>
                    {entry.authorName}
                    <Box
                      component="span"
                      sx={{ color: "#8a867d", fontWeight: 500 }}
                    >
                      {" · "}
                      {entry.kind === "approved"
                        ? "approved"
                        : entry.kind === "changes_requested"
                          ? "requested changes"
                          : entry.kind === "request"
                            ? "requested this"
                            : "commented"}
                      {" · "}
                      {formatDistanceToNow(new Date(entry.createdAt))} ago
                    </Box>
                  </Typography>
                  {entry.kind !== "approved" && entry.kind !== "request" && (
                    <Typography
                      variant="body2"
                      mt={0.5}
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {entry.message}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}
          {respond.isSuccess && (
            <Alert severity="success">
              Thanks! The team has been notified.
            </Alert>
          )}
          {respond.isError && (
            <Alert severity="error">{errorMessage(respond.error)}</Alert>
          )}
          <TextField
            label="Your name"
            size="small"
            value={name}
            onChange={(event) => setName(event.target.value)}
            inputProps={{ maxLength: 80 }}
          />
          <TextField
            label={
              mode === "changes_requested"
                ? "What should change?"
                : "Leave a comment (optional)"
            }
            multiline
            minRows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            inputProps={{ maxLength: 4000 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "flex-start",
        }}
      >
        {canAct && (
          <Button
            variant="contained"
            startIcon={<CheckCircleRounded />}
            disabled={!name.trim() || respond.isPending}
            onClick={() => respond.mutate("approved")}
            sx={{ bgcolor: "#2f6b00", boxShadow: "none" }}
          >
            Approve
          </Button>
        )}
        {canAct && (
          <Button
            variant="outlined"
            disabled={!name.trim() || respond.isPending}
            onClick={() => {
              if (mode !== "changes_requested") setMode("changes_requested");
              else if (message.trim()) respond.mutate("changes_requested");
            }}
          >
            {mode === "changes_requested"
              ? "Send change request"
              : "Request changes"}
          </Button>
        )}
        <Button
          startIcon={<SendRounded />}
          disabled={!name.trim() || !message.trim() || respond.isPending}
          onClick={() => respond.mutate("comment")}
        >
          Comment
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RequestDialog({
  token,
  open,
  onClose,
}: {
  token: string;
  open: boolean;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [name, setName] = useState(storedName);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const submit = useMutation({
    mutationFn: () =>
      publicApi.post(`/portal/${token}/requests`, {
        authorName: name.trim(),
        title: title.trim(),
        details: details.trim(),
      }),
    onSuccess: () => {
      rememberName(name.trim());
      setTitle("");
      setDetails("");
      client.invalidateQueries({ queryKey: ["portal", token] });
    },
  });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Submit a request</DialogTitle>
      <DialogContent>
        <Stack gap={2} pt={1}>
          {submit.isSuccess && (
            <Alert severity="success">
              Request received. It’s now on the board and the team has been
              notified.
            </Alert>
          )}
          {submit.isError && (
            <Alert severity="error">{errorMessage(submit.error)}</Alert>
          )}
          <TextField
            label="Your name"
            size="small"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            label="What do you need?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            inputProps={{ maxLength: 180 }}
          />
          <TextField
            label="Details, links, deadline"
            multiline
            minRows={4}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            inputProps={{ maxLength: 4000 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          disabled={!name.trim() || title.trim().length < 3 || submit.isPending}
          onClick={() => submit.mutate()}
        >
          Send request
        </Button>
      </DialogActions>
    </Dialog>
  );
}
