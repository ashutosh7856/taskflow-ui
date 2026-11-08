import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, errorMessage } from "../lib/api";
import type { Workspace } from "../types";

export function WorkspaceSettingsDialog({
  open,
  workspace,
  onClose,
}: {
  open: boolean;
  workspace: Workspace;
  onClose: () => void;
}) {
  const [name, setName] = useState(workspace.name);
  const [confirmation, setConfirmation] = useState("");
  const client = useQueryClient();
  useEffect(() => setName(workspace.name), [workspace.name]);
  const details = useQuery({
    queryKey: ["workspace", workspace.id],
    enabled: open,
    queryFn: async () =>
      (await api.get<Workspace>(`/workspaces/${workspace.id}`)).data,
  });
  const rename = useMutation({
    mutationFn: () =>
      api.patch(`/workspaces/${workspace.id}`, { name: name.trim() }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["workspaces"] });
      client.invalidateQueries({ queryKey: ["workspace", workspace.id] });
    },
  });
  const updateMember = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "member";
    }) => api.post(`/workspaces/${workspace.id}/members`, { userId, role }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["workspace", workspace.id] }),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/workspaces/${workspace.id}`),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["workspaces"] });
      onClose();
    },
  });
  const error = rename.error || updateMember.error || remove.error;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: "#fffef9", borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontSize: 28 }}>Workspace settings</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage(error)}
          </Alert>
        )}
        <Typography className="mono-label" color="text.secondary" mb={1.5}>
          General
        </Typography>
        <Stack direction="row" gap={1}>
          <TextField
            fullWidth
            label="Workspace name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            variant="contained"
            disabled={
              !name.trim() || name.trim() === workspace.name || rename.isPending
            }
            onClick={() => rename.mutate()}
          >
            Save
          </Button>
        </Stack>
        <Divider sx={{ my: 4 }} />
        <Typography className="mono-label" color="text.secondary" mb={1.5}>
          People · {details.data?.members?.length || 0}
        </Typography>
        <Stack spacing={1}>
          {details.data?.members?.map((member) => (
            <Stack
              key={member.userId}
              direction="row"
              alignItems="center"
              gap={1.5}
              sx={{ border: "1px solid #dedad0", borderRadius: 2, p: 1.25 }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "#181817",
                  color: "#d8ff63",
                  fontSize: 13,
                }}
              >
                {member.user?.name?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={750} noWrap>
                  {member.user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {member.user?.email}
                </Typography>
              </Box>
              {member.role === "owner" ? (
                <Typography className="mono-label">Owner</Typography>
              ) : (
                <TextField
                  select
                  size="small"
                  value={member.role}
                  onChange={(event) =>
                    updateMember.mutate({
                      userId: member.userId,
                      role: event.target.value as "admin" | "member",
                    })
                  }
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="member">Member</MenuItem>
                </TextField>
              )}
            </Stack>
          ))}
        </Stack>
        {workspace.role === "owner" && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box
              sx={{
                border: "1px solid #e9a89a",
                bgcolor: "#fff5f2",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Typography fontWeight={850}>Delete workspace</Typography>
              <Typography color="text.secondary" fontSize={14} my={1}>
                Permanently deletes every board, card, comment, and invite in
                this workspace. This cannot be undone.
              </Typography>
              <TextField
                fullWidth
                size="small"
                label={`Type “${workspace.name}” to confirm`}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                sx={{ my: 1 }}
              />
              <Button
                color="error"
                startIcon={<DeleteOutlineRounded />}
                disabled={confirmation !== workspace.name || remove.isPending}
                onClick={() => remove.mutate()}
              >
                Delete workspace permanently
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
