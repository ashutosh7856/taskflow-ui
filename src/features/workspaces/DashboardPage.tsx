import AddRounded from "@mui/icons-material/AddRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import ViewKanbanRounded from "@mui/icons-material/ViewKanbanRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CreateDialog } from "../../components/CreateDialog";
import { api, errorMessage } from "../../lib/api";
import type { Board, Workspace } from "../../types";

export function DashboardPage() {
  const [dialog, setDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setDialog(false);
      setSearchParams({});
    },
  });

  if (workspaces.isLoading) return <DashboardSkeleton />;

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 2, sm: 3, lg: 4 } }}
    >
      <Hero workspaceCount={workspaces.data?.length || 0} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5">Workspaces</Typography>
          <Typography color="text.secondary" variant="body2">
            Choose a board or create a new space for your team.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setDialog(true)}
        >
          Create workspace
        </Button>
      </Stack>

      {workspaces.isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={<Button onClick={() => workspaces.refetch()}>Retry</Button>}
        >
          {errorMessage(workspaces.error)}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {workspaces.data?.map((workspace) => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            openBoard={(id) => navigate(`/boards/${id}`)}
          />
        ))}
        {!workspaces.data?.length && (
          <Grid size={12}>
            <Box
              sx={{
                border: "1px dashed #cbd5e1",
                bgcolor: "white",
                borderRadius: 3,
                p: { xs: 5, md: 8 },
                textAlign: "center",
              }}
            >
              <DashboardRounded
                sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }}
              />
              <Typography variant="h6">Create your first workspace</Typography>
              <Typography color="text.secondary" mb={2}>
                A workspace keeps related boards and teammates together.
              </Typography>
              <Button variant="contained" onClick={() => setDialog(true)}>
                Get started
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

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

function Hero({ workspaceCount }: { workspaceCount: number }) {
  return (
    <Box
      sx={{
        mb: { xs: 3, md: 4 },
        p: { xs: 3, md: 4 },
        minHeight: { md: 210 },
        borderRadius: 4,
        color: "white",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(120deg,#1d4ed8,#4f46e5 62%,#7c3aed)",
        boxShadow: "0 18px 42px rgba(37,99,235,.18)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,.08)",
          right: -50,
          top: -120,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: "24px solid rgba(255,255,255,.06)",
          right: 170,
          bottom: -70,
        }}
      />
      <Typography
        variant="overline"
        sx={{ opacity: 0.76, letterSpacing: ".14em", fontWeight: 750 }}
      >
        Workspace overview
      </Typography>
      <Typography variant="h4" mt={0.5}>
        Make progress visible.
      </Typography>
      <Typography sx={{ opacity: 0.8, mt: 1, maxWidth: 520 }}>
        Plan projects, assign work, and keep your team aligned from one focused
        workspace.
      </Typography>
      <Stack direction="row" spacing={4} mt={3}>
        <Box>
          <Typography variant="h5">{workspaceCount}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.72 }}>
            Active workspaces
          </Typography>
        </Box>
        <Box>
          <Typography variant="h5">24/7</Typography>
          <Typography variant="caption" sx={{ opacity: 0.72 }}>
            Team visibility
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function WorkspaceCard({
  workspace,
  openBoard,
}: {
  workspace: Workspace;
  openBoard: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const details = useQuery({
    queryKey: ["workspace", workspace.id],
    queryFn: async () =>
      (await api.get<Workspace>(`/workspaces/${workspace.id}`)).data,
  });
  const createBoard = useMutation({
    mutationFn: async (name: string) =>
      (
        await api.post<Board>(`/workspaces/${workspace.id}/boards`, {
          name,
          backgroundColor: "#2563eb",
        })
      ).data,
    onSuccess: (board) => {
      client.invalidateQueries({ queryKey: ["workspace", workspace.id] });
      setOpen(false);
      openBoard(board.id);
    },
  });

  return (
    <Grid size={{ xs: 12, lg: 6 }}>
      <Card
        sx={{
          height: "100%",
          borderRadius: 3,
          transition: ".2s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 18px 42px rgba(15,23,42,.10)",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2.5}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              minWidth={0}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  flex: "0 0 auto",
                  borderRadius: 2.5,
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <ViewKanbanRounded />
              </Box>
              <Box minWidth={0}>
                <Typography variant="h6" noWrap>
                  {workspace.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "capitalize" }}
                >
                  {workspace.role} workspace
                </Typography>
              </Box>
            </Stack>
            <Button
              size="small"
              startIcon={<AddRounded />}
              onClick={() => setOpen(true)}
            >
              Board
            </Button>
          </Stack>
          <Grid container spacing={1.5}>
            {details.data?.boards?.map((board) => (
              <Grid key={board.id} size={{ xs: 12, sm: 6 }}>
                <CardActionArea
                  onClick={() => openBoard(board.id)}
                  sx={{
                    background: `linear-gradient(135deg,${board.backgroundColor || "#2563eb"},#312e81)`,
                    color: "white",
                    p: 2,
                    borderRadius: 2.5,
                    minHeight: 106,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    transition: ".18s",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <Typography fontWeight={750}>{board.name}</Typography>
                  <ArrowForwardRounded
                    fontSize="small"
                    sx={{ alignSelf: "flex-end", opacity: 0.8 }}
                  />
                </CardActionArea>
              </Grid>
            ))}
            {!details.isLoading && !details.data?.boards?.length && (
              <Grid size={12}>
                <Box
                  sx={{
                    bgcolor: "#f8fafc",
                    border: "1px dashed #dbe1ea",
                    borderRadius: 2.5,
                    p: 2.5,
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    No boards yet. Create the first one.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <CreateDialog
        open={open}
        title="Create board"
        pending={createBoard.isPending}
        error={createBoard.error}
        onClose={() => setOpen(false)}
        onSubmit={(value) => createBoard.mutate(value)}
      />
    </Grid>
  );
}

function DashboardSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Skeleton variant="rounded" height={210} sx={{ mb: 4 }} />
      <Grid container spacing={2.5}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} size={{ xs: 12, lg: 6 }}>
            <Skeleton variant="rounded" height={230} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
