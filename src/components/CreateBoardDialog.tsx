import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api, errorMessage } from "../lib/api";
import {
  useTemplates,
  type BoardTemplate,
  type ListRole,
} from "../lib/workflows";

export interface BoardDraft {
  lists: Array<{
    name: string;
    role: ListRole;
    tasks: Array<{
      title: string;
      description: string;
      priority: "low" | "medium" | "high";
      category: string;
      dueOffsetDays: number;
      labels: string[];
    }>;
  }>;
  labels: Array<{ name: string; color: string }>;
}

interface AiBoardDraft extends BoardDraft {
  name: string;
  template: string;
  summary: string;
}

export interface CreateBoardInput {
  name: string;
  template: string;
  draft?: BoardDraft;
}

const examples = [
  "Track my startup team: sales, tech and marketing. Everyone updates what they're working on and what's left.",
  "Website redesign for a bakery client. Homepage, menu page and online orders, launch in 4 weeks.",
  "Weekly social media posts for 2 clients. Each post needs the client's approval before it goes live.",
];

const roleHint: Record<ListRole, string> = {
  intake: "New",
  active: "Working",
  review: "Approval",
  done: "Done",
};

const groups: Array<{ id: BoardTemplate["group"]; title: string }> = [
  { id: "client", title: "Client work · portal-ready" },
  { id: "team", title: "Team & internal" },
];

export function CreateBoardDialog({
  open,
  workspaceId,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  workspaceId: string;
  pending?: boolean;
  error?: unknown;
  onClose: () => void;
  onSubmit: (value: CreateBoardInput) => void;
}) {
  const catalog = useTemplates();
  const [mode, setMode] = useState<"ai" | "template">("ai");
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("client");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState<AiBoardDraft | null>(null);
  const [aiName, setAiName] = useState("");
  const selected = catalog.data?.find((item) => item.id === template);
  const generate = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ draft: AiBoardDraft }>(
          `/workspaces/${workspaceId}/ai/board-draft`,
          { prompt: prompt.trim() },
        )
      ).data.draft,
    onSuccess: (value) => {
      setDraft(value);
      setAiName(value.name);
    },
  });
  const close = () => {
    setName("");
    setTemplate("client");
    setPrompt("");
    setDraft(null);
    setAiName("");
    generate.reset();
    onClose();
  };
  const draftTemplate = catalog.data?.find(
    (item) => item.id === draft?.template,
  );
  const labelColor = new Map(
    draft?.labels.map((label) => [label.name, label.color]),
  );
  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { bgcolor: "var(--surface)", borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontSize: 28, pb: 0 }}>Start a board</DialogTitle>
      <Tabs
        value={mode}
        onChange={(_, value) => setMode(value)}
        sx={{ px: 3, borderBottom: "1px solid var(--line)" }}
      >
        <Tab
          value="ai"
          label="Describe it"
          icon={<AutoAwesomeRounded fontSize="small" />}
          iconPosition="start"
          sx={{ minHeight: 48 }}
        />
        <Tab value="template" label="Pick a template" sx={{ minHeight: 48 }} />
      </Tabs>
      {mode === "ai" ? (
        <DialogContent sx={{ pt: "20px !important" }}>
          {!draft ? (
            <>
              <Typography color="text.secondary" mb={2}>
                Say what you want to track in your own words. AI sets up the
                stages, labels and first cards. You check it before anything is
                created.
              </Typography>
              <TextField
                autoFocus
                fullWidth
                multiline
                minRows={4}
                maxRows={10}
                label="What do you want to track?"
                placeholder="e.g. Track my team's sales and tech work in one place, with what's done and what's left"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                inputProps={{ maxLength: 4000 }}
              />
              <Typography fontSize={13} color="text.secondary" mt={2} mb={1}>
                Try an example
              </Typography>
              <Box sx={{ display: "grid", gap: 1 }}>
                {examples.map((example) => (
                  <Box
                    component="button"
                    type="button"
                    key={example}
                    onClick={() => setPrompt(example)}
                    sx={{
                      textAlign: "left",
                      font: "inherit",
                      fontSize: 14,
                      color: "inherit",
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid var(--line)",
                      bgcolor: "transparent",
                      cursor: "pointer",
                      "&:hover": { borderColor: "var(--ink)" },
                    }}
                  >
                    {example}
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Board name"
                value={aiName}
                onChange={(event) => setAiName(event.target.value)}
              />
              <Typography fontSize={14} color="text.secondary" mt={1.5}>
                {draft.summary}
                {draftTemplate && (
                  <>
                    {" "}
                    Based on the <strong>{draftTemplate.name}</strong> template.
                  </>
                )}
              </Typography>
              {draft.labels.length > 0 && (
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 2 }}
                >
                  {draft.labels.map((label) => (
                    <Box
                      key={label.name}
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.75,
                        px: 1.25,
                        py: 0.4,
                        borderRadius: 99,
                        fontSize: 13,
                        fontWeight: 700,
                        border: "1px solid var(--line)",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: label.color,
                        }}
                      />
                      {label.name}
                    </Box>
                  ))}
                </Box>
              )}
              <Box
                sx={{
                  display: "grid",
                  gridAutoFlow: { xs: "row", md: "column" },
                  gridAutoColumns: { md: "minmax(180px, 1fr)" },
                  gap: 1.25,
                  mt: 2,
                  overflowX: { md: "auto" },
                  pb: 1,
                }}
              >
                {draft.lists.map((list) => (
                  <Box
                    key={list.name}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "var(--surface-2)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <Typography fontWeight={800} fontSize={14}>
                      {list.name}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary" mb={1}>
                      {roleHint[list.role]}
                    </Typography>
                    {list.tasks.map((task) => (
                      <Box
                        key={task.title}
                        sx={{
                          bgcolor: "var(--surface)",
                          borderRadius: 1.5,
                          p: 1,
                          mb: 0.75,
                          fontSize: 13,
                          border: "1px solid var(--line)",
                        }}
                      >
                        {task.labels.length > 0 && (
                          <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
                            {task.labels.map((label) => (
                              <Box
                                key={label}
                                component="span"
                                title={label}
                                sx={{
                                  width: 28,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: labelColor.get(label),
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        {task.title}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
              <Typography fontSize={13} color="text.secondary" mt={1}>
                Nothing is created yet. After you create it, you can rename, add
                or remove anything.
              </Typography>
            </Box>
          )}
          {generate.error != null && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage(generate.error)}
            </Alert>
          )}
          {error != null && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage(error)}
            </Alert>
          )}
        </DialogContent>
      ) : (
        <DialogContent sx={{ pt: "20px !important" }}>
          <Typography color="text.secondary" mb={3}>
            Pick the kind of work. Each template comes with its own stages, card
            fields, starter checklists and client approval step.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Board name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {catalog.isLoading && (
            <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {catalog.error != null && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage(catalog.error)}
            </Alert>
          )}
          {groups.map((group) => {
            const items = catalog.data?.filter(
              (item) => item.group === group.id,
            );
            if (!items?.length) return null;
            return (
              <Box key={group.id}>
                <Typography
                  className="mono-label"
                  color="text.secondary"
                  mt={3}
                  mb={1.5}
                >
                  {group.title}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2,1fr)",
                      md: "repeat(3,1fr)",
                    },
                    gap: 1,
                  }}
                >
                  {items.map((item) => (
                    <Box
                      component="button"
                      type="button"
                      key={item.id}
                      aria-pressed={template === item.id}
                      onClick={() => setTemplate(item.id)}
                      sx={{
                        textAlign: "left",
                        p: 1.75,
                        borderRadius: 2,
                        font: "inherit",
                        color: "inherit",
                        border:
                          template === item.id
                            ? "2px solid var(--ink)"
                            : "1px solid var(--line)",
                        bgcolor:
                          template === item.id
                            ? "var(--tint-lime)"
                            : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <Typography fontWeight={800}>{item.name}</Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
          {selected && selected.lists.length > 0 && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2,
                border: "1px dashed #b9b7af",
              }}
            >
              <Typography fontSize={13} fontWeight={800} mb={0.75}>
                {selected.name}: stages
              </Typography>
              <Typography fontSize={14}>
                {selected.lists.map((list, index) => (
                  <Box
                    component="span"
                    key={list.name}
                    sx={{
                      fontWeight: list.role === "review" ? 800 : 400,
                      color:
                        list.role === "done" ? "var(--success-ink)" : "inherit",
                    }}
                  >
                    {index > 0 && " → "}
                    {list.name}
                  </Box>
                ))}
              </Typography>
              {selected.fields.length > 0 && (
                <Typography fontSize={13} color="text.secondary" mt={0.75}>
                  Card fields:{" "}
                  {selected.fields.map((field) => field.label).join(", ")}
                </Typography>
              )}
            </Box>
          )}
          {error != null && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage(error)}
            </Alert>
          )}
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        {mode === "template" ? (
          <Button
            variant="contained"
            disabled={!name.trim() || pending}
            onClick={() => onSubmit({ name: name.trim(), template })}
          >
            Create board
          </Button>
        ) : draft ? (
          <>
            <Button
              disabled={generate.isPending || pending}
              onClick={() => {
                setDraft(null);
                generate.reset();
              }}
            >
              Change description
            </Button>
            <Button
              variant="contained"
              disabled={!aiName.trim() || pending}
              onClick={() =>
                onSubmit({
                  name: aiName.trim(),
                  template: draft.template,
                  draft: { lists: draft.lists, labels: draft.labels },
                })
              }
            >
              {pending ? "Creating…" : "Create board"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={
              generate.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AutoAwesomeRounded />
              )
            }
            disabled={prompt.trim().length < 8 || generate.isPending}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? "Drafting your board…" : "Draft my board"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
