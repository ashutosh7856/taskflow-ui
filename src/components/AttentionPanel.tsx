import CloseRounded from "@mui/icons-material/CloseRounded";
import { Box, Button, ButtonBase, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type Kind = "blocked" | "late" | "changes" | "waiting";

type Item = {
  cardId: string;
  title: string;
  boardId: string;
  boardName: string;
  listName: string;
  kind: Kind;
  reason: string | null;
  blockedOn: "client" | "team" | "other" | null;
  since: string | null;
  dueDate: string | null;
  late: boolean;
  assignees: string[];
};

type Attention = { counts: Record<Kind, number>; items: Item[] };

const kinds: Record<Kind, { label: string; color: string; bg: string }> = {
  blocked: { label: "Blocked", color: "var(--danger-ink)", bg: "var(--tint-danger)" },
  late: { label: "Late", color: "var(--warn-ink)", bg: "var(--tint-warn)" },
  changes: { label: "Changes asked", color: "#c2410c", bg: "var(--tint-orange)" },
  waiting: { label: "Waiting on client", color: "var(--ink-soft)", bg: "var(--surface-3)" },
};

function age(iso: string | null) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? "today" : `${days}d`;
}

function detail(item: Item) {
  if (item.kind === "blocked")
    return `${item.blockedOn === "other" ? "Waiting on someone else" : "Team"}: ${item.reason}`;
  if (item.kind === "late") return item.reason || "No reason given yet";
  if (item.kind === "changes") return "Client asked for changes";
  return item.reason === "Approval" ? "Approval requested" : `Needs: ${item.reason}`;
}

/**
 * What a manager checks first: blocked and late work with the reasons,
 * client change requests, and anything waiting on a client.
 */
export function AttentionPanel({ workspaceId }: { workspaceId: string }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Kind | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const attention = useQuery({
    queryKey: ["attention", workspaceId],
    queryFn: async () =>
      (await api.get<Attention>(`/workspaces/${workspaceId}/attention`)).data,
    refetchInterval: 60_000,
  });
  const storageKey = `danto-attention-closed:${workspaceId}`;
  const [closed, setClosed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });
  const data = attention.data;
  if (!data || !data.items.length) return null;
  const keys = data.items.map((item) => `${item.kind}:${item.cardId}`);
  // Closed stays closed until something new needs attention.
  if (keys.every((key) => closed.includes(key))) return null;
  const close = () => {
    setClosed(keys);
    try {
      localStorage.setItem(storageKey, JSON.stringify(keys));
    } catch {
      /* private mode: closes for this visit only */
    }
  };
  const items = data.items.filter((item) => filter === "all" || item.kind === filter);
  const shown = expanded ? items : items.slice(0, 5);

  return (
    <Box
      component="section"
      aria-label="Needs attention"
      sx={{
        mb: 3,
        border: "1px solid var(--line-strong)",
        borderRadius: 3,
        bgcolor: "var(--surface)",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
        sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid var(--line)" }}
      >
        <Typography fontWeight={800} sx={{ mr: 1 }}>
          Needs attention
        </Typography>
        {(["all", ...(Object.keys(kinds) as Kind[])] as const).map((key) => {
          const count =
            key === "all" ? data.items.length : data.counts[key];
          if (key !== "all" && !count) return null;
          const on = filter === key;
          return (
            <ButtonBase
              key={key}
              onClick={() => {
                setFilter(key);
                setExpanded(false);
              }}
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 700,
                border: "1px solid var(--line-strong)",
                bgcolor: on ? "var(--selected-bg)" : "transparent",
                color: on ? "var(--selected-fg)" : "var(--ink-soft)",
              }}
            >
              {key === "all" ? "All" : kinds[key].label} {count}
            </ButtonBase>
          );
        })}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Hide until something new comes up">
          <IconButton size="small" aria-label="Close Needs attention" onClick={close}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {shown.map((item) => (
          <Box component="li" key={`${item.kind}-${item.cardId}`}>
            <ButtonBase
              onClick={() => navigate(`/boards/${item.boardId}?card=${item.cardId}`)}
              sx={{
                width: "100%",
                textAlign: "left",
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", sm: "130px 1fr auto" },
                gap: { xs: 0.5, sm: 2 },
                alignItems: "start",
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid var(--line)",
                "&:hover": { bgcolor: "var(--hover)" },
              }}
            >
              <Box
                component="span"
                sx={{
                  justifySelf: "start",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 800,
                  color: kinds[item.kind].color,
                  bgcolor: kinds[item.kind].bg,
                  gridColumn: { xs: "1 / 2", sm: "auto" },
                }}
              >
                {kinds[item.kind].label}
              </Box>
              <Box sx={{ minWidth: 0, gridColumn: { xs: "1 / -1", sm: "auto" }, gridRow: { xs: 2, sm: "auto" } }}>
                <Typography fontWeight={700} className="wrap-anywhere">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.boardName}, {item.listName}
                  {item.assignees.length ? `. ${item.assignees.join(", ")}` : ""}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.25,
                    color: item.kind === "late" && !item.reason ? "var(--muted)" : "var(--ink-soft)",
                    fontStyle: item.kind === "late" && !item.reason ? "italic" : "normal",
                  }}
                >
                  {detail(item)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ gridRow: { xs: 1, sm: "auto" }, gridColumn: { xs: "2 / 3", sm: "auto" } }}
              >
                {item.kind === "late" ? `${age(item.dueDate)} late` : age(item.since)}
              </Typography>
            </ButtonBase>
          </Box>
        ))}
      </Box>
      {items.length > 5 && (
        <Button onClick={() => setExpanded(!expanded)} sx={{ m: 1 }}>
          {expanded ? "Show less" : `Show all ${items.length}`}
        </Button>
      )}
    </Box>
  );
}
