import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import BugReportRounded from "@mui/icons-material/BugReportRounded";
import LightbulbRounded from "@mui/icons-material/LightbulbRounded";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, errorMessage } from "../../lib/api";

type Kind = "bug" | "feature";
type Status = "new" | "planned" | "done" | "closed";
type MyFeedback = {
  id: string;
  kind: Kind;
  message: string;
  status: Status;
  createdAt: string;
};

const kinds: Record<Kind, { label: string; icon: typeof BugReportRounded; hint: string; placeholder: string }> = {
  bug: {
    label: "Something's broken",
    icon: BugReportRounded,
    hint: "What did you do, what happened, and what did you expect?",
    placeholder:
      "e.g. I dragged a card to Client review on my phone and it jumped back to Design. Expected it to stay and ask the client.",
  },
  feature: {
    label: "I have an idea",
    icon: LightbulbRounded,
    hint: "What are you trying to get done? The problem matters more than the solution.",
    placeholder:
      "e.g. My clients keep asking for invoices. It'd help to attach the invoice to the approval so they pay when they approve.",
  },
};

const statusText: Record<Status, string> = {
  new: "Received",
  planned: "Planned",
  done: "Shipped",
  closed: "Closed",
};

/** Bug reports and feature ideas, in the user's own words. */
export function FeedbackPage() {
  const client = useQueryClient();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || null;
  const [kind, setKind] = useState<Kind>(
    new URLSearchParams(location.search).get("type") === "idea" ? "feature" : "bug",
  );
  const [message, setMessage] = useState("");
  const mine = useQuery({
    queryKey: ["my-feedback"],
    queryFn: async () => (await api.get<MyFeedback[]>("/feedback")).data,
  });
  const send = useMutation({
    mutationFn: () =>
      api.post("/feedback", { kind, message: message.trim(), page: from }),
    onSuccess: () => {
      setMessage("");
      client.invalidateQueries({ queryKey: ["my-feedback"] });
    },
  });
  const current = kinds[kind];
  const tooShort = message.trim().length < 10;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <IconButton component={Link} to="/app" aria-label="Back to boards" size="small">
          <ArrowBackRounded />
        </IconButton>
        <Typography fontWeight={700} color="text.secondary">
          All boards
        </Typography>
      </Stack>
      <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 44 } }}>
        Report a bug or share an idea
      </Typography>
      <Typography color="text.secondary" mt={1} mb={3}>
        It goes straight to the person who builds Danto. Every message is read.
      </Typography>

      <Box
        role="radiogroup"
        aria-label="What kind of feedback"
        sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, mb: 2 }}
      >
        {(Object.keys(kinds) as Kind[]).map((key) => {
          const Icon = kinds[key].icon;
          const on = key === kind;
          return (
            <ButtonBase
              key={key}
              role="radio"
              aria-checked={on}
              onClick={() => {
                setKind(key);
                send.reset();
              }}
              sx={{
                justifyContent: "flex-start",
                gap: 1.25,
                p: 1.75,
                borderRadius: 2,
                fontWeight: 800,
                fontSize: 15,
                textAlign: "left",
                border: on ? "2px solid var(--ink)" : "1px solid var(--line-strong)",
                m: on ? 0 : "1px",
                bgcolor: on ? "var(--surface)" : "transparent",
                color: "var(--ink)",
              }}
            >
              <Icon fontSize="small" sx={{ color: on ? "var(--ink)" : "var(--muted)" }} />
              {kinds[key].label}
            </ButtonBase>
          );
        })}
      </Box>

      {send.isSuccess ? (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => send.reset()}>
              Send another
            </Button>
          }
        >
          Thanks, it's in. You'll see its status below.
        </Alert>
      ) : (
        <>
          <TextField
            label={current.hint}
            placeholder={current.placeholder}
            multiline
            minRows={6}
            fullWidth
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 4000 }, inputLabel: { shrink: true } }}
          />
          {send.isError && (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {errorMessage(send.error)}
            </Alert>
          )}
          <Stack direction="row" alignItems="center" gap={2} mt={1.5}>
            <Button
              variant="contained"
              disabled={tooShort || send.isPending}
              onClick={() => send.mutate()}
            >
              {send.isPending ? "Sending…" : kind === "bug" ? "Send bug report" : "Send idea"}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {from ? `We'll note you were on ${from}.` : "Screens or links? Paste the link in the text."}
            </Typography>
          </Stack>
        </>
      )}

      {!!mine.data?.length && (
        <Box mt={5}>
          <Typography fontWeight={800} mb={1}>
            What you've sent
          </Typography>
          <Stack component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {mine.data.map((item) => (
              <Box
                component="li"
                key={item.id}
                sx={{ py: 1.5, borderTop: "1px solid var(--line)" }}
              >
                <Stack direction="row" gap={1} alignItems="center" mb={0.5}>
                  <Typography variant="body2" fontWeight={800}>
                    {item.kind === "bug" ? "Bug" : "Idea"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      px: 0.75,
                      borderRadius: 1,
                      fontWeight: 700,
                      bgcolor:
                        item.status === "done"
                          ? "var(--tint-green)"
                          : item.status === "planned"
                            ? "var(--tint-blue)"
                            : "var(--surface-2)",
                      color: "var(--ink)",
                    }}
                  >
                    {statusText[item.status]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDistanceToNow(new Date(item.createdAt))} ago
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  className="wrap-anywhere"
                  sx={{
                    color: "var(--ink-soft)",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    whiteSpace: "pre-line",
                  }}
                >
                  {item.message}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Container>
  );
}
