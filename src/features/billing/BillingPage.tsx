import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CreditCardRounded from "@mui/icons-material/CreditCardRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BillingDialog } from "../../components/BillingDialog";
import { FeatureMark } from "../../components/FeatureMark";
import { api, errorMessage } from "../../lib/api";
import { formatBytes } from "../cards/CardFiles";
import {
  displayPrice,
  offers,
  type BillingInterval,
} from "../../lib/billingPlans";
import { IntervalToggle } from "../../components/IntervalToggle";
import { formatMoney } from "../../lib/money";
import { useAuthStore } from "../../store/auth";

interface BillingDetails {
  plan: "free" | "pro" | "business";
  billingStatus: "inactive" | "active" | "past_due" | "cancelled";
  currentPeriodEnd?: string | null;
  subscriptionId?: string | null;
  canManagePayment?: boolean;
  aiRequestsThisMonth: number;
  aiPeriodStart: string;
  storage?: { enabled?: boolean; usedBytes: number; limitBytes: number };
  entitlements: {
    priceUsd: number;
    seats: number;
    aiRequests: number | null;
    workspaces: number | null;
    boards: number | null;
    collaboration: boolean;
    workspacePulse: boolean;
    clientPortals?: number | null;
  };
  billingInterval?: "month" | "year";
  checkout: { configured: boolean; environment: "live" | "test" };
}

export function BillingPage() {
  const supportEmail =
    import.meta.env.VITE_SUPPORT_EMAIL || "support@danto.app";
  const [searchParams] = useSearchParams();
  const isAdmin = useAuthStore((state) => Boolean(state.user?.isAdmin));
  const [interval, setBillingInterval] = useState<BillingInterval>(
    searchParams.get("interval") === "month" ? "month" : "year",
  );
  const requestedPlan = searchParams.get("plan");
  const initialPlan =
    requestedPlan === "pro" || requestedPlan === "business"
      ? requestedPlan
      : null;
  const [plansOpen, setPlansOpen] = useState(Boolean(initialPlan));
  const [checkoutPlan, setCheckoutPlan] = useState<"pro" | "business" | null>(
    initialPlan,
  );
  const [cancelledNotice, setCancelledNotice] = useState(false);
  const client = useQueryClient();
  const billing = useQuery({
    queryKey: ["billing"],
    queryFn: async () => (await api.get<BillingDetails>("/billing")).data,
  });
  const cancel = useMutation({
    mutationFn: () => api.post("/billing/cancel"),
    onSuccess: () => {
      setCancelledNotice(true);
      client.invalidateQueries({ queryKey: ["billing"] });
    },
  });
  const portal = useMutation({
    mutationFn: async () =>
      (await api.post<{ url: string }>("/billing/portal")).data,
    onSuccess: ({ url }) => window.location.assign(url),
  });

  // Back from Dodo checkout: /billing?checkout=done&subscription_id=…&status=…
  const navigate = useNavigate();
  const returnedId = searchParams.get("subscription_id");
  const returnedStatus = searchParams.get("status");
  const [checkoutResult, setCheckoutResult] = useState<
    "confirming" | "done" | "failed" | null
  >(returnedId ? "confirming" : null);
  const confirmedOnce = useRef(false);
  useEffect(() => {
    if (!returnedId || confirmedOnce.current) return;
    confirmedOnce.current = true;
    if (returnedStatus && !["active", "succeeded"].includes(returnedStatus)) {
      setCheckoutResult("failed");
      navigate("/billing", { replace: true });
      return;
    }
    (async () => {
      // The subscription can take a few seconds to turn active after payment.
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          const response = await api.post("/billing/checkout/confirm", {
            subscriptionId: returnedId,
          });
          if (response.status !== 202) {
            setCheckoutResult("done");
            break;
          }
        } catch {
          setCheckoutResult("failed");
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      setCheckoutResult((value) => (value === "confirming" ? "done" : value));
      await Promise.all([
        client.invalidateQueries({ queryKey: ["billing"] }),
        client.invalidateQueries({ queryKey: ["workspaces"] }),
      ]);
      navigate("/billing", { replace: true });
    })();
  }, [returnedId, returnedStatus, client, navigate]);
  const data = billing.data;
  const aiPercent = data
    ? data.entitlements.aiRequests === null
      ? 100
      : Math.min(
          100,
          (data.aiRequestsThisMonth / data.entitlements.aiRequests) * 100,
        )
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap={2}
        mb={4}
      >
        <Box>
          <Typography className="mono-label" color="text.secondary">
            Account / Billing
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: 38, md: 58 }, mt: 1 }}>
            Simple, transparent billing.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 650, mt: 1 }}>
            See exactly what you have, what renews, and how payments are
            handled.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() =>
            document
              .getElementById("plans")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          sx={{ alignSelf: { md: "flex-end" } }}
        >
          Compare plans
        </Button>
      </Stack>

      {billing.isLoading && (
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      )}
      {(billing.error || cancel.error || portal.error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage(billing.error || cancel.error || portal.error)}
        </Alert>
      )}
      {checkoutResult === "confirming" && (
        <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ mb: 3 }}>
          Confirming your subscription…
        </Alert>
      )}
      {checkoutResult === "done" && (
        <Alert severity="success" sx={{ mb: 3 }}>
          You’re all set. Your plan is active across every workspace you own.
          {data?.currentPeriodEnd && data.billingStatus === "active"
            ? ` Next payment: ${new Date(data.currentPeriodEnd).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}.`
            : ""}
        </Alert>
      )}
      {checkoutResult === "failed" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Checkout wasn’t completed, so nothing was charged. You can try again
          anytime.
        </Alert>
      )}
      {data && (
        <Stack spacing={3}>
          {isAdmin && data.checkout.environment !== "live" && (
            <Alert severity="warning">
              Admin note: Dodo Payments is in test mode. Use test cards only;
              switch DODO_ENV to live after approval. Only admins see this.
            </Alert>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr .8fr" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "#181817",
                color: "#fff",
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                boxShadow: "6px 6px 0 #ff5c35",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
                  Current plan
                </Typography>
                <Chip
                  label={billingStatusLabel(data)}
                  sx={{
                    bgcolor:
                      data.billingStatus === "active" ? "#d8ff63" : "#343430",
                    color: data.billingStatus === "active" ? "#181817" : "#fff",
                    textTransform: "capitalize",
                  }}
                />
              </Stack>
              <Typography
                variant="h3"
                sx={{ mt: 2, textTransform: "capitalize" }}
              >
                {data.plan === "business" ? "Team" : data.plan}
              </Typography>
              <Typography sx={{ color: "#b9b7af", mt: 1 }}>
                {planBillingLine(data)}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} gap={3} mt={4}>
                <Box>
                  <Typography variant="h5">
                    {data.entitlements.clientPortals == null
                      ? "Unlimited"
                      : data.entitlements.clientPortals}
                  </Typography>
                  <Typography color="#aaa8a1">
                    {data.entitlements.clientPortals === 1
                      ? "client portal"
                      : "client portals"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5">
                    {data.entitlements.aiRequests ?? "Unlimited"}
                  </Typography>
                  <Typography color="#aaa8a1">AI actions / month</Typography>
                </Box>
                <Box>
                  <Typography variant="h5">
                    {data.entitlements.boards ?? "Unlimited"}
                  </Typography>
                  <Typography color="#aaa8a1">boards</Typography>
                </Box>
              </Stack>
              {data.currentPeriodEnd && (
                <Typography sx={{ mt: 3, color: "#d8ff63" }}>
                  Next renewal:{" "}
                  {new Date(data.currentPeriodEnd).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                bgcolor: "#fffef9",
                border: "1px solid #d4d0c5",
                borderRadius: 3,
                p: 3,
              }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <AutoAwesomeRounded />
                <Typography fontWeight={850}>AI usage</Typography>
              </Stack>
              <Typography variant="h4" mt={3}>
                {data.aiRequestsThisMonth}{" "}
                <Typography
                  component="span"
                  color="text.secondary"
                  fontSize={16}
                >
                  {data.entitlements.aiRequests === null
                    ? "used · unlimited"
                    : `of ${data.entitlements.aiRequests}`}
                </Typography>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={aiPercent}
                sx={{ height: 10, borderRadius: 5, my: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Shared across workspaces you own. The allowance resets on a
                rolling 30-day billing period. Team usage is shared across the
                owner account, with monthly, daily, and hourly abuse controls.
              </Typography>
              {data.storage?.enabled && (
                <Box mt={3}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={800}>File storage</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatBytes(data.storage.usedBytes)} of{" "}
                      {formatBytes(data.storage.limitBytes)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(
                      100,
                      (data.storage.usedBytes / data.storage.limitBytes) * 100,
                    )}
                    sx={{ height: 10, borderRadius: 5, mt: 1 }}
                    aria-label="File storage used"
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box id="plans" sx={{ scrollMarginTop: 100 }}>
            <Typography className="mono-label" color="text.secondary">
              Available plans
            </Typography>
            <Typography variant="h4" mt={1} mb={1}>
              Choose the plan that fits your client list.
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Free covers one client. Pro gives every client a branded portal
              and AI updates. Team adds white-label portals and room for ten
              teammates. Pay yearly and get two months free.
            </Typography>
            <Box sx={{ mb: 2.5 }}>
              <IntervalToggle value={interval} onChange={setBillingInterval} />
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {offers.map((offer) => {
                const current = data.plan === offer.plan;
                // Trial / comped access: the plan is active but nothing is
                // paying for it yet, so let the user add payment to keep it.
                const keepable =
                  current &&
                  offer.plan !== "free" &&
                  !(data.subscriptionId && data.billingStatus === "active");
                return (
                  <Box
                    key={offer.plan}
                    sx={{
                      bgcolor: current ? "#181817" : "#fffef9",
                      color: current ? "#fff" : "#181817",
                      border: current
                        ? "2px solid #181817"
                        : "1px solid #d4d0c5",
                      borderRadius: 3,
                      p: 3,
                      boxShadow: current ? "5px 5px 0 #d8ff63" : "none",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h5">{offer.name}</Typography>
                      {current && (
                        <Chip
                          size="small"
                          label="Current plan"
                          sx={{ bgcolor: "#d8ff63", fontWeight: 800 }}
                        />
                      )}
                    </Stack>
                    <Typography
                      color={current ? "#b9b7af" : "text.secondary"}
                      mt={0.5}
                    >
                      {offer.line}
                    </Typography>
                    <Stack direction="row" alignItems="flex-end" my={2.5}>
                      <Typography className="display-type" fontSize={46}>
                        ${displayPrice(offer, interval).amount}
                      </Typography>
                      <Typography
                        color={current ? "#b9b7af" : "text.secondary"}
                        mb={0.75}
                        ml={0.75}
                      >
                        {displayPrice(offer, interval).suffix}
                      </Typography>
                    </Stack>
                    {offer.price > 0 && (
                      <Typography
                        fontSize={13}
                        fontWeight={800}
                        sx={{
                          mt: -1.5,
                          mb: 2,
                          color: current ? "#d8ff63" : "#4f6c00",
                        }}
                      >
                        {displayPrice(offer, interval).note}
                      </Typography>
                    )}
                    <Stack spacing={1.25} mb={3}>
                      {offer.features.map((feature) => (
                        <Stack key={feature} direction="row" gap={1}>
                          <FeatureMark inverse={current} />
                          <Typography fontSize={14}>{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      fullWidth
                      variant={current && !keepable ? "outlined" : "contained"}
                      disabled={(current && !keepable) || offer.plan === "free"}
                      onClick={() => {
                        if (offer.plan === "pro" || offer.plan === "business") {
                          setCheckoutPlan(offer.plan);
                          setPlansOpen(true);
                        }
                      }}
                      sx={
                        keepable
                          ? {
                              bgcolor: "#d8ff63",
                              color: "#181817",
                              "&:hover": { bgcolor: "#e5ff94" },
                            }
                          : current
                            ? { color: "#fff", borderColor: "#77736b" }
                            : undefined
                      }
                    >
                      {keepable
                        ? `Keep ${offer.name} · add payment`
                        : current
                          ? "Your current plan"
                          : offer.plan === "free"
                            ? "Included"
                            : `Choose ${offer.name}`}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: "#fffef9",
              border: "1px solid #d4d0c5",
              borderRadius: 3,
              p: { xs: 3, md: 4 },
            }}
          >
            <Stack direction="row" gap={1} alignItems="center" mb={3}>
              <ReceiptLongRounded />
              <Typography variant="h5">Payment details</Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              <TrustItem
                icon={<CreditCardRounded />}
                title="Secure checkout"
                body="Pay by card, UPI, wallets or local methods. Dodo Payments processes payments as our merchant of record and handles sales tax and invoices."
              />
              <TrustItem
                icon={<LockRounded />}
                title="No card storage"
                body="Danto never receives or stores your card number or bank credentials."
              />
              <TrustItem
                icon={<ShieldRounded />}
                title="Recurring and cancellable"
                body="Paid plans renew monthly or yearly in USD. Cancel here before renewal to stop future charges."
              />
            </Box>
            {data.subscriptionId && (
              <Typography variant="body2" color="text.secondary" mt={3}>
                Subscription reference: ••••{data.subscriptionId.slice(-8)}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              bgcolor: "#fffef9",
              border: "1px solid #d4d0c5",
              borderRadius: 3,
              p: { xs: 3, md: 4 },
            }}
          >
            <Typography className="mono-label" color="text.secondary">
              Subscription management
            </Typography>
            <Typography variant="h5" mt={1}>
              {data.subscriptionId
                ? "Manage your subscription"
                : "No recurring payment"}
            </Typography>
            {cancelledNotice && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Renewal cancelled. You won’t be charged again, and your plan
                stays active until the end of the current period.
              </Alert>
            )}
            {data.subscriptionId ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={2}
                alignItems={{ sm: "center" }}
                mt={2}
              >
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  {data.billingStatus === "cancelled"
                    ? data.currentPeriodEnd &&
                      new Date(data.currentPeriodEnd) > new Date()
                      ? `Cancelled. Your plan stays active until ${new Date(data.currentPeriodEnd).toLocaleDateString()} and won’t renew.`
                      : "This subscription is cancelled and will not renew."
                    : data.currentPeriodEnd
                      ? `Your next renewal is ${new Date(data.currentPeriodEnd).toLocaleDateString()}. Cancel before then to prevent the next charge.`
                      : "Cancel to stop future subscription charges."}
                </Typography>
                {data.canManagePayment && (
                  <Button
                    variant="outlined"
                    disabled={portal.isPending}
                    onClick={() => portal.mutate()}
                  >
                    {portal.isPending ? "Opening…" : "Payment method & invoices"}
                  </Button>
                )}
                {data.billingStatus === "active" && (
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={cancel.isPending}
                    onClick={() => {
                      if (
                        confirm(
                          "Cancel renewal? You keep your plan until the end of the current period and won't be charged again.",
                        )
                      ) {
                        cancel.mutate();
                      }
                    }}
                  >
                    {cancel.isPending ? "Cancelling…" : "Cancel renewal"}
                  </Button>
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary" mt={1.5}>
                {data.plan === "free"
                  ? "The Free plan has no subscription and nothing to cancel."
                  : "This plan has no subscription attached. You are not being charged automatically, so no cancellation is required."}
              </Typography>
            )}
          </Box>

          <ReceiptsCard />

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              p: 2.5,
              border: "1px solid #aaa59a",
              borderRadius: 2,
            }}
          >
            <FeatureMark />
            <Typography sx={{ flex: 1 }}>
              Review how data and subscriptions are handled in our{" "}
              <Link to="/privacy">Privacy Policy</Link> and{" "}
              <Link to="/terms">Terms of Service</Link>.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Billing question or an incorrect charge? Email{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </Typography>
        </Stack>
      )}
      <BillingDialog
        open={plansOpen}
        initialPlan={checkoutPlan}
        initialInterval={interval}
        onClose={() => {
          setPlansOpen(false);
          setCheckoutPlan(null);
        }}
      />
    </Container>
  );
}

function billingStatusLabel(data: BillingDetails) {
  if (data.plan === "free" && data.billingStatus === "inactive") {
    return "Free plan";
  }
  if (data.billingStatus === "past_due") return "Payment issue";
  if (data.billingStatus === "cancelled" && !data.subscriptionId)
    return "Trial";
  if (data.billingStatus === "cancelled") return "Cancelled";
  if (data.billingStatus === "active") return "Active";
  return "No paid subscription";
}

function planBillingLine(data: BillingDetails) {
  if (data.plan === "free") {
    return "$0 USD · No recurring payment";
  }
  if (!data.subscriptionId) {
    const ends = data.currentPeriodEnd
      ? ` · ends ${new Date(data.currentPeriodEnd).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : "";
    return `Free ${data.plan === "business" ? "Team" : "Pro"} access${ends} · No card on file`;
  }
  if (data.billingInterval === "year") {
    const yearly = offers.find(
      (offer) => offer.plan === data.plan,
    )?.yearlyPrice;
    return `$${yearly} USD / year · Covers every workspace you own`;
  }
  return `$${data.entitlements.priceUsd} USD / month · Covers every workspace you own`;
}

function TrustItem({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Box>
      {icon}
      <Typography fontWeight={850} mt={1}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {body}
      </Typography>
    </Box>
  );
}

interface ReceiptRow {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  plan: string | null;
  issuedAt: string;
}

/** Every payment with a printable receipt. Also emailed after each charge. */
function ReceiptsCard() {
  const receipts = useQuery({
    queryKey: ["receipts"],
    queryFn: async () =>
      (await api.get<ReceiptRow[]>("/billing/receipts")).data,
  });
  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3 },
        border: "1px solid #aaa59a",
        borderRadius: 2,
        bgcolor: "#fffef9",
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.25} mb={1.5}>
        <ReceiptLongRounded />
        <Typography variant="h6" sx={{ flex: 1 }}>
          Receipts
        </Typography>
      </Stack>
      {receipts.isLoading && (
        <Typography color="text.secondary">Loading receipts…</Typography>
      )}
      {receipts.error && (
        <Alert severity="error">{errorMessage(receipts.error)}</Alert>
      )}
      {receipts.data && !receipts.data.length && (
        <Typography color="text.secondary">
          No payments yet. After each payment we email you a receipt, and it
          also appears here.
        </Typography>
      )}
      <Stack divider={<Box sx={{ borderTop: "1px solid #e3e0d7" }} />}>
        {receipts.data?.map((row) => (
          <Stack
            key={row.id}
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={{ xs: 1, sm: 2 }}
            py={1.5}
          >
            <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
              <Typography fontWeight={800} fontSize={15}>
                {new Date(row.issuedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                {row.number}
                {row.plan
                  ? ` · ${row.plan === "business" ? "Team" : "Pro"}`
                  : ""}
              </Typography>
            </Box>
            <Typography
              fontWeight={800}
              sx={{ fontVariantNumeric: "tabular-nums" }}
            >
              {row.status === "refunded" ? "−" : ""}
              {formatMoney(row.amount, row.currency)}
            </Typography>
            {row.status === "refunded" && (
              <Chip size="small" label="Refunded" variant="outlined" />
            )}
            <Button
              component={Link}
              to={`/billing/receipts/${row.id}`}
              size="small"
            >
              View receipt
            </Button>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
