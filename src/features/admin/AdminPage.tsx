import axios from "axios";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  MenuItem,
  Pagination,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, errorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";

type Plan = "free" | "pro" | "business";
const planLabel: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Team",
};

interface Overview {
  users: number;
  trials: {
    active: number;
    endingIn7Days: number;
    finished: number;
    converted: number;
    conversionRate: number | null;
  };
  newUsers7d: number;
  newUsers30d: number;
  activeUsers7d: number;
  workspaces: number;
  activePlans: { pro: number; business: number };
  compedAccounts: number;
  payingCustomers: number;
  estimatedMrr: number;
  mrrGoal: number;
  arpu: number;
  cancelled30d: number;
  collectedLast30Days: number;
  portalsLive: number;
  approvals30d: number;
  clientInteractions30d: number;
  funnel: Array<{ step: string; total: number }>;
  signupSeries: Array<{ day: string; total: number }>;
  revenueSeries: Array<{ day: string; amount: number }>;
  sources: Array<{ source: string; total: number }>;
  aiLast30Days: { actions: number; estimatedCostUsd: number };
}

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  suspendedAt: string | null;
  signupSource: string | null;
  effectivePlan: Plan;
  billingStatus: string | null;
  currentPeriodEnd: string | null;
  paypalSubscriptionId: string | null;
  aiRequestsThisMonth: number | null;
  boards: number;
  portals: number;
}

interface Discount {
  id: string;
  code: string;
  percentOff: number;
  plan: "pro" | "business" | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 2 : 0 })}`;
const ago = (value: string | null) =>
  value ? `${formatDistanceToNow(new Date(value))} ago` : "Never";

export function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<
    "overview" | "users" | "discounts" | "payments" | "audit"
  >("overview");
  // Same query as the Overview tab, so it costs no extra request.
  const session = useQuery(overviewQuery);
  if (user && !user.isAdmin) return <Navigate to="/app" replace />;
  if (needsAdminCode(session.error))
    return <Navigate to="/admin/login" replace />;
  return (
    <Box
      sx={{
        maxWidth: 1280,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Typography className="mono-label" color="text.secondary">
        Admin
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 50 }, mt: 0.5 }}>
        Business control room
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        sx={{ mt: 2, mb: 3, borderBottom: "1px solid var(--line)" }}
      >
        <Tab value="overview" label="Overview" />
        <Tab value="users" label="Users" />
        <Tab value="discounts" label="Discounts" />
        <Tab value="payments" label="Payments" />
        <Tab value="audit" label="Audit log" />
      </Tabs>
      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "discounts" && <DiscountsTab />}
      {tab === "payments" && <PaymentsTab />}
      {tab === "audit" && <AuditTab />}
    </Box>
  );
}

/* ------------------------------ Overview ------------------------------ */

const overviewQuery = {
  queryKey: ["admin-overview"],
  queryFn: async () => (await api.get<Overview>("/admin/overview")).data,
  refetchInterval: 60_000,
  retry: false,
};

/** True when the API wants a fresh admin code sign-in. */
function needsAdminCode(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    error.response.data?.details?.code === "admin_otp_required"
  );
}

function OverviewTab() {
  const overview = useQuery(overviewQuery);
  if (overview.isLoading) return <Loading />;
  if (overview.error)
    return <Alert severity="error">{errorMessage(overview.error)}</Alert>;
  const data = overview.data!;
  const goalPct = Math.min(100, (data.estimatedMrr / data.mrrGoal) * 100);
  return (
    <Stack gap={3}>
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          bgcolor: "var(--panel)",
          color: "#fff",
          boxShadow: "6px 6px 0 #d8ff63",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={3}
          alignItems={{ md: "flex-end" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
              Monthly recurring revenue
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 52, md: 72 },
                fontWeight: 850,
                letterSpacing: "-.05em",
                lineHeight: 1,
              }}
            >
              {money(data.estimatedMrr)}
            </Typography>
            <Typography sx={{ color: "#b9b7af", mt: 1 }}>
              {money(
                data.mrrGoal - data.estimatedMrr > 0
                  ? data.mrrGoal - data.estimatedMrr
                  : 0,
              )}{" "}
              to the {money(data.mrrGoal)} goal · {data.payingCustomers} paying
              · {money(data.arpu)} average per customer
            </Typography>
          </Box>
          <Box sx={{ width: { xs: "100%", md: 360 } }}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="body2" sx={{ color: "#b9b7af" }}>
                Goal progress
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {goalPct.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={goalPct}
              aria-label="Progress to MRR goal"
              sx={{
                height: 12,
                borderRadius: 99,
                bgcolor: "rgba(255,255,255,.14)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "var(--acid)",
                  borderRadius: 99,
                },
              }}
            />
            <Typography variant="body2" sx={{ color: "#b9b7af", mt: 1 }}>
              Pro {data.activePlans.pro} · Team {data.activePlans.business} ·
              Comped & trials {data.compedAccounts}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box className="admin-stat-grid">
        <Stat
          label="Total users"
          value={data.users}
          hint={`+${data.newUsers7d} this week`}
        />
        <Stat
          label="Active last 7 days"
          value={data.activeUsers7d}
          hint={`${data.users ? Math.round((data.activeUsers7d / data.users) * 100) : 0}% of users`}
        />
        <Stat
          label="Collected, 30 days"
          value={money(data.collectedLast30Days)}
          hint={`${data.cancelled30d} cancellations`}
        />
        <Stat
          label="Live client portals"
          value={data.portalsLive}
          hint={`${data.approvals30d} approvals in 30 days`}
        />
        <Stat
          label="Client interactions"
          value={data.clientInteractions30d}
          hint="Approvals, comments, requests · 30 days"
        />
        <Stat
          label="AI cost, 30 days"
          value={money(data.aiLast30Days.estimatedCostUsd)}
          hint={`${data.aiLast30Days.actions} AI actions`}
        />
        <Stat
          label="In Pro trial now"
          value={data.trials.active}
          hint={`${data.trials.endingIn7Days} ending in the next 7 days`}
        />
        <Stat
          label="Trial to paid"
          value={
            data.trials.conversionRate === null
              ? "–"
              : `${Math.round(data.trials.conversionRate * 100)}%`
          }
          hint={`${data.trials.converted} of ${data.trials.finished} finished trials, last 75 days`}
        />
        <Stat
          label="New users, 30 days"
          value={data.newUsers30d}
          hint={`${data.newUsers7d} in the last 7 days`}
        />
      </Box>

      <Box className="admin-two-col">
        <Panel
          title="Sign-ups per day"
          detail={`${data.newUsers30d} in the last 30 days`}
        >
          <DailyBars
            series={fillDays(
              data.signupSeries.map((row) => ({
                day: row.day,
                value: row.total,
              })),
            )}
            format={(value) => `${value} sign-up${value === 1 ? "" : "s"}`}
          />
        </Panel>
        <Panel
          title="Revenue collected per day"
          detail={`${money(data.collectedLast30Days)} in the last 30 days`}
        >
          <DailyBars
            series={fillDays(
              data.revenueSeries.map((row) => ({
                day: row.day,
                value: row.amount,
              })),
            )}
            format={(value) => money(value)}
          />
        </Panel>
      </Box>

      <Box className="admin-two-col">
        <Panel
          title="Activation funnel"
          detail="Unique accounts reaching each step, all time"
        >
          <Funnel steps={data.funnel} />
        </Panel>
        <Panel
          title="Where sign-ups come from"
          detail="First ?ref, utm_source or referrer, last 30 days"
        >
          {data.sources.length ? (
            <Funnel
              steps={data.sources.map((row) => ({
                step: row.source,
                total: row.total,
              }))}
              relative={false}
            />
          ) : (
            <Typography color="text.secondary">No sign-ups yet.</Typography>
          )}
        </Panel>
      </Box>
    </Stack>
  );
}

function fillDays(rows: Array<{ day: string; value: number }>) {
  const byDay = new Map(rows.map((row) => [row.day, row.value]));
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.now() - (29 - index) * 86_400_000);
    const key = format(date, "yyyy-MM-dd");
    return { day: key, value: byDay.get(key) || 0 };
  });
}

function DailyBars({
  series,
  format: formatValue,
}: {
  series: Array<{ day: string; value: number }>;
  format: (value: number) => string;
}) {
  const max = Math.max(1, ...series.map((point) => point.value));
  return (
    <Box>
      <Box
        role="img"
        aria-label="Daily bar chart, last 30 days"
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: "2px",
          height: 150,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {series.map((point) => (
          <Tooltip
            key={point.day}
            arrow
            title={`${format(new Date(`${point.day}T12:00:00`), "EEE, MMM d")} · ${formatValue(point.value)}`}
          >
            <Box
              sx={{
                flex: 1,
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                cursor: "default",
                "&:hover > div": { bgcolor: "#ff5c35" },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: `${point.value ? Math.max(3, (point.value / max) * 100) : 0}%`,
                  bgcolor: "var(--panel)",
                  borderRadius: "4px 4px 0 0",
                  transition: "background-color .12s",
                }}
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between" mt={0.75}>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(`${series[0].day}T12:00:00`), "MMM d")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Peak{" "}
          {formatValue(max === 1 && !series.some((p) => p.value) ? 0 : max)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Today
        </Typography>
      </Stack>
    </Box>
  );
}

function Funnel({
  steps,
  relative = true,
}: {
  steps: Array<{ step: string; total: number }>;
  relative?: boolean;
}) {
  const top = Math.max(1, steps[0]?.total || 0, ...steps.map((s) => s.total));
  return (
    <Stack gap={1.25}>
      {steps.map((step, index) => {
        const previous = index ? steps[index - 1].total : 0;
        const conversion =
          relative && index && previous
            ? Math.round((step.total / previous) * 100)
            : null;
        return (
          <Tooltip
            key={step.step}
            placement="top-start"
            title={`${step.step}: ${step.total.toLocaleString()}`}
          >
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" fontWeight={700}>
                  {step.step}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.total.toLocaleString()}
                  {conversion !== null && ` · ${conversion}% of previous`}
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 10,
                  bgcolor: "var(--surface-2)",
                  borderRadius: 99,
                }}
              >
                <Box
                  sx={{
                    width: `${(step.total / top) * 100}%`,
                    minWidth: step.total ? 6 : 0,
                    height: "100%",
                    bgcolor: "var(--panel)",
                    borderRadius: 99,
                  }}
                />
              </Box>
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

/* ------------------------------- Users -------------------------------- */

function UsersTab() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const users = useQuery({
    queryKey: ["admin-users", debounced, filter, page],
    queryFn: async () =>
      (
        await api.get<{
          users: AdminUserRow[];
          total: number;
          pageSize: number;
        }>("/admin/users", {
          params: { search: debounced, filter, page },
        })
      ).data,
    placeholderData: (previous) => previous,
  });
  return (
    <Stack gap={2}>
      <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
        <TextField
          size="small"
          placeholder="Search name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <SearchRounded sx={{ mr: 1, color: "var(--muted-2)" }} />
              ),
            },
          }}
          sx={{ width: { sm: 340 } }}
        />
        <TextField
          select
          size="small"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setPage(1);
          }}
          sx={{ width: { sm: 220 } }}
        >
          <MenuItem value="all">All users</MenuItem>
          <MenuItem value="paying">Paying</MenuItem>
          <MenuItem value="free">Free</MenuItem>
          <MenuItem value="active7d">Active in last 7 days</MenuItem>
          <MenuItem value="pastdue">Past due</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Typography color="text.secondary" alignSelf="center" variant="body2">
          {users.data ? `${users.data.total.toLocaleString()} users` : ""}
        </Typography>
        <ExportUsersButton />
      </Stack>
      {users.error && (
        <Alert severity="error">{errorMessage(users.error)}</Alert>
      )}
      <Box className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Boards</th>
              <th>Portals</th>
              <th>AI used</th>
              <th>Joined</th>
              <th>Last seen</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {users.data?.users.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row.id)}
                tabIndex={0}
                onKeyDown={(event) =>
                  event.key === "Enter" && setSelected(row.id)
                }
              >
                <td>
                  <Typography fontWeight={800} fontSize={14}>
                    {row.name}
                    {row.suspendedAt && (
                      <Chip
                        size="small"
                        label="Suspended"
                        color="error"
                        sx={{ ml: 1, height: 20 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.email}
                  </Typography>
                </td>
                <td>
                  <PlanChip
                    plan={row.effectivePlan}
                    comped={
                      row.effectivePlan !== "free" && !row.paypalSubscriptionId
                    }
                    status={row.billingStatus}
                  />
                </td>
                <td>{row.boards}</td>
                <td>{row.portals}</td>
                <td>{row.aiRequestsThisMonth ?? 0}</td>
                <td>{format(new Date(row.createdAt), "MMM d, yyyy")}</td>
                <td>{ago(row.lastSeenAt)}</td>
                <td>{row.signupSource || "direct"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.isLoading && <Loading />}
        {users.data && !users.data.users.length && (
          <Typography color="text.secondary" textAlign="center" py={5}>
            No users match.
          </Typography>
        )}
      </Box>
      {users.data && users.data.total > users.data.pageSize && (
        <Pagination
          page={page}
          onChange={(_, value) => setPage(value)}
          count={Math.ceil(users.data.total / users.data.pageSize)}
          sx={{ alignSelf: "center" }}
        />
      )}
      <UserDrawer userId={selected} onClose={() => setSelected(null)} />
    </Stack>
  );
}

function PlanChip({
  plan,
  comped,
  status,
}: {
  plan: Plan;
  comped?: boolean;
  status?: string | null;
}) {
  const bg =
    plan === "business"
      ? "var(--selected-bg)"
      : plan === "pro"
        ? "var(--acid)"
        : "var(--surface-2)";
  return (
    <Stack direction="row" gap={0.5} alignItems="center">
      <Chip
        size="small"
        label={planLabel[plan]}
        sx={{
          bgcolor: bg,
          color:
            plan === "business"
              ? "var(--selected-fg)"
              : plan === "pro"
                ? "var(--on-accent)"
                : "var(--ink)",
          fontWeight: 800,
        }}
      />
      {comped && (
        <Chip size="small" variant="outlined" label="Trial / comped" />
      )}
      {status === "past_due" && (
        <Chip size="small" color="warning" label="Past due" />
      )}
    </Stack>
  );
}

interface UserDetail {
  user: AdminUserRow & { passwordChangedAt: string | null };
  subscription: {
    plan: Plan;
    effectivePlan: Plan;
    billingStatus: string;
    currentPeriodEnd: string | null;
    paypalSubscriptionId: string | null;
    aiRequestsThisMonth: number;
  } | null;
  workspaces: Array<{
    id: string;
    name: string;
    members: number;
    boards: Array<{
      id: string;
      name: string;
      template: string;
      portalEnabled: boolean;
      createdAt: string;
    }>;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    currency: string;
    status: string;
    occurredAt: string;
    plan: Plan | null;
  }>;
  ai: Array<{ feature: string; total: number; costUsd: number }>;
  activity: Array<{ action: string; createdAt: string; boardName: string }>;
  audit: Array<{
    id: string;
    action: string;
    createdAt: string;
    meta: unknown;
  }>;
  redemptions: Array<{ code: string; plan: Plan; createdAt: string }>;
}

function UserDrawer({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [notice, setNotice] = useState("");
  const [grant, setGrant] = useState<{ plan: Plan; days: string }>({
    plan: "pro",
    days: "30",
  });
  const [emailOpen, setEmailOpen] = useState(false);
  const detail = useQuery({
    queryKey: ["admin-user", userId],
    enabled: !!userId,
    queryFn: async () =>
      (await api.get<UserDetail>(`/admin/users/${userId}`)).data,
  });
  useEffect(() => setNotice(""), [userId]);
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["admin-user", userId] });
    client.invalidateQueries({ queryKey: ["admin-users"] });
    client.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const action = useMutation({
    mutationFn: async ({
      path,
      payload,
    }: {
      path: string;
      payload?: unknown;
      done: string;
    }) => api.post(`/admin/users/${userId}/${path}`, payload || {}),
    onSuccess: (_, variables) => {
      setNotice(variables.done);
      refresh();
    },
  });
  const data = detail.data;
  return (
    <Drawer
      anchor="right"
      open={!!userId}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 560 }, bgcolor: "var(--surface)" },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{ p: 2.5, borderBottom: "1px solid var(--line)" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" noWrap>
            {data?.user.name || "User"}
          </Typography>
          {data && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Typography variant="body2" color="text.secondary" noWrap>
                {data.user.email}
              </Typography>
              <IconButton
                size="small"
                aria-label="Copy email"
                onClick={() => navigator.clipboard?.writeText(data.user.email)}
              >
                <ContentCopyRounded sx={{ fontSize: 15 }} />
              </IconButton>
            </Stack>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseRounded />
        </IconButton>
      </Stack>
      {detail.isLoading || !data ? (
        <Loading />
      ) : (
        <Stack gap={3} sx={{ p: 2.5, overflowY: "auto" }}>
          {notice && <Alert onClose={() => setNotice("")}>{notice}</Alert>}
          {action.error && (
            <Alert severity="error">{errorMessage(action.error)}</Alert>
          )}

          <Box className="admin-detail-grid">
            <Detail
              label="Plan"
              value={
                <PlanChip
                  plan={data.subscription?.effectivePlan || "free"}
                  comped={
                    !!data.subscription &&
                    data.subscription.effectivePlan !== "free" &&
                    !data.subscription.paypalSubscriptionId
                  }
                  status={data.subscription?.billingStatus}
                />
              }
            />
            <Detail
              label="Renews / ends"
              value={
                data.subscription?.currentPeriodEnd
                  ? format(
                      new Date(data.subscription.currentPeriodEnd),
                      "MMM d, yyyy",
                    )
                  : "—"
              }
            />
            <Detail
              label="Joined"
              value={format(new Date(data.user.createdAt), "MMM d, yyyy")}
            />
            <Detail label="Last seen" value={ago(data.user.lastSeenAt)} />
            <Detail
              label="Signup source"
              value={data.user.signupSource || "direct"}
            />
            <Detail
              label="AI this period"
              value={String(data.subscription?.aiRequestsThisMonth ?? 0)}
            />
          </Box>

          <Section title="Grant or change plan">
            <Stack direction="row" gap={1} flexWrap="wrap">
              <TextField
                select
                size="small"
                label="Plan"
                value={grant.plan}
                onChange={(event) =>
                  setGrant({ ...grant, plan: event.target.value as Plan })
                }
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="pro">Pro</MenuItem>
                <MenuItem value="business">Team</MenuItem>
                <MenuItem value="free">Free</MenuItem>
              </TextField>
              {grant.plan !== "free" && (
                <TextField
                  select
                  size="small"
                  label="For"
                  value={grant.days}
                  onChange={(event) =>
                    setGrant({ ...grant, days: event.target.value })
                  }
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="14">14 days</MenuItem>
                  <MenuItem value="30">30 days</MenuItem>
                  <MenuItem value="90">90 days</MenuItem>
                  <MenuItem value="365">1 year</MenuItem>
                  <MenuItem value="forever">No end date</MenuItem>
                </TextField>
              )}
              <Button
                variant="contained"
                disabled={action.isPending}
                onClick={() =>
                  action.mutate({
                    path: "plan",
                    payload: {
                      plan: grant.plan,
                      days:
                        grant.days === "forever" ? null : Number(grant.days),
                    },
                    done:
                      grant.plan === "free"
                        ? "Moved to Free."
                        : `${planLabel[grant.plan]} granted.`,
                  })
                }
              >
                Apply
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1}
            >
              Comped plans don't count toward MRR and end automatically after
              the chosen period.
            </Typography>
          </Section>

          <Section title="Account actions">
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                onClick={() => setEmailOpen(true)}
              >
                Email user
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={action.isPending}
                onClick={() =>
                  action.mutate({
                    path: "password-reset",
                    done: "Reset link emailed. A fresh code is sent when they open it.",
                  })
                }
              >
                Send password reset
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={action.isPending}
                onClick={() =>
                  action.mutate({
                    path: "reset-ai",
                    done: "AI allowance reset.",
                  })
                }
              >
                Reset AI allowance
              </Button>
              <Button
                variant="outlined"
                size="small"
                color={data.user.suspendedAt ? "success" : "error"}
                disabled={action.isPending}
                onClick={() =>
                  action.mutate({
                    path: "suspend",
                    payload: { suspended: !data.user.suspendedAt },
                    done: data.user.suspendedAt
                      ? "Account restored."
                      : "Account suspended. They can't sign in.",
                  })
                }
              >
                {data.user.suspendedAt ? "Restore account" : "Suspend account"}
              </Button>
            </Stack>
          </Section>

          <Section title={`Workspaces (${data.workspaces.length})`}>
            {data.workspaces.length ? (
              data.workspaces.map((workspace) => (
                <Box key={workspace.id} sx={{ mb: 1.5 }}>
                  <Typography fontWeight={800} fontSize={14}>
                    {workspace.name}{" "}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      · {workspace.members} member
                      {workspace.members === 1 ? "" : "s"}
                    </Typography>
                  </Typography>
                  {workspace.boards.map((board) => (
                    <Stack
                      key={board.id}
                      direction="row"
                      gap={1}
                      alignItems="center"
                      sx={{ pl: 1.5, mt: 0.5 }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {board.name}
                      </Typography>
                      {board.portalEnabled && (
                        <Chip
                          size="small"
                          label="Portal live"
                          sx={{ bgcolor: "var(--tint-green)", height: 20 }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {board.template}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Hasn't created a workspace yet.
              </Typography>
            )}
          </Section>

          <Section title="Recent activity">
            {data.activity.length ? (
              data.activity.slice(0, 12).map((row, index) => (
                <Typography key={index} variant="body2" sx={{ py: 0.4 }}>
                  <strong>{row.action.replace(/[._]/g, " ")}</strong> ·{" "}
                  {row.boardName}{" "}
                  <Box component="span" sx={{ color: "var(--muted-2)" }}>
                    · {ago(row.createdAt)}
                  </Box>
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No activity yet.
              </Typography>
            )}
          </Section>

          <Section title="Payments">
            {data.payments.length ? (
              data.payments.map((payment) => (
                <Stack
                  key={payment.id}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ py: 0.4 }}
                >
                  <Typography variant="body2">
                    {format(new Date(payment.occurredAt), "MMM d, yyyy")} ·{" "}
                    {payment.plan ? planLabel[payment.plan] : "—"}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {payment.amount} {payment.currency} · {payment.status}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No payments.
              </Typography>
            )}
            {data.redemptions.map((r) => (
              <Typography key={r.code} variant="body2" color="text.secondary">
                Redeemed {r.code} on {format(new Date(r.createdAt), "MMM d")}
              </Typography>
            ))}
          </Section>

          <Section title="AI usage, last 30 days">
            {data.ai.length ? (
              data.ai.map((row) => (
                <Typography key={row.feature} variant="body2">
                  {row.feature.replace(/_/g, " ")}: {row.total} ·{" "}
                  {money(row.costUsd)}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                None.
              </Typography>
            )}
          </Section>

          {data.audit.length > 0 && (
            <Section title="Admin history">
              {data.audit.map((row) => (
                <Typography key={row.id} variant="body2">
                  {row.action.replace(/[._]/g, " ")} · {ago(row.createdAt)}
                </Typography>
              ))}
            </Section>
          )}
        </Stack>
      )}
      <EmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        onSend={(payload) =>
          action
            .mutateAsync({ path: "email", payload, done: "Email sent." })
            .then(() => setEmailOpen(false))
        }
        to={data?.user.email || ""}
      />
    </Drawer>
  );
}

function EmailDialog({
  open,
  onClose,
  onSend,
  to,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (payload: { subject: string; message: string }) => Promise<void>;
  to: string;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Email {to}</DialogTitle>
      <DialogContent>
        <Stack gap={2} pt={1}>
          <TextField
            label="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
          <TextField
            label="Message"
            multiline
            minRows={6}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!subject.trim() || !message.trim() || sending}
          onClick={async () => {
            setSending(true);
            try {
              await onSend({ subject, message });
              setSubject("");
              setMessage("");
            } finally {
              setSending(false);
            }
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ----------------------------- Discounts ------------------------------ */

function DiscountsTab() {
  const client = useQueryClient();
  const [form, setForm] = useState({
    code: "",
    percentOff: "50",
    plan: "any",
    maxRedemptions: "",
    expiresAt: "",
  });
  const discounts = useQuery({
    queryKey: ["admin-discounts"],
    queryFn: async () => (await api.get<Discount[]>("/admin/discounts")).data,
  });
  // Same rules as the server (trello-backend/src/validators/discounts.ts).
  const percent = Number(form.percentOff);
  const maxUses =
    form.maxRedemptions === "" ? null : Number(form.maxRedemptions);
  const problems = {
    code:
      form.code.length > 0 && form.code.length < 3
        ? "At least 3 characters"
        : "",
    percentOff:
      !Number.isInteger(percent) || percent < 5 || percent > 95
        ? "Whole number, 5–95"
        : "",
    maxRedemptions:
      maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 0)
        ? "Whole number"
        : "",
  };
  const invalid =
    form.code.length < 3 ||
    Boolean(problems.percentOff || problems.maxRedemptions);
  const create = useMutation({
    mutationFn: () =>
      api.post("/admin/discounts", {
        code: form.code.trim(),
        percentOff: Number(form.percentOff),
        plan: form.plan === "any" ? null : form.plan,
        maxRedemptions: maxUses || null,
        expiresAt: form.expiresAt
          ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
          : null,
      }),
    onSuccess: () => {
      setForm({
        code: "",
        percentOff: "50",
        plan: "any",
        maxRedemptions: "",
        expiresAt: "",
      });
      client.invalidateQueries({ queryKey: ["admin-discounts"] });
    },
  });
  const toggle = useMutation({
    mutationFn: (discount: Discount) =>
      api.patch(`/admin/discounts/${discount.id}`, {
        active: !discount.active,
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["admin-discounts"] }),
  });
  return (
    <Stack gap={3}>
      <Panel
        title="Create a discount code"
        detail="Applies to the first monthly payment; renewals return to the normal price."
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          gap={1.5}
          alignItems={{ md: "flex-start" }}
        >
          <TextField
            size="small"
            label="Code"
            placeholder="FOUNDER50"
            value={form.code}
            error={Boolean(problems.code)}
            helperText={problems.code || undefined}
            onChange={(event) =>
              setForm({
                ...form,
                code: event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9_-]/g, ""),
              })
            }
          />
          <TextField
            size="small"
            label="% off"
            type="number"
            value={form.percentOff}
            onChange={(event) =>
              setForm({ ...form, percentOff: event.target.value })
            }
            error={Boolean(problems.percentOff)}
            helperText={problems.percentOff || undefined}
            inputProps={{ min: 5, max: 95, step: 1 }}
            sx={{ width: { md: 100 } }}
          />
          <TextField
            select
            size="small"
            label="Plan"
            value={form.plan}
            onChange={(event) => setForm({ ...form, plan: event.target.value })}
            sx={{ width: { md: 140 } }}
          >
            <MenuItem value="any">Any plan</MenuItem>
            <MenuItem value="pro">Pro only</MenuItem>
            <MenuItem value="business">Team only</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Max uses"
            type="number"
            placeholder="Unlimited"
            value={form.maxRedemptions}
            onChange={(event) =>
              setForm({ ...form, maxRedemptions: event.target.value })
            }
            error={Boolean(problems.maxRedemptions)}
            helperText={problems.maxRedemptions || undefined}
            inputProps={{ min: 0, step: 1 }}
            sx={{ width: { md: 130 } }}
          />
          <TextField
            size="small"
            label="Expires"
            type="date"
            value={form.expiresAt}
            onChange={(event) =>
              setForm({ ...form, expiresAt: event.target.value })
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button
            variant="contained"
            disabled={invalid || create.isPending}
            onClick={() => create.mutate()}
          >
            Create
          </Button>
        </Stack>
        {create.error && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {errorMessage(create.error)}
          </Alert>
        )}
      </Panel>
      <Box className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Plan</th>
              <th>Used</th>
              <th>Expires</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {discounts.data?.map((discount) => (
              <tr key={discount.id} style={{ cursor: "default" }}>
                <td>
                  <Typography fontFamily="DM Mono, monospace" fontWeight={700}>
                    {discount.code}
                  </Typography>
                </td>
                <td>{discount.percentOff}% off first month</td>
                <td>{discount.plan ? planLabel[discount.plan] : "Any"}</td>
                <td>
                  {discount.redemptionCount}
                  {discount.maxRedemptions
                    ? ` / ${discount.maxRedemptions}`
                    : ""}
                </td>
                <td>
                  {discount.expiresAt
                    ? format(new Date(discount.expiresAt), "MMM d, yyyy")
                    : "Never"}
                </td>
                <td>
                  <Switch
                    checked={discount.active}
                    onChange={() => toggle.mutate(discount)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {discounts.isLoading && <Loading />}
        {discounts.data && !discounts.data.length && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No codes yet. Try FOUNDER50 for your first 50 customers.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

/* ------------------------- Payments & audit --------------------------- */

function PaymentsTab() {
  const resend = useMutation({
    mutationFn: (id: string) => api.post(`/admin/payments/${id}/receipt`),
  });
  const payments = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () =>
      (
        await api.get<
          Array<{
            id: string;
            status: string;
            amount: string;
            currency: string;
            plan: Plan | null;
            occurredAt: string;
            email: string | null;
            name: string | null;
            userId: string | null;
            receipt: string;
          }>
        >("/admin/payments")
      ).data,
  });
  return (
    <Box className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Plan</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {payments.data?.map((row) => (
            <tr key={row.id} style={{ cursor: "default" }}>
              <td>{format(new Date(row.occurredAt), "MMM d, yyyy HH:mm")}</td>
              <td>
                <Typography fontSize={14} fontWeight={700}>
                  {row.name || "Unknown"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.email || "—"}
                </Typography>
              </td>
              <td>{row.plan ? planLabel[row.plan] : "—"}</td>
              <td>
                {row.amount} {row.currency}
              </td>
              <td>
                <Chip
                  size="small"
                  label={row.status}
                  color={row.status === "completed" ? "success" : "default"}
                />
              </td>
              <td>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {row.receipt}
                </Typography>
                {row.userId && (
                  <Button
                    size="small"
                    sx={{ px: 0, minWidth: 0 }}
                    disabled={resend.isPending}
                    onClick={() => resend.mutate(row.id)}
                  >
                    {resend.variables === row.id && resend.isSuccess
                      ? "Sent"
                      : "Resend receipt"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.isLoading && <Loading />}
      {payments.data && !payments.data.length && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No payments yet.
        </Typography>
      )}
    </Box>
  );
}

function AuditTab() {
  const audit = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () =>
      (
        await api.get<
          Array<{
            id: string;
            action: string;
            createdAt: string;
            adminEmail: string | null;
            targetEmail: string | null;
            meta: unknown;
          }>
        >("/admin/audit")
      ).data,
  });
  return (
    <Box className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Admin</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {audit.data?.map((row) => (
            <tr key={row.id} style={{ cursor: "default" }}>
              <td>{format(new Date(row.createdAt), "MMM d, HH:mm")}</td>
              <td>{row.adminEmail || "—"}</td>
              <td>{row.action.replace(/[._]/g, " ")}</td>
              <td>{row.targetEmail || "—"}</td>
              <td>
                <Typography
                  variant="caption"
                  fontFamily="DM Mono, monospace"
                  color="text.secondary"
                >
                  {row.meta ? JSON.stringify(row.meta).slice(0, 80) : ""}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {audit.data && !audit.data.length && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Every admin action (plan grants, suspensions, emails, discount
          changes) is recorded here.
        </Typography>
      )}
    </Box>
  );
}

/* ------------------------------ Shared -------------------------------- */

function Loading() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
      <CircularProgress />
    </Box>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 3,
        bgcolor: "var(--surface)",
        border: "1px solid var(--line)",
      }}
    >
      <Typography className="mono-label" color="text.secondary">
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 34,
          fontWeight: 850,
          letterSpacing: "-.04em",
          lineHeight: 1.15,
          mt: 0.5,
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {hint}
      </Typography>
    </Box>
  );
}

function Panel({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.75 },
        borderRadius: 3,
        bgcolor: "var(--surface)",
        border: "1px solid var(--line)",
        minWidth: 0,
      }}
    >
      <Typography fontWeight={850} fontSize={17}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {detail}
      </Typography>
      {children}
    </Box>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography className="mono-label" color="text.secondary" mb={1}>
        {title}
      </Typography>
      {children}
      <Divider sx={{ mt: 2.5 }} />
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ fontWeight: 700, fontSize: 14 }}>{value}</Box>
    </Box>
  );
}

function ExportUsersButton() {
  const exportCsv = useMutation({
    mutationFn: async () => {
      const response = await api.get<Blob>("/admin/export/users.csv", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `danto-users-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
  return (
    <Button
      variant="outlined"
      size="small"
      disabled={exportCsv.isPending}
      onClick={() => exportCsv.mutate()}
      sx={{ alignSelf: { sm: "center" } }}
    >
      {exportCsv.isPending ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
