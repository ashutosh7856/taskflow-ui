import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api, errorMessage } from "../../lib/api";

interface CommandCenterData {
  workspace: { id: string; name: string };
  generatedAt: string;
  metrics: {
    boards: number;
    total: number;
    completed: number;
    active: number;
    overdue: number;
    highPriority: number;
    unassigned: number;
  };
  boards: Array<{
    id: string;
    name: string;
    workflow: string;
    total: number;
    completed: number;
    active: number;
    overdue: number;
    highPriority: number;
    unassigned: number;
  }>;
  contributors: Array<{
    userId: string;
    name: string;
    role: string;
    assigned: number;
    completed: number;
    active: number;
    overdue: number;
    sources: Array<{
      boardId: string;
      boardName: string;
      assigned: number;
      completed: number;
      active: number;
      overdue: number;
    }>;
  }>;
  brief: {
    overallHealth: "healthy" | "watch" | "at_risk" | "unknown";
    headline: string;
    executiveSummary: string;
    progressHighlights: string[];
    risks: string[];
    attentionNeeded: string[];
    ownershipOverview: string[];
  };
  usage: { used: number; limit: number | null; plan: string };
}

export function CommandCenterPage() {
  const { workspaceId = "" } = useParams();
  const report = useQuery({
    queryKey: ["workspace-command-center", workspaceId],
    queryFn: async () =>
      (
        await api.post<CommandCenterData>(
          `/workspaces/${workspaceId}/ai/command-center`,
        )
      ).data,
    enabled: Boolean(workspaceId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const data = report.data;

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, sm: 4 } }}
    >
      <Button component={Link} to="/app" startIcon={<ArrowBackRounded />}>
        All workspaces
      </Button>

      <Box className="command-center-hero">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          gap={3}
        >
          <Box>
            <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
              Workspace Pulse / AI briefing
            </Typography>
            <Typography
              className="display-type"
              sx={{ fontSize: { xs: 42, md: 68 }, lineHeight: 0.98, mt: 1.5 }}
            >
              {data?.workspace.name || "Workspace Pulse"}
            </Typography>
            <Typography sx={{ color: "#b9b7af", maxWidth: 720, mt: 2 }}>
              One evidence-backed view of delivery health, risks, ownership, and
              recent contributions across every board in this workspace.
            </Typography>
          </Box>
          <Stack
            alignItems={{ md: "flex-end" }}
            justifyContent="space-between"
            gap={2}
          >
            <Chip
              icon={<AutoAwesomeRounded />}
              label="Team plan"
              sx={{ bgcolor: "#d8ff63", color: "#181817", fontWeight: 800 }}
            />
            {data && (
              <Button
                variant="contained"
                startIcon={<RefreshRounded />}
                disabled={report.isFetching}
                onClick={() => report.refetch()}
                sx={{ bgcolor: "#fff", color: "#181817" }}
              >
                Refresh Pulse
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {report.isLoading && (
        <Stack alignItems="center" gap={2} py={10}>
          <CircularProgress />
          <Typography fontWeight={800}>Reading every board…</Typography>
          <Typography color="text.secondary">
            Danto is calculating exact metrics before writing the brief.
          </Typography>
        </Stack>
      )}
      {report.error && (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          action={
            <Button component={Link} to="/billing" color="inherit">
              View plans
            </Button>
          }
        >
          {errorMessage(report.error)}
        </Alert>
      )}

      {data && (
        <Stack spacing={3} mt={3}>
          <Box className="command-metric-grid">
            <Metric label="Boards" value={data.metrics.boards} />
            <Metric
              label="Completed"
              value={data.metrics.completed}
              accent="#d8ff63"
            />
            <Metric label="Active" value={data.metrics.active} />
            <Metric
              label="Overdue"
              value={data.metrics.overdue}
              accent="#ff8b73"
            />
            <Metric label="High priority" value={data.metrics.highPriority} />
            <Metric
              label="Unassigned"
              value={data.metrics.unassigned}
              accent="#ffd166"
            />
          </Box>

          <Box className="command-brief">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={2}
            >
              <Box>
                <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
                  Executive brief
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: 30, md: 42 }, mt: 1 }}
                >
                  {data.brief.headline}
                </Typography>
              </Box>
              <Chip
                label={data.brief.overallHealth.replaceAll("_", " ")}
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: healthColor(data.brief.overallHealth),
                  color: "#181817",
                  fontWeight: 850,
                  textTransform: "capitalize",
                }}
              />
            </Stack>
            <Typography sx={{ color: "#d5d2ca", lineHeight: 1.8, mt: 2 }}>
              {data.brief.executiveSummary}
            </Typography>
            <Box className="command-brief-grid">
              <BriefList
                title="Progress"
                items={data.brief.progressHighlights}
              />
              <BriefList title="Risks" items={data.brief.risks} warning />
              <BriefList
                title="Needs attention"
                items={data.brief.attentionNeeded}
              />
              <BriefList
                title="Assignment overview"
                items={data.brief.ownershipOverview}
              />
            </Box>
          </Box>

          <Box className="command-panel">
            <Typography className="mono-label" color="text.secondary">
              Board health
            </Typography>
            <Typography variant="h4" mt={1} mb={3}>
              Where delivery stands
            </Typography>
            <Box className="command-board-grid">
              {data.boards.map((board) => {
                const percent = board.total
                  ? Math.round((board.completed / board.total) * 100)
                  : 0;
                return (
                  <Box key={board.id} className="command-board-card">
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Box>
                        <Typography fontWeight={850}>{board.name}</Typography>
                        <Typography
                          className="mono-label"
                          color="text.secondary"
                        >
                          {board.workflow} · {board.total} cards
                        </Typography>
                      </Box>
                      <Typography fontWeight={850}>{percent}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{ height: 8, borderRadius: 8, my: 2 }}
                    />
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Chip size="small" label={`${board.active} active`} />
                      <Chip size="small" label={`${board.overdue} overdue`} />
                      <Chip
                        size="small"
                        label={`${board.unassigned} unassigned`}
                      />
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box className="command-panel">
            <Stack direction="row" alignItems="center" gap={1}>
              <GroupsRounded />
              <Typography variant="h4">Assignment overview</Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Current non-archived cards by assignee, including where the work
              comes from and whether it is done, active, or delayed.
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Box component="table" className="assignment-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Assigned</th>
                    <th>Done</th>
                    <th>Active</th>
                    <th>Delayed</th>
                    <th>Source boards</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contributors.map((person) => (
                    <tr key={person.userId}>
                      <td>
                        <strong>{person.name}</strong>
                        <span>{person.role}</span>
                      </td>
                      <td>{person.assigned}</td>
                      <td>{person.completed}</td>
                      <td>{person.active}</td>
                      <td>{person.overdue}</td>
                      <td>
                        <Stack spacing={0.75}>
                          {person.sources.length ? (
                            person.sources.map((source) => (
                              <Typography key={source.boardId} fontSize={12}>
                                <strong>{source.boardName}</strong> ·{" "}
                                {source.assigned} assigned, {source.completed}{" "}
                                done,
                                {source.overdue} delayed
                              </Typography>
                            ))
                          ) : (
                            <Typography fontSize={12} color="text.secondary">
                              No assigned cards
                            </Typography>
                          )}
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          </Box>

          <Typography color="text.secondary" fontSize={12} textAlign="center">
            Generated {new Date(data.generatedAt).toLocaleString()} · Current
            assignment state across non-archived cards
          </Typography>
        </Stack>
      )}
    </Container>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <Box
      className="command-metric"
      sx={{ borderTopColor: accent || "#181817" }}
    >
      <Typography className="display-type" fontSize={38}>
        {value}
      </Typography>
      <Typography className="mono-label" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function BriefList({
  title,
  items,
  warning = false,
}: {
  title: string;
  items: string[];
  warning?: boolean;
}) {
  return (
    <Box>
      <Stack direction="row" gap={1} alignItems="center" mb={1.5}>
        {warning ? <ErrorOutlineRounded /> : <CheckCircleRounded />}
        <Typography fontWeight={850}>{title}</Typography>
      </Stack>
      <Stack spacing={1}>
        {(items.length ? items : ["No evidence-backed items found."]).map(
          (item) => (
            <Typography key={item} sx={{ color: "#c7c4bc", lineHeight: 1.65 }}>
              {item}
            </Typography>
          ),
        )}
      </Stack>
    </Box>
  );
}

function healthColor(health: CommandCenterData["brief"]["overallHealth"]) {
  if (health === "healthy") return "#d8ff63";
  if (health === "watch") return "#ffd166";
  if (health === "at_risk") return "#ff8b73";
  return "#d4d0c5";
}
