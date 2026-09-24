import AddRounded from "@mui/icons-material/AddRounded";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import { Alert, Box, Button, Container, Skeleton, Stack, Typography } from "@mui/material";
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
  const client = useQueryClient();
  useEffect(() => { if (searchParams.get("create") === "workspace") setDialog(true); }, [searchParams]);
  const workspaces = useQuery({ queryKey: ["workspaces"], queryFn: async () => (await api.get<Workspace[]>("/workspaces")).data });
  const createWorkspace = useMutation({ mutationFn: async (name: string) => (await api.post<Workspace>("/workspaces", { name })).data, onSuccess: () => { client.invalidateQueries({ queryKey: ["workspaces"] }); setDialog(false); setSearchParams({}); } });

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "210px minmax(0, 1fr)" }, gap: { md: 6, lg: 9 } }}>
      <Box component="aside" sx={{ display: { xs: "none", md: "block" } }}>
        <Stack spacing={.75} sx={{ position: "sticky", top: 104 }}>
          <Button startIcon={<GridViewRounded />} sx={{ justifyContent: "flex-start", bgcolor: "#e8e8e2", color: "#111" }}>Boards</Button>
          <Button startIcon={<AccessTimeRounded />} sx={{ justifyContent: "flex-start", color: "text.secondary" }}>Recent</Button>
          <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ pt: 3, px: 2 }}>Your workspaces</Typography>
          {workspaces.data?.map((workspace) => <Button key={workspace.id} href={`#workspace-${workspace.id}`} sx={{ justifyContent: "flex-start", color: "#343430", overflow: "hidden" }}>{workspace.name}</Button>)}
        </Stack>
      </Box>
      <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-end" }} gap={2} sx={{ mb: { xs: 5, md: 7 } }}>
        <Box>
          <Typography component="p" variant="overline" fontWeight={800} letterSpacing=".16em" color="text.secondary">Boards</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 36, md: 48 }, lineHeight: 1.05, fontWeight: 850, letterSpacing: "-.05em", mt: 1 }}>Your team’s work</Typography>
        </Box>
        <Stack alignItems={{ sm: "flex-end" }} gap={1.5}>
          <Typography color="text.secondary" sx={{ maxWidth: 340 }}>Open a board and pick up where your team left off.</Typography>
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog(true)}>Create workspace</Button>
        </Stack>
      </Stack>

      {workspaces.isError && <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={() => workspaces.refetch()}>Retry</Button>}>{errorMessage(workspaces.error)}</Alert>}
      {workspaces.isLoading ? <Stack spacing={2}><Skeleton height={160} /><Skeleton height={160} /></Stack> : (
        <Stack spacing={5}>
          {workspaces.data?.map((workspace, index) => <WorkspaceSection key={workspace.id} workspace={workspace} number={index + 1} openBoard={(id) => navigate(`/boards/${id}`)} />)}
          {!workspaces.data?.length && <Box sx={{ py: 9, borderTop: "1px solid #bdbdb5", borderBottom: "1px solid #bdbdb5", textAlign: "center" }}><SpaceDashboardRounded sx={{ fontSize: 42, mb: 2 }} /><Typography variant="h5">No workspace yet</Typography><Typography color="text.secondary" sx={{ my: 1.5 }}>Create one place for your team’s boards and projects.</Typography><Button variant="contained" onClick={() => setDialog(true)}>Create your first workspace</Button></Box>}
        </Stack>
      )}
      </Box>
      </Box>
      <CreateDialog open={dialog} title="Create workspace" pending={createWorkspace.isPending} error={createWorkspace.error} onClose={() => { setDialog(false); setSearchParams({}); }} onSubmit={(value) => createWorkspace.mutate(value)} />
    </Container>
  );
}

function WorkspaceSection({ workspace, number, openBoard }: { workspace: Workspace; number: number; openBoard: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const details = useQuery({ queryKey: ["workspace", workspace.id], queryFn: async () => (await api.get<Workspace>(`/workspaces/${workspace.id}`)).data });
  const createBoard = useMutation({ mutationFn: async (name: string) => (await api.post<Board>(`/workspaces/${workspace.id}/boards`, { name, backgroundColor: "#5b6b9a" })).data, onSuccess: (board) => { client.invalidateQueries({ queryKey: ["workspace", workspace.id] }); setOpen(false); openBoard(board.id); } });
  return (
    <Box component="section" aria-labelledby={`workspace-${workspace.id}`} sx={{ borderTop: "1px solid #bdbdb5", pt: 2.5 }}>
      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <Typography aria-hidden color="text.secondary" fontSize={13} fontWeight={800}>{String(number).padStart(2, "0")}</Typography>
        <Typography id={`workspace-${workspace.id}`} variant="h5" sx={{ flex: 1 }}>{workspace.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, textTransform: "capitalize" }}>{workspace.role}</Typography>
        <Button startIcon={<AddRounded />} onClick={() => setOpen(true)}>New board</Button>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
        {details.isLoading && [1, 2].map((i) => <Skeleton key={i} variant="rounded" height={130} />)}
        {details.data?.boards?.map((board, i) => (
          <Box component="button" key={board.id} onClick={() => openBoard(board.id)} sx={{ appearance: "none", textAlign: "left", font: "inherit", color: "#25304f", minHeight: 132, p: 2.5, bgcolor: i === 0 ? "#dff4e8" : "#fff", border: "1px solid #bdbdb5", borderRadius: 2, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: ".15s", "&:hover": { transform: "translateY(-3px)", borderColor: "#5b6b9a", boxShadow: "0 10px 25px rgba(37,48,79,.12)" } }}>
            <Typography fontSize={18} fontWeight={800}>{board.name}</Typography><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="caption" color="text.secondary">Open board</Typography><ArrowOutwardRounded fontSize="small" /></Stack>
          </Box>
        ))}
        {!details.isLoading && !details.data?.boards?.length && <Box component="button" onClick={() => setOpen(true)} sx={{ minHeight: 132, bgcolor: "transparent", border: "1px dashed #8a8a82", borderRadius: 2, cursor: "pointer", color: "#565650", fontWeight: 700, "&:hover": { bgcolor: "#fff", color: "#111" } }}>+ Create the first board</Box>}
      </Box>
      <CreateDialog open={open} title="Create board" pending={createBoard.isPending} error={createBoard.error} onClose={() => setOpen(false)} onSubmit={(value) => createBoard.mutate(value)} />
    </Box>
  );
}
