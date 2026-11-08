import AddRounded from "@mui/icons-material/AddRounded";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatedContent } from "../../components/bits/AnimatedContent";
import { SpotlightCard } from "../../components/bits/SpotlightCard";
import { CreateDialog } from "../../components/CreateDialog";
import { CreateBoardDialog } from "../../components/CreateBoardDialog";
import { WorkspaceSettingsDialog } from "../../components/WorkspaceSettingsDialog";
import { api, errorMessage } from "../../lib/api";
import type { Board, Workspace } from "../../types";

export function DashboardPage() {
  const [dialog, setDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  useEffect(() => {
    if (searchParams.get("create") === "workspace") setDialog(true);
  }, [searchParams]);
  const workspaces = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => (await api.get<Workspace[]>("/workspaces")).data,
  });
  const createWorkspace = useMutation({
    mutationFn: async (name: string) =>
      (await api.post<Workspace>("/workspaces", { name })).data,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["workspaces"] });
      setDialog(false);
      setSearchParams({});
    },
  });

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 4, md: 7 }, px: { xs: 2, sm: 4 } }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "190px minmax(0, 1fr)" },
          gap: { md: 5, lg: 8 },
        }}
      >
        <Box component="aside" sx={{ display: { xs: "none", md: "block" } }}>
          <Stack spacing={0.75} sx={{ position: "sticky", top: 110 }}>
            <Typography
              className="mono-label"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Navigate
            </Typography>
            <Button
              startIcon={<GridViewRounded />}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{
                justifyContent: "flex-start",
                bgcolor: "#181817",
                color: "#fff",
                "&:hover": { bgcolor: "#181817" },
              }}
            >
              All boards
            </Button>
            <Typography
              className="mono-label"
              color="text.secondary"
              sx={{ pt: 3, mb: 1 }}
            >
              Workspaces · {workspaces.data?.length || 0}
            </Typography>
            {workspaces.data?.map((workspace, index) => (
              <Button
                key={workspace.id}
                onClick={() =>
                  document
                    .getElementById(`workspace-${workspace.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                sx={{
                  justifyContent: "flex-start",
                  color: "#3e3b36",
                  overflow: "hidden",
                  px: 1.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 21,
                    mr: 1,
                    color: "#918c82",
                    fontFamily: "DM Mono",
                    fontSize: 11,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </Box>
                {workspace.name}
              </Button>
            ))}
          </Stack>
        </Box>
        <Box>
          <AnimatedContent>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                bgcolor: "#181817",
                color: "#fff",
                borderRadius: { xs: 3, md: 4 },
                px: { xs: 3, md: 5 },
                py: { xs: 4, md: 5 },
                mb: { xs: 5, md: 7 },
                minHeight: { md: 310 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 360,
                  height: 360,
                  border: "1px solid rgba(216,255,99,.4)",
                  borderRadius: "50%",
                  right: -85,
                  top: -150,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  width: 240,
                  height: 240,
                  border: "1px solid rgba(255,92,53,.55)",
                  borderRadius: "50%",
                  right: -20,
                  top: -95,
                }}
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ position: "relative" }}
              >
                <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
                  Workspace index / 2026
                </Typography>
                <AutoAwesomeRounded sx={{ color: "#ff5c35" }} />
              </Stack>
              <Box sx={{ position: "relative", mt: 6 }}>
                <Typography
                  component="h1"
                  className="display-type"
                  sx={{
                    fontSize: { xs: 44, sm: 60, lg: 72 },
                    lineHeight: 0.96,
                    maxWidth: 680,
                  }}
                >
                  Make the work{" "}
                  <span
                    className="dashboard-hero-word"
                    style={{ color: "#181817" }}
                  >
                    move.
                  </span>
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ sm: "flex-end" }}
                  justifyContent="space-between"
                  gap={2}
                  mt={3}
                >
                  <Typography
                    sx={{ color: "#b9b7af", maxWidth: 480, fontSize: 16 }}
                  >
                    A clear view of every project, decision and next move your
                    team owns.
                  </Typography>
                  {!!workspaces.data?.length && (
                    <Button
                      variant="contained"
                      startIcon={<AddRounded />}
                      onClick={() => setDialog(true)}
                      sx={{
                        bgcolor: "#d8ff63",
                        color: "#181817",
                        boxShadow: "3px 3px 0 #ff5c35",
                        "&:hover": { bgcolor: "#e5ff94" },
                      }}
                    >
                      Create workspace
                    </Button>
                  )}
                </Stack>
                <Stack direction="row" gap={1} flexWrap="wrap" mt={3}>
                  {[
                    `${workspaces.data?.length || 0} workspaces`,
                    "Notes → boards",
                    "Live completion",
                    "AI status updates",
                  ].map((item) => (
                    <Chip
                      key={item}
                      size="small"
                      label={item}
                      sx={{
                        bgcolor: "#2d2d2a",
                        color: "#d8ff63",
                        border: "1px solid #51514c",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>
          </AnimatedContent>

          {workspaces.isError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <Button onClick={() => workspaces.refetch()}>Retry</Button>
              }
            >
              {errorMessage(workspaces.error)}
            </Alert>
          )}
          {workspaces.isLoading ? (
            <Stack spacing={2}>
              <Skeleton height={160} />
              <Skeleton height={160} />
            </Stack>
          ) : (
            <Stack spacing={7}>
              {workspaces.data?.map((workspace, index) => (
                <AnimatedContent
                  key={workspace.id}
                  delay={Math.min(index * 90, 270)}
                >
                  <WorkspaceSection
                    workspace={workspace}
                    number={index + 1}
                    openBoard={(id) => navigate(`/boards/${id}`)}
                  />
                </AnimatedContent>
              ))}
              {!workspaces.data?.length && (
                <Box
                  sx={{
                    py: 9,
                    borderTop: "1px solid #aaa59a",
                    borderBottom: "1px solid #aaa59a",
                    textAlign: "center",
                  }}
                >
                  <SpaceDashboardRounded sx={{ fontSize: 42, mb: 2 }} />
                  <Typography variant="h5">No workspace yet</Typography>
                  <Typography color="text.secondary" sx={{ my: 1.5 }}>
                    Create one place for your team’s boards and projects.
                  </Typography>
                  <Button variant="contained" onClick={() => setDialog(true)}>
                    Create your first workspace
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>
      <CreateDialog
        open={dialog}
        title="Create workspace"
        pending={createWorkspace.isPending}
        error={createWorkspace.error}
        onClose={() => {
          setDialog(false);
          setSearchParams({});
        }}
        onSubmit={(value) => createWorkspace.mutate(value)}
      />
    </Container>
  );
}

function WorkspaceSection({
  workspace,
  number,
  openBoard,
}: {
  workspace: Workspace;
  number: number;
  openBoard: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const client = useQueryClient();
  const details = useQuery({
    queryKey: ["workspace", workspace.id],
    queryFn: async () =>
      (await api.get<Workspace>(`/workspaces/${workspace.id}`)).data,
  });
  const createBoard = useMutation({
    mutationFn: async (input: {
      name: string;
      template: "blank" | "software" | "marketing" | "operations";
    }) =>
      (
        await api.post<Board>(`/workspaces/${workspace.id}/boards`, {
          ...input,
          backgroundColor: "#d8ff63",
        })
      ).data,
    onSuccess: (board) => {
      client.invalidateQueries({ queryKey: ["workspace", workspace.id] });
      setOpen(false);
      openBoard(board.id);
    },
  });
  return (
    <Box
      component="section"
      aria-labelledby={`workspace-${workspace.id}`}
      sx={{ borderTop: "1px solid #aaa59a", pt: 2.5 }}
    >
      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <Typography aria-hidden className="mono-label" color="text.secondary">
          {String(number).padStart(2, "0")}
        </Typography>
        <Typography
          id={`workspace-${workspace.id}`}
          variant="h5"
          sx={{ flex: 1, fontSize: { xs: 22, md: 26 }, scrollMarginTop: 110 }}
        >
          {workspace.name}
        </Typography>
        <Typography
          className="mono-label"
          color="text.secondary"
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          {workspace.plan === "business" ? "team" : workspace.plan || "free"} ·{" "}
          {workspace.role}
        </Typography>
        {workspace.plan === "business" &&
          (workspace.role === "owner" || workspace.role === "admin") && (
            <Button
              startIcon={<InsightsRounded />}
              onClick={() =>
                navigate(`/workspaces/${workspace.id}/command-center`)
              }
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              Workspace Pulse
            </Button>
          )}
        {(workspace.role === "owner" || workspace.role === "admin") && (
          <Button
            aria-label={`Settings for ${workspace.name}`}
            onClick={() => setSettingsOpen(true)}
            sx={{ minWidth: 44, px: 1 }}
          >
            <SettingsRounded />
          </Button>
        )}
        <Button startIcon={<AddRounded />} onClick={() => setOpen(true)}>
          New board
        </Button>
      </Stack>
      {workspace.plan === "business" &&
        (workspace.role === "owner" || workspace.role === "admin") && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<InsightsRounded />}
            onClick={() =>
              navigate(`/workspaces/${workspace.id}/command-center`)
            }
            sx={{ display: { xs: "flex", md: "none" }, mb: 2 }}
          >
            Open Workspace Pulse
          </Button>
        )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 1.5,
        }}
      >
        {details.isLoading &&
          [1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={160} />
          ))}
        {details.data?.boards?.map((board, i) => (
          <SpotlightCard
            as="button"
            key={board.id}
            className="workspace-board-card"
            onClick={() => openBoard(board.id)}
          >
            <span className="mono-label">
              Board / {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <strong>{board.name}</strong>
              <span className="board-card-template">
                {board.template === "blank" ? "Custom" : board.template}{" "}
                workflow
              </span>
            </span>
            <span className="board-card-foot">
              <span>
                {board.template === "blank" ? "Custom" : board.template} ·{" "}
                {board.createdAt
                  ? new Date(board.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Active"}
              </span>
              <ArrowOutwardRounded fontSize="small" />
            </span>
          </SpotlightCard>
        ))}
        {!details.isLoading && !details.data?.boards?.length && (
          <Box
            component="button"
            onClick={() => setOpen(true)}
            sx={{
              minHeight: 160,
              bgcolor: "transparent",
              border: "1px dashed #8a867d",
              borderRadius: 3,
              cursor: "pointer",
              color: "#56534d",
              fontWeight: 700,
              "&:hover": { bgcolor: "#fffef9", color: "#181817" },
            }}
          >
            + Create the first board
          </Box>
        )}
      </Box>
      <CreateBoardDialog
        open={open}
        pending={createBoard.isPending}
        error={createBoard.error}
        onClose={() => setOpen(false)}
        onSubmit={(value) => createBoard.mutate(value)}
      />
      <WorkspaceSettingsDialog
        open={settingsOpen}
        workspace={workspace}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
}
