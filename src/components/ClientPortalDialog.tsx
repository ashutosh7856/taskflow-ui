import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../lib/api";
import type { Board, PortalSettings, Workspace } from "../types";

type TabKey = "share" | "inbox" | "update" | "brand";

export function usePortalSettings(boardId: string, enabled = true) {
  return useQuery({
    queryKey: ["portal-settings", boardId],
    enabled,
    queryFn: async () =>
      (await api.get<PortalSettings>(`/boards/${boardId}/portal`)).data,
  });
}

export function ClientPortalDialog({
  board,
  open,
  onClose,
  initialTab = "share",
}: {
  board: Board;
  open: boolean;
  onClose: () => void;
  initialTab?: TabKey;
}) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const settings = usePortalSettings(board.id, open);
  const client = useQueryClient();
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);
  const markRead = useMutation({
    mutationFn: () => api.post(`/boards/${board.id}/portal/read`),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["portal-settings", board.id] }),
  });
  useEffect(() => {
    if (open && tab === "inbox" && settings.data?.unread) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, settings.data?.unread]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "#fffef9",
          borderRadius: 3,
          boxShadow: "8px 8px 0 #181817",
        },
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Typography className="eyebrow">Client portal</Typography>
        <Typography variant="h5" component="div">
          Share progress, collect approvals, send updates
        </Typography>
      </DialogTitle>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        sx={{ px: 3, borderBottom: "1px solid #e1ddd3" }}
      >
        <Tab value="share" label="Share link" />
        <Tab
          value="inbox"
          label={
            <Stack direction="row" gap={1} alignItems="center">
              Client inbox
              {!!settings.data?.unread && (
                <Chip
                  size="small"
                  color="secondary"
                  label={settings.data.unread}
                />
              )}
            </Stack>
          }
        />
        <Tab value="update" label="AI client update" />
        <Tab value="brand" label="Branding" />
      </Tabs>
      <DialogContent sx={{ minHeight: 420 }}>
        {settings.isLoading || !settings.data ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tab === "share" && (
              <ShareTab board={board} settings={settings.data} />
            )}
            {tab === "inbox" && (
              <InboxTab board={board} settings={settings.data} />
            )}
            {tab === "update" && (
              <UpdateTab board={board} settings={settings.data} />
            )}
            {tab === "brand" && (
              <BrandTab board={board} settings={settings.data} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UpgradeNote({ children }: { children: React.ReactNode }) {
  return (
    <Alert
      icon={<LockRounded />}
      severity="info"
      sx={{ bgcolor: "#f3f9dc", color: "#181817", border: "1px solid #c9e07a" }}
      action={
        <Button component={Link} to="/billing" size="small" variant="contained">
          Upgrade
        </Button>
      }
    >
      {children}
    </Alert>
  );
}

function ShareTab({
  board,
  settings,
}: {
  board: Board;
  settings: PortalSettings;
}) {
  const client = useQueryClient();
  const [clientName, setClientName] = useState(settings.clientName || "");
  const [clientEmail, setClientEmail] = useState(settings.clientEmail || "");
  const [welcome, setWelcome] = useState(settings.welcome || "");
  const [allowRequests, setAllowRequests] = useState(settings.allowRequests);
  const [weeklyUpdates, setWeeklyUpdates] = useState(
    Boolean(settings.weeklyUpdates),
  );
  const canAutoUpdate = Boolean(settings.entitlements.weeklyUpdates);
  const [copied, setCopied] = useState(false);
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["portal-settings", board.id] });
    client.invalidateQueries({ queryKey: ["board", board.id] });
  };
  const save = useMutation({
    mutationFn: (enabled: boolean) =>
      api.put(`/boards/${board.id}/portal`, {
        enabled,
        clientName: clientName.trim() || null,
        clientEmail: clientEmail.trim(),
        welcome: welcome.trim() || null,
        allowRequests,
        weeklyUpdates: canAutoUpdate ? weeklyUpdates : false,
      }),
    onSuccess: refresh,
  });
  const rotate = useMutation({
    mutationFn: () => api.post(`/boards/${board.id}/portal/rotate`),
    onSuccess: refresh,
  });
  const copy = async () => {
    if (!settings.url) return;
    try {
      await navigator.clipboard.writeText(settings.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; the link is still visible to copy manually */
    }
  };
  const upgradeRequired =
    (save.error as { response?: { status?: number } } | null)?.response
      ?.status === 402;

  return (
    <Stack gap={2.5} pt={2}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: settings.enabled ? "#181817" : "#eeebe2",
          color: settings.enabled ? "#fff" : "inherit",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          alignItems={{ sm: "center" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={850}>
              {settings.enabled ? "Portal is live" : "Portal is off"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.75, wordBreak: "break-all" }}
            >
              {settings.enabled && settings.url
                ? settings.url
                : "Clients get a no-login link to see progress, approve work and send requests. Cards marked hidden stay private."}
            </Typography>
          </Box>
          {settings.enabled && settings.url && (
            <Stack direction="row" gap={0.5}>
              <Tooltip title={copied ? "Copied!" : "Copy link"}>
                <IconButton onClick={copy} sx={{ color: "#d8ff63" }}>
                  {copied ? <CheckCircleRounded /> : <ContentCopyRounded />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Open as your client sees it">
                <IconButton
                  component="a"
                  href={settings.url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: "#fff" }}
                >
                  <OpenInNewRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title="Replace link (old link stops working)">
                <IconButton
                  onClick={() => rotate.mutate()}
                  sx={{ color: "#fff" }}
                >
                  <RefreshRounded />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          <Button
            variant="contained"
            onClick={() => save.mutate(!settings.enabled)}
            disabled={save.isPending}
            sx={
              settings.enabled
                ? { bgcolor: "#fff", color: "#181817", boxShadow: "none" }
                : {
                    bgcolor: "#d8ff63",
                    color: "#181817",
                    boxShadow: "3px 3px 0 #181817",
                  }
            }
          >
            {settings.enabled ? "Turn off" : "Publish portal"}
          </Button>
        </Stack>
      </Box>
      {settings.paused && (
        <UpgradeNote>
          This portal is paused: your current plan includes{" "}
          {settings.entitlements.clientPortals} live portal. Upgrade to bring
          it back. Nothing was deleted.
        </UpgradeNote>
      )}
      {upgradeRequired ? (
        <UpgradeNote>{errorMessage(save.error)}</UpgradeNote>
      ) : (
        save.error && <Alert severity="error">{errorMessage(save.error)}</Alert>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
        <TextField
          label="Client or company name"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          fullWidth
        />
        <TextField
          label="Client email (for approvals & updates)"
          type="email"
          value={clientEmail}
          onChange={(event) => setClientEmail(event.target.value)}
          fullWidth
        />
      </Stack>
      <TextField
        label="Welcome note shown at the top of the portal"
        placeholder="Hi Sam — here's where your website redesign stands. Anything marked 'Waiting on you' needs a quick look."
        multiline
        minRows={3}
        value={welcome}
        onChange={(event) => setWelcome(event.target.value)}
      />
      <FormControlLabel
        control={
          <Switch
            checked={allowRequests}
            onChange={(event) => setAllowRequests(event.target.checked)}
          />
        }
        label="Let the client submit new requests (they land in your first list)"
      />
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={canAutoUpdate && weeklyUpdates}
              disabled={!canAutoUpdate}
              onChange={(event) => setWeeklyUpdates(event.target.checked)}
            />
          }
          label="Email the client an AI-written update every Friday"
        />
        <Typography variant="caption" color="text.secondary" display="block" ml={6}>
          {!canAutoUpdate
            ? "Available on Pro and Team."
            : !clientEmail.trim()
              ? "Add the client's email above to turn this on."
              : settings.lastAutoUpdateAt
                ? `Last sent ${new Date(settings.lastAutoUpdateAt).toLocaleDateString()}. Weeks with no activity are skipped, and you get a copy of each email.`
                : "Weeks with no activity are skipped, and you get a copy of each email."}
        </Typography>
      </Box>
      <Stack direction="row" gap={1}>
        <Button
          variant="outlined"
          onClick={() => save.mutate(settings.enabled)}
          disabled={save.isPending}
        >
          Save details
        </Button>
        {save.isSuccess && (
          <Typography variant="body2" color="success.main" alignSelf="center">
            Saved
          </Typography>
        )}
      </Stack>
      {settings.plan === "free" && (
        <Typography variant="body2" color="text.secondary">
          Free includes 1 live portal. Pro unlocks unlimited portals, your logo
          and colors, and emailing AI updates to clients.
        </Typography>
      )}
    </Stack>
  );
}

function InboxTab({
  board,
  settings,
}: {
  board: Board;
  settings: PortalSettings;
}) {
  const cardTitles = new Map(
    (board.lists || []).flatMap((list) =>
      list.cards.map((card) => [card.id, card.title]),
    ),
  );
  if (!settings.feedback.length)
    return (
      <Box sx={{ textAlign: "center", py: 8, color: "#77736b" }}>
        <Typography fontWeight={800} color="#181817">
          No client activity yet
        </Typography>
        <Typography variant="body2" mt={0.5}>
          Approvals, change requests, comments and new requests from your client
          will appear here and in your email.
        </Typography>
      </Box>
    );
  const kindStyle = {
    approved: { label: "Approved", bg: "#e3f6c8" },
    changes_requested: { label: "Changes requested", bg: "#ffe1d8" },
    comment: { label: "Comment", bg: "#eeebe2" },
    request: { label: "New request", bg: "#dbeafe" },
  } as const;
  return (
    <Stack gap={1.25} pt={2}>
      {settings.feedback.map((entry) => (
        <Box
          key={entry.id}
          component={entry.cardId ? Link : "div"}
          to={
            entry.cardId
              ? `/boards/${board.id}?card=${entry.cardId}`
              : undefined
          }
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid #e1ddd3",
            bgcolor: entry.readAt ? "transparent" : "#fbfde9",
            color: "inherit",
            textDecoration: "none",
            display: "block",
          }}
        >
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              label={kindStyle[entry.kind].label}
              sx={{ bgcolor: kindStyle[entry.kind].bg, fontWeight: 800 }}
            />
            <Typography fontWeight={800}>{entry.authorName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDistanceToNow(new Date(entry.createdAt))} ago
            </Typography>
          </Stack>
          {entry.cardId && cardTitles.get(entry.cardId) && (
            <Typography variant="body2" mt={0.75} fontWeight={700}>
              {cardTitles.get(entry.cardId)}
            </Typography>
          )}
          {entry.kind !== "approved" && (
            <Typography
              variant="body2"
              mt={0.5}
              sx={{ whiteSpace: "pre-line" }}
            >
              {entry.message}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}

function UpdateTab({
  board,
  settings,
}: {
  board: Board;
  settings: PortalSettings;
}) {
  const [tone, setTone] = useState<"friendly" | "formal" | "brief">("friendly");
  const [to, setTo] = useState(settings.clientEmail || "");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const generate = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ subject: string; body: string; to: string | null }>(
          `/boards/${board.id}/ai/client-update`,
          { tone },
        )
      ).data,
    onSuccess: (data) => {
      setSubject(data.subject);
      setText(data.body);
      if (data.to && !to) setTo(data.to);
    },
  });
  const send = useMutation({
    mutationFn: () =>
      api.post(`/boards/${board.id}/client-update/send`, {
        to: to.trim(),
        subject: subject.trim(),
        body: text.trim(),
      }),
  });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${subject}\n\n${text}${settings.enabled && settings.url ? `\n\nLive project: ${settings.url}` : ""}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };
  const sendBlocked =
    (send.error as { response?: { status?: number } } | null)?.response
      ?.status === 402;
  return (
    <Stack gap={2} pt={2}>
      <Typography color="text.secondary">
        Writes this week’s client update from the live board: what shipped,
        what’s next and what’s waiting on them. Hidden cards are never
        mentioned.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={1.5}
        alignItems={{ sm: "center" }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={tone}
          onChange={(_, value) => value && setTone(value)}
        >
          <ToggleButton value="friendly">Friendly</ToggleButton>
          <ToggleButton value="formal">Formal</ToggleButton>
          <ToggleButton value="brief">Brief</ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant="contained"
          startIcon={
            generate.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AutoAwesomeRounded />
            )
          }
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          sx={{
            bgcolor: "#d8ff63",
            color: "#181817",
            boxShadow: "3px 3px 0 #181817",
          }}
        >
          {text ? "Regenerate" : "Write update"}
        </Button>
      </Stack>
      {generate.error && (
        <Alert severity="error">{errorMessage(generate.error)}</Alert>
      )}
      {text && (
        <>
          <TextField
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            size="small"
          />
          <TextField
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            size="small"
          />
          <TextField
            label="Message"
            multiline
            minRows={9}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {sendBlocked && <UpgradeNote>{errorMessage(send.error)}</UpgradeNote>}
          {send.error && !sendBlocked && (
            <Alert severity="error">{errorMessage(send.error)}</Alert>
          )}
          {send.isSuccess && (
            <Alert severity="success">Update sent to {to}.</Alert>
          )}
          <Stack direction="row" gap={1}>
            <Button
              variant="contained"
              startIcon={<SendRounded />}
              disabled={!to.trim() || !subject.trim() || send.isPending}
              onClick={() => send.mutate()}
            >
              Send to client
            </Button>
            <Button startIcon={<ContentCopyRounded />} onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

function BrandTab({
  board,
  settings,
}: {
  board: Board;
  settings: PortalSettings;
}) {
  const client = useQueryClient();
  const workspace = useQuery({
    queryKey: ["workspace", board.workspaceId],
    queryFn: async () =>
      (await api.get<Workspace>(`/workspaces/${board.workspaceId}`)).data,
  });
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#181817");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  useEffect(() => {
    if (!workspace.data) return;
    setBrandName(workspace.data.brandName || workspace.data.name);
    setBrandColor(workspace.data.brandColor || "#181817");
    setBrandLogoUrl(workspace.data.brandLogoUrl || "");
  }, [workspace.data]);
  const save = useMutation({
    mutationFn: () =>
      api.put(`/workspaces/${board.workspaceId}/branding`, {
        brandName: brandName.trim() || null,
        brandColor,
        brandLogoUrl: brandLogoUrl.trim(),
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["workspace", board.workspaceId] }),
  });
  const locked = !settings.entitlements.portalBranding;
  return (
    <Stack gap={2.5} pt={2}>
      {locked && (
        <UpgradeNote>
          Put your own logo, name and color on every client portal and email
          with Pro.
        </UpgradeNote>
      )}
      <Typography variant="body2" color="text.secondary">
        Applies to every portal in this workspace.
        {!settings.entitlements.whiteLabel &&
          " A small “Client portal by danto” link is shown unless you’re on the Team plan."}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
        <TextField
          label="Business name"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          disabled={locked}
          fullWidth
        />
        <TextField
          label="Accent color"
          type="color"
          value={brandColor}
          onChange={(e) => setBrandColor(e.target.value)}
          disabled={locked}
          sx={{ width: { sm: 160 } }}
        />
      </Stack>
      <TextField
        label="Logo URL (PNG or SVG)"
        placeholder="https://yourstudio.com/logo.png"
        value={brandLogoUrl}
        onChange={(e) => setBrandLogoUrl(e.target.value)}
        disabled={locked}
      />
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px dashed #aaa59a",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {brandLogoUrl ? (
          <Box
            component="img"
            src={brandLogoUrl}
            alt=""
            sx={{ height: 32, maxWidth: 140, objectFit: "contain" }}
          />
        ) : (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: brandColor,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
            }}
          >
            {(brandName || "D").slice(0, 1).toUpperCase()}
          </Box>
        )}
        <Typography fontWeight={850}>{brandName || "Your business"}</Typography>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Preview
        </Typography>
      </Box>
      {save.error && <Alert severity="error">{errorMessage(save.error)}</Alert>}
      {save.isSuccess && <Alert severity="success">Branding saved.</Alert>}
      <Box>
        <Button
          variant="contained"
          disabled={locked || save.isPending}
          onClick={() => save.mutate()}
        >
          Save branding
        </Button>
      </Box>
    </Stack>
  );
}
