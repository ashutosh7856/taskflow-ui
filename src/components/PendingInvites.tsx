import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, errorMessage } from "../lib/api";

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  invitedBy: string | null;
};

export const pendingInvitesKey = (scope: "workspace" | "board", id: string) =>
  ["invites", scope, id] as const;

/** Invites sent but not accepted yet, with resend and revoke. */
export function PendingInvites({
  scope,
  id,
}: {
  scope: "workspace" | "board";
  id: string;
}) {
  const client = useQueryClient();
  const [notice, setNotice] = useState("");
  const key = pendingInvitesKey(scope, id);
  const invites = useQuery({
    queryKey: key,
    queryFn: async () =>
      (await api.get<PendingInvite[]>(`/${scope}s/${id}/invites`)).data,
  });
  const resend = useMutation({
    mutationFn: async (inviteId: string) =>
      (await api.post<{ emailSent: boolean }>(`/invites/${inviteId}/resend`))
        .data,
    onSuccess: (data) => {
      setNotice(
        data.emailSent
          ? "Invitation sent again."
          : "Invite renewed for 7 more days.",
      );
      client.invalidateQueries({ queryKey: key });
    },
  });
  const revoke = useMutation({
    mutationFn: (inviteId: string) => api.delete(`/invites/${inviteId}`),
    onSuccess: () => {
      setNotice("Invitation cancelled.");
      client.invalidateQueries({ queryKey: key });
    },
  });

  if (!invites.data?.length) return null;
  return (
    <Box mt={3}>
      <Typography fontWeight={850} mb={1}>
        Pending invitations · {invites.data.length}
      </Typography>
      <Stack spacing={1}>
        {invites.data.map((invite) => (
          <Stack
            key={invite.id}
            direction="row"
            alignItems="center"
            gap={1.25}
            flexWrap="wrap"
            sx={{
              p: 1.25,
              border: "1px dashed var(--line-strong)",
              borderRadius: 2,
            }}
          >
            <MailOutlineRounded sx={{ color: "text.secondary" }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography fontWeight={750} noWrap>
                {invite.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Invited {new Date(invite.createdAt).toLocaleDateString()}
                {invite.invitedBy ? ` by ${invite.invitedBy}` : ""} · expires{" "}
                {new Date(invite.expiresAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={invite.role}
              sx={{ textTransform: "capitalize" }}
            />
            <Button
              size="small"
              disabled={resend.isPending}
              onClick={() => resend.mutate(invite.id)}
            >
              Resend
            </Button>
            <Button
              size="small"
              color="error"
              disabled={revoke.isPending}
              onClick={() => {
                if (confirm(`Cancel the invitation for ${invite.email}?`))
                  revoke.mutate(invite.id);
              }}
            >
              Cancel
            </Button>
          </Stack>
        ))}
      </Stack>
      {notice && (
        <Alert
          severity="success"
          sx={{ mt: 1.5 }}
          onClose={() => setNotice("")}
        >
          {notice}
        </Alert>
      )}
      {(resend.error || revoke.error) && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {errorMessage(resend.error || revoke.error)}
        </Alert>
      )}
    </Box>
  );
}
