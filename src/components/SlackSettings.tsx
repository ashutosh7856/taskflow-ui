import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../lib/api";

type SlackEvent = "assigned" | "client" | "done" | "comments";

interface SlackStatus {
  available: boolean;
  oauth: boolean;
  connected: boolean;
  channel: string | null;
  team: string | null;
  events: SlackEvent[];
}

const eventOptions: Array<{ key: SlackEvent; label: string; hint: string }> = [
  {
    key: "assigned",
    label: "Assignments",
    hint: "Someone is assigned to a card",
  },
  {
    key: "client",
    label: "Client activity",
    hint: "Sent for approval, approved, changes requested, client comments and requests",
  },
  {
    key: "done",
    label: "Finished work",
    hint: "A card is completed, published or delivered",
  },
  { key: "comments", label: "Team comments", hint: "Every comment on a card" },
];

function SlackMark() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: 22, height: 22, flexShrink: 0 }}
    >
      <path
        fill="#E01E5A"
        d="M5 15a2 2 0 1 1-2-2h2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0z"
      />
      <path
        fill="#36C5F0"
        d="M9 5a2 2 0 1 1 2-2v2zm0 1a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4z"
      />
      <path
        fill="#2EB67D"
        d="M19 9a2 2 0 1 1 2 2h-2zm-1 0a2 2 0 1 1-4 0V4a2 2 0 1 1 4 0z"
      />
      <path
        fill="#ECB22E"
        d="M15 19a2 2 0 1 1-2 2v-2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4z"
      />
    </Box>
  );
}

export function SlackSettings({ workspaceId }: { workspaceId: string }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const key = ["slack", workspaceId];
  const [pasting, setPasting] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [channel, setChannel] = useState("");
  const [notice, setNotice] = useState("");
  const status = useQuery({
    queryKey: key,
    queryFn: async () =>
      (await api.get<SlackStatus>(`/workspaces/${workspaceId}/slack`)).data,
  });
  const save = (data: SlackStatus) => client.setQueryData(key, data);
  const connect = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ url: string }>(
          `/workspaces/${workspaceId}/slack/connect`,
        )
      ).data,
    onSuccess: ({ url }) => window.location.assign(url),
  });
  const update = useMutation({
    mutationFn: async (input: {
      webhookUrl?: string;
      channel?: string;
      events?: SlackEvent[];
    }) =>
      (await api.put<SlackStatus>(`/workspaces/${workspaceId}/slack`, input))
        .data,
    onSuccess: (data, input) => {
      save(data);
      if (input.webhookUrl) {
        setPasting(false);
        setWebhookUrl("");
        setNotice("Connected. We posted a hello message to the channel.");
      }
    },
  });
  const test = useMutation({
    mutationFn: () => api.post(`/workspaces/${workspaceId}/slack/test`),
    onSuccess: () => setNotice("Test message sent. Check your Slack channel."),
    onError: () => client.invalidateQueries({ queryKey: key }),
  });
  const disconnect = useMutation({
    mutationFn: async () =>
      (await api.delete<SlackStatus>(`/workspaces/${workspaceId}/slack`)).data,
    onSuccess: (data) => {
      save(data);
      setNotice("");
    },
  });
  const error = connect.error || update.error || test.error || disconnect.error;
  const data = status.data;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
        <SlackMark />
        <Typography className="mono-label" color="text.secondary">
          Slack
        </Typography>
      </Stack>
      {status.error != null && (
        <Alert severity="error">{errorMessage(status.error)}</Alert>
      )}
      {data && !data.available && (
        <Box
          sx={{
            border: "1px dashed #b9b7af",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography fontWeight={800}>Get board updates in Slack</Typography>
          <Typography color="text.secondary" fontSize={14} mt={0.5} mb={1.5}>
            Assignments, client approvals and finished work, posted to the
            channel your team already watches. Included in Pro and Team.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/billing")}>
            See plans
          </Button>
        </Box>
      )}
      {data?.available && (
        <Box sx={{ border: "1px solid var(--line)", borderRadius: 2, p: 2 }}>
          {data.connected ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ sm: "center" }}
              gap={1.5}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={800}>
                  Posting to {data.channel || "your Slack channel"}
                </Typography>
                {data.team && (
                  <Typography fontSize={13} color="text.secondary">
                    {data.team}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={test.isPending}
                  onClick={() => test.mutate()}
                >
                  Send test
                </Button>
                <Button
                  size="small"
                  color="error"
                  disabled={disconnect.isPending}
                  onClick={() => disconnect.mutate()}
                >
                  Disconnect
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Typography fontWeight={800}>
                Get board updates in Slack
              </Typography>
              <Typography
                color="text.secondary"
                fontSize={14}
                mt={0.5}
                mb={1.5}
              >
                Pick a channel and Danto posts there when work is assigned,
                clients respond, or work is finished.
              </Typography>
              <Stack
                direction="row"
                gap={1}
                flexWrap="wrap"
                alignItems="center"
              >
                {data.oauth && (
                  <Button
                    variant="contained"
                    startIcon={<SlackMark />}
                    disabled={connect.isPending}
                    onClick={() => connect.mutate()}
                    sx={{
                      bgcolor: "var(--surface)",
                      color: "var(--ink)",
                      border: "1px solid var(--line-strong)",
                      "&:hover": { bgcolor: "var(--surface-2)" },
                    }}
                  >
                    Add to Slack
                  </Button>
                )}
                <Button
                  size="small"
                  onClick={() => setPasting((value) => !value)}
                >
                  {data.oauth
                    ? "Use a webhook URL instead"
                    : "Connect with a webhook URL"}
                </Button>
              </Stack>
              <Collapse in={pasting || !data.oauth}>
                <Stack spacing={1.5} mt={2}>
                  <Typography fontSize={13} color="text.secondary">
                    In Slack, create an incoming webhook for your channel (
                    <Link
                      href="https://api.slack.com/messaging/webhooks"
                      target="_blank"
                      rel="noreferrer"
                    >
                      how
                    </Link>
                    ) and paste its URL here.
                  </Typography>
                  <TextField
                    size="small"
                    label="Webhook URL"
                    placeholder="https://hooks.slack.com/services/…"
                    value={webhookUrl}
                    onChange={(event) => setWebhookUrl(event.target.value)}
                  />
                  <Stack direction="row" gap={1}>
                    <TextField
                      size="small"
                      label="Channel name (optional)"
                      placeholder="#client-work"
                      value={channel}
                      onChange={(event) => setChannel(event.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="contained"
                      disabled={!webhookUrl.trim() || update.isPending}
                      onClick={() =>
                        update.mutate({
                          webhookUrl: webhookUrl.trim(),
                          channel: channel.trim() || undefined,
                        })
                      }
                    >
                      {update.isPending ? "Checking…" : "Connect"}
                    </Button>
                  </Stack>
                </Stack>
              </Collapse>
            </>
          )}
          <Typography fontSize={13} fontWeight={800} mt={2.5} mb={0.5}>
            What to post
          </Typography>
          <Stack>
            {eventOptions.map((option) => {
              const checked = data.events.includes(option.key);
              return (
                <FormControlLabel
                  key={option.key}
                  sx={{ alignItems: "flex-start", my: 0.25 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked}
                      disabled={update.isPending}
                      sx={{ pt: 0.25 }}
                      onChange={() =>
                        update.mutate({
                          events: checked
                            ? data.events.filter((item) => item !== option.key)
                            : [...data.events, option.key],
                        })
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography fontSize={14} fontWeight={700}>
                        {option.label}
                      </Typography>
                      <Typography fontSize={12.5} color="text.secondary">
                        {option.hint}
                      </Typography>
                    </Box>
                  }
                />
              );
            })}
          </Stack>
        </Box>
      )}
      {notice && (
        <Alert
          severity="success"
          sx={{ mt: 1.5 }}
          onClose={() => setNotice("")}
        >
          {notice}
        </Alert>
      )}
      {error != null && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {errorMessage(error)}
        </Alert>
      )}
    </Box>
  );
}
