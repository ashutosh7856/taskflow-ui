import { Box, Button, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../lib/api";

type MyInvite = {
  token: string;
  scope: "workspace" | "board";
  role: string;
  targetName: string;
  invitedBy: string | null;
};

/** Tells signed-in users about invitations waiting for them. */
export function InvitesBanner() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const invites = useQuery({
    queryKey: ["invites", "mine"],
    queryFn: async () => (await api.get<MyInvite[]>("/invites/mine")).data,
    staleTime: 60 * 1000,
  });
  const accept = useMutation({
    mutationFn: async (token: string) =>
      (await api.post(`/invites/${token}/accept`)).data,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["invites", "mine"] }),
        client.invalidateQueries({ queryKey: ["workspaces"] }),
      ]);
      navigate("/app");
    },
  });
  const decline = useMutation({
    mutationFn: (token: string) => api.post(`/invites/${token}/decline`),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["invites", "mine"] }),
  });

  if (!invites.data?.length) return null;
  const busy = accept.isPending || decline.isPending;
  return (
    <Box sx={{ bgcolor: "#d8ff63", color: "#181817", px: { xs: 2, sm: 3 }, py: 1 }}>
      {invites.data.map((invite) => (
        <Stack
          key={invite.token}
          direction="row"
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          columnGap={1.5}
          rowGap={0.5}
          sx={{ maxWidth: 1280, mx: "auto", py: 0.25 }}
        >
          <Typography fontSize={14} textAlign="center">
            <strong>{invite.invitedBy || "A teammate"}</strong> invited you to
            the {invite.scope} <strong>{invite.targetName}</strong>.
          </Typography>
          <Button
            size="small"
            variant="contained"
            disabled={busy}
            onClick={() => accept.mutate(invite.token)}
            sx={{ minHeight: 30 }}
          >
            Accept
          </Button>
          <Button
            size="small"
            disabled={busy}
            onClick={() => decline.mutate(invite.token)}
            sx={{ color: "#181817", minHeight: 30 }}
          >
            Decline
          </Button>
        </Stack>
      ))}
      {(accept.error || decline.error) && (
        <Typography fontSize={13} textAlign="center" color="error">
          {errorMessage(accept.error || decline.error)}
        </Typography>
      )}
    </Box>
  );
}
