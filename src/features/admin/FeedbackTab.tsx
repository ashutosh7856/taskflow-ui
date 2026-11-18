import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { api, errorMessage } from "../../lib/api";

type Kind = "bug" | "feature";
type Status = "new" | "planned" | "done" | "closed";
type Severity = "low" | "medium" | "high" | "critical";
type Triage = {
  title: string;
  summary: string;
  area: string;
  severity: Severity;
  sentiment: "positive" | "neutral" | "frustrated";
  suggestedAction: string;
};
type Row = {
  id: string;
  kind: Kind;
  message: string;
  page: string | null;
  status: Status;
  ai: Triage | null;
  createdAt: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
};
type Insights = {
  headline: string;
  fixFirst: string;
  analysed: number;
  themes: Array<{ title: string; kind: "bug" | "feature" | "mixed"; count: number; detail: string; action: string }>;
};

const severityRank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const severityStyle: Record<Severity, { color: string; bg: string }> = {
  critical: { color: "var(--danger-ink)", bg: "var(--tint-danger)" },
  high: { color: "var(--orange-ink)", bg: "var(--tint-orange)" },
  medium: { color: "var(--warn-ink)", bg: "var(--tint-warn)" },
  low: { color: "var(--ink-soft)", bg: "var(--surface-2)" },
};
const statusLabel: Record<Status, string> = {
  new: "New",
  planned: "Planned",
  done: "Shipped",
  closed: "Closed",
};

function Tag({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <Box
      component="span"
      sx={{ px: 0.85, py: 0.2, borderRadius: 1, fontSize: 12, fontWeight: 800, color, bgcolor: bg, whiteSpace: "nowrap" }}
    >
      {children}
    </Box>
  );
}

export function FeedbackTab() {
  const client = useQueryClient();
  const [kind, setKind] = useState<Kind | "all">("all");
  const [status, setStatus] = useState<Status | "open" | "all">("open");
  const feedback = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => (await api.get<Row[]>("/admin/feedback")).data,
    refetchInterval: 60_000,
  });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      api.patch(`/admin/feedback/${id}`, { status }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });
  const triage = useMutation({
    mutationFn: (id: string) => api.post(`/admin/feedback/${id}/triage`),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });
  const insights = useMutation({
    mutationFn: async () => (await api.post<Insights>("/admin/feedback/insights")).data,
  });

  const rows = useMemo(() => {
    const list = (feedback.data || []).filter(
      (row) =>
        (kind === "all" || row.kind === kind) &&
        (status === "all" ||
          (status === "open" ? row.status === "new" || row.status === "planned" : row.status === status)),
    );
    // Open items: most severe first, then newest. Otherwise newest first.
    if (status === "open")
      list.sort(
        (a, b) =>
          severityRank[a.ai?.severity || "medium"] - severityRank[b.ai?.severity || "medium"] ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return list;
  }, [feedback.data, kind, status]);

  const all = feedback.data || [];
  const open = all.filter((row) => row.status === "new" || row.status === "planned");
  const counts = {
    newCount: all.filter((row) => row.status === "new").length,
    bugs: open.filter((row) => row.kind === "bug").length,
    ideas: open.filter((row) => row.kind === "feature").length,
    urgent: open.filter((row) => row.ai && severityRank[row.ai.severity] <= 1).length,
  };

  if (feedback.isLoading) return <CircularProgress />;
  if (feedback.isError) return <Alert severity="error">{errorMessage(feedback.error)}</Alert>;

  return (
    <Stack gap={2.5}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
        {[
          ["New", counts.newCount],
          ["Open bugs", counts.bugs],
          ["Open ideas", counts.ideas],
          ["High or critical", counts.urgent],
        ].map(([label, value]) => (
          <Box key={label} sx={{ p: 2, borderRadius: 2, border: "1px solid var(--line)", bgcolor: "var(--surface)" }}>
            <Typography sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.75}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "var(--panel)", color: "#fff" }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} alignItems={{ sm: "center" }}>
          <Box flex={1}>
            <Typography fontWeight={800}>What should I work on next?</Typography>
            <Typography variant="body2" sx={{ color: "#b9b7af" }}>
              AI groups every open bug and idea into themes, ranked by severity and how many people asked.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={insights.isPending ? <CircularProgress size={16} /> : <AutoAwesomeRounded />}
            disabled={insights.isPending || !open.length}
            onClick={() => insights.mutate()}
            sx={{ bgcolor: "var(--acid)", color: "var(--on-accent)", flexShrink: 0 }}
          >
            {insights.isPending ? "Analysing…" : insights.data ? "Analyse again" : "Analyse with AI"}
          </Button>
        </Stack>
        {insights.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage(insights.error)}
          </Alert>
        )}
        {insights.data && (
          <Box mt={2.5}>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{insights.data.headline}</Typography>
            <Typography sx={{ mt: 1, color: "var(--acid)", fontWeight: 700 }}>
              Fix first: {insights.data.fixFirst}
            </Typography>
            <Box component="ol" sx={{ m: 0, mt: 2, pl: 2.5, display: "grid", gap: 1.5 }}>
              {insights.data.themes.map((theme) => (
                <li key={theme.title}>
                  <Typography fontWeight={800}>
                    {theme.title}{" "}
                    <Box component="span" sx={{ color: "#b9b7af", fontWeight: 600 }}>
                      {theme.kind === "bug" ? "bugs" : theme.kind === "feature" ? "ideas" : "bugs and ideas"}, {theme.count}
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#d5d2ca" }}>
                    {theme.detail}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#d5d2ca", mt: 0.25 }}>
                    Next: {theme.action}
                  </Typography>
                </li>
              ))}
            </Box>
            <Typography variant="body2" sx={{ color: "#8f8d86", mt: 2 }}>
              Based on {insights.data.analysed} open items.
            </Typography>
          </Box>
        )}
      </Box>

      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <TextField select size="small" label="Type" value={kind} onChange={(e) => setKind(e.target.value as Kind | "all")} sx={{ minWidth: 150 }}>
          <MenuItem value="all">Bugs and ideas</MenuItem>
          <MenuItem value="bug">Bugs</MenuItem>
          <MenuItem value="feature">Ideas</MenuItem>
        </TextField>
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value as Status | "open" | "all")} sx={{ minWidth: 150 }}>
          <MenuItem value="open">Open (most severe first)</MenuItem>
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="planned">Planned</MenuItem>
          <MenuItem value="done">Shipped</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
          <MenuItem value="all">Everything</MenuItem>
        </TextField>
      </Stack>

      {!rows.length && (
        <Box sx={{ textAlign: "center", py: 6, color: "var(--muted)" }}>
          <Typography fontWeight={800} color="var(--ink)">
            {all.length ? "Nothing here" : "No feedback yet"}
          </Typography>
          <Typography variant="body2" mt={0.5}>
            {all.length
              ? "Try another filter."
              : "Users send bugs and ideas from their account menu, Report a bug or idea."}
          </Typography>
        </Box>
      )}

      <Stack gap={1.25}>
        {rows.map((row) => (
          <Box
            key={row.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: row.status === "new" ? "1px solid var(--line-strong)" : "1px solid var(--line)",
              bgcolor: row.status === "new" ? "var(--surface)" : "transparent",
            }}
          >
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Tag color="var(--ink)" bg={row.kind === "bug" ? "var(--tint-danger)" : "var(--tint-blue)"}>
                {row.kind === "bug" ? "Bug" : "Idea"}
              </Tag>
              {row.ai && (
                <>
                  <Tag {...severityStyle[row.ai.severity]}>{row.ai.severity}</Tag>
                  <Tag color="var(--ink-soft)" bg="var(--surface-2)">
                    {row.ai.area}
                  </Tag>
                  {row.ai.sentiment === "frustrated" && (
                    <Tag color="var(--orange-ink)" bg="var(--tint-orange)">
                      frustrated
                    </Tag>
                  )}
                </>
              )}
              <Box flex={1} />
              <Typography variant="body2" color="text.secondary">
                {formatDistanceToNow(new Date(row.createdAt))} ago
              </Typography>
              <TextField
                select
                size="small"
                value={row.status}
                disabled={update.isPending && update.variables?.id === row.id}
                onChange={(e) => update.mutate({ id: row.id, status: e.target.value as Status })}
                slotProps={{ htmlInput: { "aria-label": "Status" } }}
                sx={{ minWidth: 120, "& .MuiSelect-select": { py: 0.5 } }}
              >
                {(Object.keys(statusLabel) as Status[]).map((key) => (
                  <MenuItem key={key} value={key}>
                    {statusLabel[key]}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Typography fontWeight={800} mt={1} className="wrap-anywhere">
              {row.ai?.title || row.message.slice(0, 90)}
            </Typography>
            {row.ai && (
              <>
                <Typography variant="body2" mt={0.5} sx={{ color: "var(--ink-soft)" }}>
                  {row.ai.summary}
                </Typography>
                <Typography variant="body2" mt={0.5} sx={{ color: "var(--ink-soft)" }}>
                  <strong>Next step:</strong> {row.ai.suggestedAction}
                </Typography>
              </>
            )}
            <Box
              component="details"
              open={!row.ai}
              sx={{ mt: 1, "& summary": { cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--muted)" } }}
            >
              <summary>What they wrote</summary>
              <Typography
                variant="body2"
                className="wrap-anywhere"
                sx={{ mt: 0.75, pl: 1.5, borderLeft: "3px solid var(--line-strong)", whiteSpace: "pre-line" }}
              >
                {row.message}
              </Typography>
            </Box>
            <Stack direction="row" gap={1.5} mt={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                {row.userName || "Deleted user"}
                {row.userEmail ? ` <${row.userEmail}>` : ""}
                {row.page ? `, on ${row.page}` : ""}
              </Typography>
              {row.userEmail && (
                <ButtonBase
                  component="a"
                  href={`mailto:${row.userEmail}?subject=${encodeURIComponent(`Re: ${row.ai?.title || "your feedback on Danto"}`)}`}
                  sx={{ fontSize: 14, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  Reply
                </ButtonBase>
              )}
              {!row.ai && (
                <Button
                  size="small"
                  startIcon={<AutoAwesomeRounded fontSize="small" />}
                  disabled={triage.isPending}
                  onClick={() => triage.mutate(row.id)}
                  sx={{ px: 0.5 }}
                >
                  {triage.isPending && triage.variables === row.id ? "Analysing…" : "Analyse"}
                </Button>
              )}
              {triage.isError && triage.variables === row.id && (
                <Typography variant="body2" color="error">
                  {errorMessage(triage.error)}
                </Typography>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
