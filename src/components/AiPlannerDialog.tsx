import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import SummarizeRounded from "@mui/icons-material/SummarizeRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, errorMessage } from "../lib/api";

interface GeneratedPlan {
  projectName: string;
  overview: string;
  lists: Array<{
    name: string;
    tasks: Array<{
      title: string;
      description: string;
      priority: "low" | "medium" | "high";
      category: string;
      dueOffsetDays: number;
    }>;
  }>;
}

interface AiUsage {
  used: number;
  limit: number | null;
  plan: string;
}

const sourceTypes = [
  {
    value: "brief",
    label: "Project brief",
    detail: "Turn a goal, deadline, and constraints into an execution board.",
    placeholder:
      "Paste the project goal, deadline, constraints, people involved, and expected outcome…",
  },
  {
    value: "meeting_notes",
    label: "Meeting notes",
    detail: "Extract decisions, owners, follow-ups, risks, and due work.",
    placeholder:
      "Paste raw meeting notes or a transcript. Danto will find decisions and follow-up work…",
  },
  {
    value: "pull_request",
    label: "PR / commit log",
    detail: "Create release, QA, documentation, and follow-up tasks.",
    placeholder:
      "Paste a pull request description, git log, or commit messages here…",
  },
  {
    value: "content_calendar",
    label: "Creator content plan",
    detail: "Build creation, approval, repurposing, and publishing tasks.",
    placeholder:
      "Paste content ideas, channels, dates, campaign notes, or an existing calendar…",
  },
  {
    value: "email",
    label: "Email or client request",
    detail: "Separate requirements, questions, deliverables, and next actions.",
    placeholder:
      "Paste an email thread or client request. Remove anything sensitive first…",
  },
] as const;

interface ExecutiveUpdate {
  overallStatus: "on_track" | "at_risk" | "off_track" | "unknown";
  executiveSummary: string;
  progressHighlights: string[];
  risks: string[];
  nextActions: string[];
}

interface ExecutiveDocument {
  boardName: string;
  generatedAt: string;
  metrics: {
    total: number;
    completed: number;
    active: number;
    overdue: number;
    highPriority: number;
  };
}

export function AiPlannerDialog({
  open,
  boardId,
  onClose,
}: {
  open: boolean;
  boardId: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"plan" | "summary">("plan");
  const [sourceType, setSourceType] =
    useState<(typeof sourceTypes)[number]["value"]>("brief");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [summary, setSummary] = useState<ExecutiveUpdate | null>(null);
  const [document, setDocument] = useState<ExecutiveDocument | null>(null);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const selectedSource = sourceTypes.find(
    (source) => source.value === sourceType,
  )!;
  const client = useQueryClient();
  const generate = useMutation({
    mutationFn: async () =>
      (await api.post(`/boards/${boardId}/ai/plan`, { prompt, sourceType }))
        .data as {
        plan: GeneratedPlan;
        usage: AiUsage;
      },
    onSuccess: (data) => {
      setPlan(data.plan);
      setUsage(data.usage);
    },
  });
  const summarize = useMutation({
    mutationFn: async () =>
      (await api.get(`/boards/${boardId}/ai/summary`)).data as {
        summary: ExecutiveUpdate;
        document: ExecutiveDocument;
        usage: AiUsage;
      },
    onSuccess: (data) => {
      setSummary(data.summary);
      setDocument(data.document);
      setUsage(data.usage);
    },
  });
  const apply = useMutation({
    mutationFn: () => api.post(`/boards/${boardId}/ai/apply`, plan),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["board", boardId] });
      onClose();
      setPlan(null);
      setPrompt("");
    },
  });
  const error = generate.error || summarize.error || apply.error;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "#fffef9",
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#181817",
          color: "#fff",
          p: { xs: 2.5, sm: 3.5 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 210,
            height: 210,
            border: "1px solid rgba(216,255,99,.45)",
            borderRadius: "50%",
            right: -50,
            top: -120,
          }}
        />
        <Stack
          direction="row"
          alignItems="flex-start"
          gap={2}
          sx={{ position: "relative" }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              bgcolor: "#d8ff63",
              color: "#181817",
              borderRadius: 2,
            }}
          >
            <AutoAwesomeRounded />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
              Create from existing material
            </Typography>
            <Typography variant="h4" mt={0.5}>
              Move from idea to execution.
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseRounded />
          </IconButton>
        </Stack>
      </Box>
      <Tabs
        value={mode}
        onChange={(_, value) => setMode(value)}
        sx={{ px: 3, borderBottom: "1px solid #d4d0c5" }}
      >
        <Tab
          value="plan"
          icon={<BoltRounded />}
          iconPosition="start"
          label="Build a plan"
        />
        <Tab
          value="summary"
          icon={<SummarizeRounded />}
          iconPosition="start"
          label="Executive update"
        />
      </Tabs>
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {usage && (
          <Alert
            severity={
              usage.limit !== null && usage.used >= usage.limit
                ? "warning"
                : "info"
            }
            sx={{ mb: 2 }}
          >
            {usage.limit === null
              ? `${usage.used} AI actions used this period · unlimited on the Team plan.`
              : `${usage.used} of ${usage.limit} AI actions used this period on the ${usage.plan} plan.`}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage(error)}
          </Alert>
        )}
        {mode === "plan" ? (
          <Stack spacing={3}>
            <Box>
              <Typography fontWeight={800} mb={0.5}>
                Paste the messy source. Get an execution plan.
              </Typography>
              <Typography color="text.secondary">
                Danto extracts concrete work from a brief, meeting, email, pull
                request, commit log, or content plan. You review the board
                before anything is created.
              </Typography>
            </Box>
            <Box className="ai-source-grid">
              {sourceTypes.map((source) => (
                <Box
                  component="button"
                  type="button"
                  key={source.value}
                  className={`ai-source-option ${sourceType === source.value ? "selected" : ""}`}
                  onClick={() => setSourceType(source.value)}
                >
                  <Typography fontWeight={850} fontSize={14}>
                    {source.label}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary" mt={0.5}>
                    {source.detail}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              {[
                "1. Paste source",
                "2. Review AI plan",
                "3. Apply to board",
              ].map((step) => (
                <Chip key={step} label={step} size="small" variant="outlined" />
              ))}
            </Stack>
            <TextField
              multiline
              minRows={4}
              fullWidth
              placeholder={selectedSource.placeholder}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <Button
              variant="contained"
              startIcon={
                generate.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AutoAwesomeRounded />
                )
              }
              disabled={prompt.trim().length < 12 || generate.isPending}
              onClick={() => generate.mutate()}
            >
              {plan ? "Regenerate plan" : "Turn source into a board"}
            </Button>
            {plan && (
              <Box className="ai-plan-preview">
                <Typography className="mono-label" color="text.secondary">
                  Preview — nothing created yet
                </Typography>
                <Typography variant="h5" mt={1}>
                  {plan.projectName}
                </Typography>
                <Typography color="text.secondary" mt={0.5}>
                  {plan.overview}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 1.5,
                    mt: 3,
                  }}
                >
                  {plan.lists.map((list) => (
                    <Box
                      key={list.name}
                      sx={{
                        bgcolor: "#eeebe2",
                        border: "1px solid #d4d0c5",
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={1.5}
                      >
                        <Typography fontWeight={800}>{list.name}</Typography>
                        <Typography
                          className="mono-label"
                          color="text.secondary"
                        >
                          {list.tasks.length}
                        </Typography>
                      </Stack>
                      <Stack spacing={1}>
                        {list.tasks.map((task) => (
                          <Box
                            key={task.title}
                            sx={{
                              bgcolor: "#fffef9",
                              p: 1.25,
                              borderRadius: 1.5,
                              border: "1px solid #ddd9cf",
                            }}
                          >
                            <Typography fontSize={14} fontWeight={700}>
                              {task.title}
                            </Typography>
                            <Chip
                              size="small"
                              label={task.priority}
                              sx={{
                                mt: 0.75,
                                height: 20,
                                fontSize: 10,
                                bgcolor:
                                  task.priority === "high"
                                    ? "#ffd8cf"
                                    : task.priority === "medium"
                                      ? "#fff1b8"
                                      : "#dff3d1",
                              }}
                            />
                            <Typography
                              className="mono-label"
                              color="text.secondary"
                              sx={{ mt: 0.75, textTransform: "uppercase" }}
                            >
                              {task.category}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  gap={2}
                  mt={3}
                >
                  <Typography color="text.secondary" fontSize={13}>
                    {plan.lists.length} lists ·{" "}
                    {plan.lists.reduce(
                      (total, list) => total + list.tasks.length,
                      0,
                    )}{" "}
                    cards
                  </Typography>
                  <Button
                    variant="contained"
                    disabled={apply.isPending}
                    onClick={() => apply.mutate()}
                  >
                    {apply.isPending ? "Creating board…" : "Create this plan"}
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography fontWeight={800} mb={0.5}>
                A stakeholder-ready status update
              </Typography>
              <Typography color="text.secondary">
                AI reads the current board structure, deadlines, and task
                state—then drafts progress, risks, and next actions without
                inventing data.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={
                summarize.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SummarizeRounded />
                )
              }
              disabled={summarize.isPending}
              onClick={() => summarize.mutate()}
            >
              {summary ? "Refresh update" : "Generate executive update"}
            </Button>
            {summary && (
              <Box
                sx={{
                  bgcolor: "#181817",
                  color: "#fff",
                  borderRadius: 3,
                  p: { xs: 2.5, sm: 3.5 },
                  boxShadow: "5px 5px 0 #ff5c35",
                }}
              >
                <Typography
                  className="mono-label"
                  sx={{ color: "#d8ff63", mb: 2 }}
                >
                  Live board brief
                </Typography>
                {document && (
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="h5">{document.boardName}</Typography>
                      <Typography sx={{ color: "#aaa8a1", fontSize: 13 }}>
                        Generated{" "}
                        {new Date(document.generatedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Chip
                        label={summary.overallStatus.replaceAll("_", " ")}
                        sx={{
                          bgcolor: statusColor(summary.overallStatus),
                          color: "#181817",
                          textTransform: "capitalize",
                          fontWeight: 800,
                        }}
                      />
                      <Chip
                        label={`${document.metrics.completed} of ${document.metrics.total} completed`}
                        sx={{ bgcolor: "#343430", color: "#fff" }}
                      />
                      <Chip
                        label={`${document.metrics.overdue} overdue`}
                        sx={{ bgcolor: "#343430", color: "#fff" }}
                      />
                    </Stack>
                    <DocumentSection
                      title="Executive summary"
                      text={summary.executiveSummary}
                    />
                    <DocumentList
                      title="Progress highlights"
                      items={summary.progressHighlights}
                      empty="No confirmed progress highlights are available yet."
                    />
                    <DocumentList
                      title="Risks and blockers"
                      items={summary.risks}
                      empty="No confirmed risks or blockers are recorded."
                    />
                    <DocumentList
                      title="Next actions"
                      items={summary.nextActions}
                      empty="No specific next actions can be confirmed from the board."
                    />
                  </Stack>
                )}
                <Button
                  sx={{ color: "#fff", mt: 2 }}
                  disabled={!document}
                  onClick={() =>
                    document &&
                    navigator.clipboard.writeText(
                      formatExecutiveDocument(summary, document),
                    )
                  }
                >
                  Copy clean document
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

function statusColor(status: ExecutiveUpdate["overallStatus"]) {
  if (status === "on_track") return "#d8ff63";
  if (status === "at_risk") return "#ffd166";
  if (status === "off_track") return "#ff8b73";
  return "#d4d0c5";
}

function DocumentSection({ title, text }: { title: string; text: string }) {
  return (
    <Box>
      <Typography className="mono-label" sx={{ color: "#d8ff63", mb: 0.75 }}>
        {title}
      </Typography>
      <Typography sx={{ lineHeight: 1.75 }}>{text}</Typography>
    </Box>
  );
}

function DocumentList({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <Box>
      <Typography className="mono-label" sx={{ color: "#d8ff63", mb: 0.75 }}>
        {title}
      </Typography>
      <Stack spacing={0.75}>
        {(items.length ? items : [empty]).map((item, index) => (
          <Typography key={`${item}-${index}`} sx={{ lineHeight: 1.65 }}>
            {items.length ? `${index + 1}. ` : ""}
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

function formatExecutiveDocument(
  summary: ExecutiveUpdate,
  document: ExecutiveDocument,
) {
  const numbered = (items: string[], fallback: string) =>
    (items.length ? items : [fallback])
      .map((item, index) => (items.length ? `${index + 1}. ${item}` : item))
      .join("\n");
  return [
    "EXECUTIVE PROJECT UPDATE",
    document.boardName,
    `Generated: ${new Date(document.generatedAt).toLocaleString()}`,
    `Overall status: ${summary.overallStatus.replaceAll("_", " ")}`,
    `Tasks: ${document.metrics.total} total; ${document.metrics.completed} completed; ${document.metrics.active} active; ${document.metrics.overdue} overdue; ${document.metrics.highPriority} high priority`,
    "",
    "EXECUTIVE SUMMARY",
    summary.executiveSummary,
    "",
    "PROGRESS HIGHLIGHTS",
    numbered(
      summary.progressHighlights,
      "No confirmed progress highlights are available yet.",
    ),
    "",
    "RISKS AND BLOCKERS",
    numbered(summary.risks, "No confirmed risks or blockers are recorded."),
    "",
    "NEXT ACTIONS",
    numbered(
      summary.nextActions,
      "No specific next actions can be confirmed from the board.",
    ),
  ].join("\n");
}
