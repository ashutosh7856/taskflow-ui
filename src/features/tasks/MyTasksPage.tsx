import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import {
  Alert,
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../../lib/api";
import { myTasksKey, useMyTasks, type MyTask } from "../../lib/tasks";

type Group = { key: string; title: string; tone?: string; tasks: MyTask[] };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Overdue / Today / This week / Later / No date, then Done this week. */
function groupTasks(tasks: MyTask[]): Group[] {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getTime() + 864e5);
  const weekEnd = new Date(today.getTime() + 7 * 864e5);
  const groups: Group[] = [
    { key: "overdue", title: "Overdue", tone: "#b42318", tasks: [] },
    { key: "today", title: "Today", tone: "#8a4b00", tasks: [] },
    { key: "week", title: "Next 7 days", tasks: [] },
    { key: "later", title: "Later", tasks: [] },
    { key: "none", title: "No date", tasks: [] },
    { key: "done", title: "Done this week", tasks: [] },
  ];
  const by = Object.fromEntries(groups.map((group) => [group.key, group]));
  for (const task of tasks) {
    if (task.isCompleted) {
      by.done.tasks.push(task);
      continue;
    }
    if (!task.dueDate) {
      by.none.tasks.push(task);
      continue;
    }
    const due = new Date(task.dueDate);
    if (due < today) by.overdue.tasks.push(task);
    else if (due < tomorrow) by.today.tasks.push(task);
    else if (due < weekEnd) by.week.tasks.push(task);
    else by.later.tasks.push(task);
  }
  by.done.tasks.sort(
    (a, b) =>
      new Date(b.completedAt || 0).getTime() -
      new Date(a.completedAt || 0).getTime(),
  );
  return groups.filter((group) => group.tasks.length);
}

function dueText(task: MyTask) {
  if (!task.dueDate) return null;
  const due = new Date(task.dueDate);
  const days = Math.round(
    (startOfDay(due).getTime() - startOfDay(new Date()).getTime()) / 864e5,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${-days} days late`;
  return due.toLocaleDateString(undefined, {
    weekday: days < 7 ? "short" : undefined,
    month: "short",
    day: "numeric",
  });
}

export function MyTasksPage() {
  const tasks = useMyTasks();
  const client = useQueryClient();
  const [workspace, setWorkspace] = useState<string>("all");
  const toggle = useMutation({
    mutationFn: (task: MyTask) =>
      api.patch(`/cards/${task.id}`, { isCompleted: !task.isCompleted }),
    onMutate: async (task) => {
      await client.cancelQueries({ queryKey: myTasksKey });
      const previous = client.getQueryData<MyTask[]>(myTasksKey);
      client.setQueryData<MyTask[]>(myTasksKey, (current) =>
        current?.map((item) =>
          item.id === task.id
            ? {
                ...item,
                isCompleted: !task.isCompleted,
                completedAt: task.isCompleted ? null : new Date().toISOString(),
              }
            : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _task, context) =>
      client.setQueryData(myTasksKey, context?.previous),
    onSettled: (_data, _error, task) => {
      client.invalidateQueries({ queryKey: myTasksKey });
      client.invalidateQueries({ queryKey: ["board", task.boardId] });
    },
  });

  const workspaces = useMemo(() => {
    const seen = new Map<string, string>();
    for (const task of tasks.data || [])
      seen.set(task.workspaceId, task.workspaceName);
    return [...seen];
  }, [tasks.data]);
  const visible = (tasks.data || []).filter(
    (task) => workspace === "all" || task.workspaceId === workspace,
  );
  const groups = groupTasks(visible);
  const open = visible.filter((task) => !task.isCompleted).length;

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 4, md: 7 }, px: { xs: 2, sm: 3 } }}
    >
      <Typography className="mono-label" color="text.secondary">
        Assigned to you
      </Typography>
      <Typography
        component="h1"
        className="display-type"
        sx={{ fontSize: { xs: 40, md: 56 }, lineHeight: 1, mt: 1 }}
      >
        My tasks
      </Typography>
      <Typography color="text.secondary" mt={1.5}>
        {tasks.isSuccess
          ? `${open} open across every workspace and board you're on.`
          : "Everything assigned to you, across every workspace and board."}
      </Typography>

      {workspaces.length > 1 && (
        <Stack direction="row" gap={1} mt={3} flexWrap="wrap">
          {[["all", "All workspaces"] as const, ...workspaces].map(
            ([id, name]) => (
              <Chip
                key={id}
                label={name}
                clickable
                onClick={() => setWorkspace(id)}
                sx={{
                  fontWeight: 750,
                  bgcolor: workspace === id ? "#181817" : "#e8e5dc",
                  color: workspace === id ? "#fff" : "#4b4842",
                  "&:hover": {
                    bgcolor: workspace === id ? "#181817" : "#dcd8cc",
                  },
                }}
              />
            ),
          )}
        </Stack>
      )}

      {tasks.isLoading && (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      )}
      {tasks.error != null && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {errorMessage(tasks.error)}
        </Alert>
      )}
      {toggle.error != null && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {errorMessage(toggle.error)}
        </Alert>
      )}
      {tasks.isSuccess && !groups.length && (
        <Box
          sx={{
            mt: 4,
            p: { xs: 3, md: 5 },
            border: "1px dashed #b9b7af",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <CheckCircleRounded sx={{ fontSize: 40, color: "#4f6c00" }} />
          <Typography variant="h6" mt={1}>
            Nothing assigned to you
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            When someone adds you to a card, or you add yourself, it shows up
            here.
          </Typography>
        </Box>
      )}

      {groups.map((group) => (
        <Box component="section" key={group.key} mt={4.5}>
          <Stack direction="row" alignItems="baseline" gap={1} mb={1.25}>
            <Typography
              component="h2"
              variant="h6"
              sx={{ color: group.tone || "inherit" }}
            >
              {group.title}
            </Typography>
            <Typography className="mono-label" color="text.secondary">
              {String(group.tasks.length).padStart(2, "0")}
            </Typography>
          </Stack>
          <Stack
            sx={{
              border: "1px solid #dedad0",
              borderRadius: 3,
              bgcolor: "#fffef9",
              overflow: "hidden",
            }}
          >
            {group.tasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                first={index === 0}
                onToggle={() => toggle.mutate(task)}
                tone={group.key === "overdue" ? "#b42318" : undefined}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Container>
  );
}

function TaskRow({
  task,
  first,
  tone,
  onToggle,
}: {
  task: MyTask;
  first: boolean;
  tone?: string;
  onToggle: () => void;
}) {
  const due = dueText(task);
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{
        borderTop: first ? "none" : "1px solid #ebe8df",
        pl: 0.5,
        pr: 2,
        "&:hover": { bgcolor: "#f7f5ee" },
      }}
    >
      <IconButton
        aria-label={task.isCompleted ? "Reopen" : "Mark done"}
        onClick={onToggle}
        sx={{ color: task.isCompleted ? "#4f6c00" : "#8a867c" }}
      >
        {task.isCompleted ? (
          <CheckCircleRounded />
        ) : (
          <RadioButtonUncheckedRounded />
        )}
      </IconButton>
      <ButtonBase
        component={Link}
        to={`/boards/${task.boardId}?card=${task.id}`}
        sx={{
          flex: 1,
          minWidth: 0,
          py: 1.5,
          justifyContent: "flex-start",
          textAlign: "left",
          color: "inherit",
          display: "flex",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={750}
            noWrap
            sx={{
              textDecoration: task.isCompleted ? "line-through" : "none",
              color: task.isCompleted ? "#8a867c" : "inherit",
            }}
          >
            {task.title}
          </Typography>
          <Typography fontSize={13} color="text.secondary" noWrap>
            {task.boardName} · {task.listName}
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              {" "}
              · {task.workspaceName}
            </Box>
          </Typography>
        </Box>
        <Stack
          direction="row"
          gap={0.75}
          alignItems="center"
          sx={{ flexShrink: 0 }}
        >
          {task.approvalStatus === "pending" && !task.isCompleted && (
            <Chip
              size="small"
              label="With client"
              sx={{
                bgcolor: "#fff1c2",
                fontWeight: 800,
                height: 22,
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
          )}
          {task.approvalStatus === "changes_requested" && !task.isCompleted && (
            <Chip
              size="small"
              label="Changes requested"
              sx={{
                bgcolor: "#ffe2dc",
                fontWeight: 800,
                height: 22,
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
          )}
          {(task.priority === "high" || task.priority === "urgent") &&
            !task.isCompleted && (
              <Typography
                className="mono-label"
                sx={{
                  color: task.priority === "urgent" ? "#b42318" : "#8a4b00",
                  display: { xs: "none", sm: "block" },
                }}
              >
                {task.priority}
              </Typography>
            )}
          {due && !task.isCompleted && (
            <Typography
              fontSize={13}
              fontWeight={700}
              sx={{
                color: tone || "#4b4842",
                minWidth: 64,
                textAlign: "right",
              }}
            >
              {due}
            </Typography>
          )}
        </Stack>
      </ButtonBase>
    </Stack>
  );
}
