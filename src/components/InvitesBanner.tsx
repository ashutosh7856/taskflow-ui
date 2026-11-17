import GroupAddRounded from "@mui/icons-material/GroupAddRounded";
import { Button } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../lib/api";
import { NoticeBar } from "./NoticeBar";

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
  const [snoozed, setSnoozed] = useState<string[]>([]);
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

  const visible = (invites.data || []).filter(
    (invite) => !snoozed.includes(invite.token),
  );
  if (!visible.length) return null;
  const busy = accept.isPending || decline.isPending;
  const failed = accept.error || decline.error;
  return (
    <>
      {visible.map((invite) => (
        <NoticeBar
          key={invite.token}
          tone="accent"
          icon={<GroupAddRounded />}
          title={
            <>
              {invite.invitedBy || "A teammate"} invited you to{" "}
              {invite.targetName}
            </>
          }
          onClose={() => setSnoozed((list) => [...list, invite.token])}
          actions={
            <>
              <Button
                size="small"
                disabled={busy}
                onClick={() => decline.mutate(invite.token)}
                sx={{
                  color: "var(--muted)",
                  minHeight: 34,
                  "&:hover": { bgcolor: "var(--hover)", color: "var(--ink)" },
                }}
              >
                Decline
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={busy}
                onClick={() => accept.mutate(invite.token)}
                sx={{ minHeight: 34, px: 2 }}
              >
                Accept
              </Button>
            </>
          }
        >
          {failed
            ? errorMessage(failed)
            : `Join the ${invite.scope} as ${invite.role === "admin" ? "an admin" : "a member"}. You'll only see what you've been given access to.`}
        </NoticeBar>
      ))}
    </>
  );
}
