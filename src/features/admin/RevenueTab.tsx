import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { api, errorMessage } from "../../lib/api";
import { Loading, Panel, Stat } from "./AdminParts";

type CustomerStatus =
  "paying" | "cancelling" | "trial" | "trial_cancelled" | "past_due" | "ended";

interface Revenue {
  generatedAt: string;
  mrrCents: number;
  arrCents: number;
  payingCustomers: number;
  arpuCents: number;
  trialPipeline: {
    count: number;
    valueCents: number;
    cancelledBeforePaying: number;
  };
  atRisk: { cancelling: number; pastDue: number; valueCents: number };
  last30Days: {
    newCustomers: number;
    newMrrCents: number;
    churnedCustomers: number;
    churnedMrrCents: number;
    cancellationsScheduled: number;
    reactivations: number;
    failedPayments: number;
    netMrrChangeCents: number;
    revenueChurnRate: number | null;
  };
  cash: {
    thisMonthCents: number;
    lastMonthCents: number;
    allTimeGrossCents: number;
    allTimeRefundsCents: number;
    allTimeNetCents: number;
    otherCurrencyPayments: number;
    months: Array<{ month: string; grossCents: number; refundCents: number }>;
  };
  users: { total: number; last30Days: number; growthRate: number | null };
  customers: Array<{
    userId: string;
    name: string | null;
    email: string | null;
    plan: string;
    interval: string;
    status: CustomerStatus;
    mrrCents: number;
    valueCents: number;
    paidCents: number;
    firstPaymentAt: string | null;
    periodEnd: string | null;
  }>;
  events: Array<{
    email: string | null;
    kind: string;
    plan: string | null;
    billingInterval: string | null;
    trial: boolean;
    mrrBeforeCents: number;
    mrrAfterCents: number;
    occurredAt: string;
  }>;
}

const MRR_GOAL_CENTS = 100_000;

/** $1,234 for whole dollars, $19.83 otherwise. */
const usd = (cents: number) => {
  const value = cents / 100;
  return `${value < 0 ? "−" : ""}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};
const pct = (value: number | null) =>
  value === null ? "–" : `${Math.round(value * 100)}%`;
const planName = (plan: string | null, interval: string | null) =>
  `${plan === "business" ? "Team" : plan === "pro" ? "Pro" : (plan ?? "")}${interval === "year" ? " yearly" : interval === "month" ? " monthly" : ""}`;

const statusChip: Record<
  CustomerStatus,
  { label: string; bg: string; fg: string }
> = {
  paying: {
    label: "Paying",
    bg: "var(--tint-green)",
    fg: "var(--success-ink)",
  },
  past_due: {
    label: "Payment failed",
    bg: "var(--tint-danger)",
    fg: "var(--ink)",
  },
  cancelling: {
    label: "Cancelling",
    bg: "var(--tint-orange)",
    fg: "var(--ink)",
  },
  trial: { label: "Trial with card", bg: "var(--tint-blue)", fg: "var(--ink)" },
  trial_cancelled: {
    label: "Cancelled in trial",
    bg: "var(--surface-2)",
    fg: "var(--muted)",
  },
  ended: { label: "Ended", bg: "var(--surface-2)", fg: "var(--muted)" },
};

const eventLabel = (event: Revenue["events"][number]) => {
  const plan = planName(event.plan, event.billingInterval);
  switch (event.kind) {
    case "subscribed":
      return event.trial
        ? `Started a ${plan} trial with a card`
        : `Subscribed to ${plan}`;
    case "cancel_scheduled":
      return `Cancelled ${plan} (keeps access until the period ends)`;
    case "reactivated":
      return `Turned ${plan} renewal back on`;
    case "payment_failed":
      return `Payment failed on ${plan}`;
    case "recovered":
      return `Payment recovered on ${plan}`;
    case "ended":
      return `${plan} ended`;
    case "plan_changed":
      return `Switched to ${plan}`;
    default:
      return event.kind;
  }
};

export function RevenueTab() {
  const revenue = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => (await api.get<Revenue>("/admin/revenue")).data,
    refetchInterval: 60_000,
    retry: false,
  });
  if (revenue.isLoading) return <Loading />;
  if (revenue.error)
    return <Alert severity="error">{errorMessage(revenue.error)}</Alert>;
  const data = revenue.data!;
  const goal = Math.min(100, (data.mrrCents / MRR_GOAL_CENTS) * 100);
  const m = data.last30Days;
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
              MRR from paying customers
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 52, md: 72 },
                fontWeight: 850,
                letterSpacing: "-.05em",
                lineHeight: 1,
              }}
            >
              {usd(data.mrrCents)}
            </Typography>
            <Typography sx={{ color: "#b9b7af", mt: 1 }}>
              {usd(data.arrCents)} ARR · {data.payingCustomers} paying ·{" "}
              {usd(data.arpuCents)} average per customer
            </Typography>
          </Box>
          <Box sx={{ width: { xs: "100%", md: 360 } }}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="body2" sx={{ color: "#b9b7af" }}>
                Goal: {usd(MRR_GOAL_CENTS)} MRR
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {goal.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={goal}
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
              Counts only customers who have paid. List price, before tax.
              Yearly plans count 1/12.
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box className="admin-stat-grid">
        <Stat
          label="New MRR, 30 days"
          value={`+${usd(m.newMrrCents)}`}
          hint={`${m.newCustomers} new paying customer${m.newCustomers === 1 ? "" : "s"}`}
        />
        <Stat
          label="Churned MRR, 30 days"
          value={m.churnedMrrCents ? `−${usd(m.churnedMrrCents)}` : usd(0)}
          hint={`${m.churnedCustomers} left · revenue churn ${pct(m.revenueChurnRate)}`}
        />
        <Stat
          label="Net MRR change, 30 days"
          value={`${m.netMrrChangeCents >= 0 ? "+" : ""}${usd(m.netMrrChangeCents)}`}
          hint={`${m.cancellationsScheduled} cancellation${m.cancellationsScheduled === 1 ? "" : "s"} · ${m.reactivations} came back`}
        />
        <Stat
          label="Trials with a card"
          value={data.trialPipeline.count}
          hint={`${usd(data.trialPipeline.valueCents)}/mo if they all convert · ${data.trialPipeline.cancelledBeforePaying} cancelled before paying`}
        />
        <Stat
          label="MRR at risk"
          value={usd(data.atRisk.valueCents)}
          hint={`${data.atRisk.cancelling} cancelling · ${data.atRisk.pastDue} with a failed payment`}
        />
        <Stat
          label="Cash this month"
          value={usd(data.cash.thisMonthCents)}
          hint={`${usd(data.cash.lastMonthCents)} last month, after refunds`}
        />
        <Stat
          label="Revenue, all time"
          value={usd(data.cash.allTimeNetCents)}
          hint={`${usd(data.cash.allTimeGrossCents)} charged · ${usd(data.cash.allTimeRefundsCents)} refunded`}
        />
        <Stat
          label="Users"
          value={data.users.total}
          hint={`+${data.users.last30Days} in 30 days · ${data.users.growthRate === null ? "no earlier month to compare" : `${data.users.growthRate >= 0 ? "+" : ""}${pct(data.users.growthRate)} vs the 30 days before`}`}
        />
        <Stat
          label="Failed payments, 30 days"
          value={m.failedPayments}
          hint="Dodo retries; access ends after a 3-day grace period"
        />
      </Box>

      <Box className="admin-two-col" sx={{ alignItems: "start" }}>
        <Panel
          title="Cash collected per month"
          detail="Payments minus refunds, USD, last 12 months"
        >
          <MonthBars months={data.cash.months} />
          {data.cash.otherCurrencyPayments > 0 && (
            <Typography variant="caption" color="text.secondary">
              {data.cash.otherCurrencyPayments} payment(s) in other currencies
              are not included.
            </Typography>
          )}
        </Panel>
        <ShareCard data={data} />
      </Box>

      <Panel
        title="Customers"
        detail="Everyone who has started a paid subscription or a trial with a card"
      >
        {data.customers.length ? (
          <Box sx={{ overflowX: "auto" }}>
            <Box
              component="table"
              className="admin-table"
              sx={{ width: "100%", minWidth: 760 }}
            >
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>MRR</th>
                  <th>Paid so far</th>
                  <th>First payment</th>
                  <th>Renews / ends</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((row) => {
                  const chip = statusChip[row.status];
                  const ends =
                    row.status === "cancelling" ||
                    row.status === "trial_cancelled" ||
                    row.status === "ended";
                  return (
                    <tr key={row.userId}>
                      <td>
                        <Typography fontWeight={700} fontSize={14}>
                          {row.name || "—"}
                        </Typography>
                        <Typography fontSize={13} color="text.secondary">
                          {row.email}
                        </Typography>
                      </td>
                      <td>{planName(row.plan, row.interval)}</td>
                      <td>
                        <Chip
                          size="small"
                          label={chip.label}
                          sx={{
                            bgcolor: chip.bg,
                            color: chip.fg,
                            fontWeight: 800,
                          }}
                        />
                      </td>
                      <td>{row.mrrCents ? usd(row.mrrCents) : "—"}</td>
                      <td>{usd(row.paidCents)}</td>
                      <td>
                        {row.firstPaymentAt
                          ? format(new Date(row.firstPaymentAt), "MMM d, yyyy")
                          : "Not yet"}
                      </td>
                      <td>
                        {row.periodEnd
                          ? `${ends ? "Ends" : row.status === "trial" ? "First charge" : "Renews"} ${format(new Date(row.periodEnd), "MMM d")}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">
            No paid subscriptions yet. They show up here the moment someone
            checks out.
          </Typography>
        )}
      </Panel>

      <Panel
        title="Subscription activity"
        detail="Starts, cancellations, failed payments and plan changes, newest first. Tracked from Nov 21, 2026."
      >
        {data.events.length ? (
          <Stack divider={<Box sx={{ borderTop: "1px solid var(--line)" }} />}>
            {data.events.map((event, index) => {
              const delta = event.mrrAfterCents - event.mrrBeforeCents;
              return (
                <Stack
                  key={index}
                  direction="row"
                  gap={2}
                  py={1.25}
                  alignItems="baseline"
                >
                  <Tooltip title={format(new Date(event.occurredAt), "PPpp")}>
                    <Typography
                      fontSize={13}
                      color="text.secondary"
                      sx={{ width: 110, flexShrink: 0 }}
                    >
                      {formatDistanceToNow(new Date(event.occurredAt))} ago
                    </Typography>
                  </Tooltip>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={14} fontWeight={700}>
                      {eventLabel(event)}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary" noWrap>
                      {event.email || "Deleted user"}
                    </Typography>
                  </Box>
                  {delta !== 0 && (
                    <Typography
                      fontSize={14}
                      fontWeight={800}
                      sx={{
                        color: delta > 0 ? "var(--success-ink)" : "#c2410c",
                      }}
                    >
                      {delta > 0 ? "+" : ""}
                      {usd(delta)}/mo
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Typography color="text.secondary">
            Nothing yet. New checkouts and cancellations appear here.
          </Typography>
        )}
      </Panel>
    </Stack>
  );
}

function MonthBars({ months }: { months: Revenue["cash"]["months"] }) {
  const values = months.map((row) => row.grossCents - row.refundCents);
  const max = Math.max(1, ...values);
  return (
    <Box>
      <Box
        role="img"
        aria-label="Cash collected per month, last 12 months"
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: "6px",
          height: 160,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {months.map((row, index) => (
          <Tooltip
            key={row.month}
            arrow
            title={`${format(new Date(`${row.month}-15T12:00:00`), "MMMM yyyy")} · ${usd(values[index])}${row.refundCents ? ` (${usd(row.refundCents)} refunded)` : ""}`}
          >
            <Box
              sx={{
                flex: 1,
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                "&:hover > div": { bgcolor: "#ff5c35" },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: `${values[index] > 0 ? Math.max(3, (values[index] / max) * 100) : 0}%`,
                  bgcolor:
                    index === months.length - 1
                      ? "var(--acid)"
                      : "var(--panel)",
                  borderRadius: "4px 4px 0 0",
                }}
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between" mt={0.75}>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(`${months[0].month}-15T12:00:00`), "MMM yyyy")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          This month
        </Typography>
      </Stack>
    </Box>
  );
}

/** A clean, screenshot-ready card and a ready-to-paste post for X. */
function ShareCard({ data }: { data: Revenue }) {
  const [copied, setCopied] = useState(false);
  const month = format(new Date(data.generatedAt), "MMMM yyyy");
  const rows: Array<[string, string]> = [
    ["MRR", usd(data.mrrCents)],
    ["Paying customers", String(data.payingCustomers)],
    [
      "Users",
      `${data.users.total.toLocaleString()} (+${data.users.last30Days} in 30 days)`,
    ],
    ["Revenue so far", usd(data.cash.allTimeNetCents)],
  ];
  const post = `Building Danto in public, ${month} update 📈

MRR: ${usd(data.mrrCents)}
Paying customers: ${data.payingCustomers}
Users: ${data.users.total} (+${data.users.last30Days} this month)
Revenue so far: ${usd(data.cash.allTimeNetCents)}

What worked:
What didn't:
Next: `;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the text is visible to copy by hand */
    }
  };
  return (
    <Panel
      title="Share your numbers"
      detail="Screenshot the card, or copy a ready post for X"
    >
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: "#181817",
          color: "#f7f6f1",
          border: "1px solid #2d2c29",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Typography
            sx={{ fontWeight: 850, fontSize: 22, letterSpacing: "-.03em" }}
          >
            danto
          </Typography>
          <Typography sx={{ color: "#b5b2a8", fontSize: 14 }}>
            {month}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontWeight: 850,
            fontSize: 56,
            letterSpacing: "-.05em",
            lineHeight: 1.05,
            mt: 2,
            color: "#d8ff63",
          }}
        >
          {usd(data.mrrCents)}
        </Typography>
        <Typography sx={{ color: "#b5b2a8", fontSize: 14, mb: 2 }}>
          monthly recurring revenue
        </Typography>
        {rows.slice(1).map(([label, value]) => (
          <Stack
            key={label}
            direction="row"
            justifyContent="space-between"
            py={0.75}
            sx={{ borderTop: "1px solid #2d2c29" }}
          >
            <Typography sx={{ color: "#b5b2a8", fontSize: 15 }}>
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
              {value}
            </Typography>
          </Stack>
        ))}
        <Typography sx={{ color: "#8d8a82", fontSize: 13, mt: 1.5 }}>
          Client portals for freelancers · danto.app
        </Typography>
      </Box>
      <Button
        startIcon={<ContentCopyRounded />}
        onClick={copy}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        {copied ? "Copied" : "Copy post for X"}
      </Button>
    </Panel>
  );
}
