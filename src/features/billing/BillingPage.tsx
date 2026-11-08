import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
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
import { useState } from "react";
import { Link } from "react-router-dom";
import { BillingDialog } from "../../components/BillingDialog";
import { api, errorMessage } from "../../lib/api";
import { offers } from "../../lib/billingPlans";

interface BillingDetails {
  plan: "free" | "pro" | "business";
  billingStatus: "inactive" | "active" | "past_due" | "cancelled";
  currentPeriodEnd?: string | null;
  paypalSubscriptionId?: string | null;
  aiRequestsThisMonth: number;
  aiPeriodStart: string;
  entitlements: {
    priceUsd: number;
    seats: number;
    aiRequests: number | null;
    workspaces: number | null;
    boards: number | null;
    collaboration: boolean;
  };
  paypal: { configured: boolean; environment: "live" | "sandbox" };
}

export function BillingPage() {
  const supportEmail =
    import.meta.env.VITE_SUPPORT_EMAIL || "support@danto.app";
  const [plansOpen, setPlansOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<"pro" | "business" | null>(
    null,
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
      {(billing.error || cancel.error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage(billing.error || cancel.error)}
        </Alert>
      )}
      {data && (
        <Stack spacing={3}>
          {data.paypal.environment !== "live" && (
            <Alert severity="warning">
              Payments are currently in PayPal sandbox mode. Switch the backend
              to live credentials before accepting real customer payments.
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
                    {data.entitlements.collaboration
                      ? data.entitlements.seats
                      : "Solo"}
                  </Typography>
                  <Typography color="#aaa8a1">
                    {data.entitlements.collaboration
                      ? "people account-wide"
                      : "private workspaces"}
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
                rolling 30-day billing period. Team has no monthly cap, with
                fair-use rate limits that prevent automated abuse.
              </Typography>
            </Box>
          </Box>

          <Box id="plans" sx={{ scrollMarginTop: 100 }}>
            <Typography className="mono-label" color="text.secondary">
              Available plans
            </Typography>
            <Typography variant="h4" mt={1} mb={1}>
              Pick the capacity that fits your team.
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Free includes three active boards. Pro unlocks unlimited private
              boards. Team adds collaboration across every owned workspace.
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {offers.map((offer) => {
                const current = data.plan === offer.plan;
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
                        ${offer.price}
                      </Typography>
                      <Typography
                        color={current ? "#b9b7af" : "text.secondary"}
                        mb={0.75}
                      >
                        / month
                      </Typography>
                    </Stack>
                    <Stack spacing={1.25} mb={3}>
                      {offer.features.map((feature) => (
                        <Stack key={feature} direction="row" gap={1}>
                          <CheckCircleRounded
                            sx={{ color: "#86a82c", fontSize: 19 }}
                          />
                          <Typography fontSize={14}>{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      fullWidth
                      variant={current ? "outlined" : "contained"}
                      disabled={current || offer.plan === "free"}
                      onClick={() => {
                        if (offer.plan === "pro" || offer.plan === "business") {
                          setCheckoutPlan(offer.plan);
                          setPlansOpen(true);
                        }
                      }}
                      sx={
                        current
                          ? { color: "#fff", borderColor: "#77736b" }
                          : undefined
                      }
                    >
                      {current
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
                title="PayPal checkout"
                body="Pay securely with PayPal. Available payment methods are shown by PayPal for your country and account."
              />
              <TrustItem
                icon={<LockRounded />}
                title="No card storage"
                body="Danto never receives or stores your card number, bank credentials, or PayPal password."
              />
              <TrustItem
                icon={<ShieldRounded />}
                title="Recurring and cancellable"
                body="Paid plans renew monthly in USD. Cancel here before renewal to stop future charges."
              />
            </Box>
            {data.paypalSubscriptionId && (
              <Typography variant="body2" color="text.secondary" mt={3}>
                PayPal subscription reference: ••••
                {data.paypalSubscriptionId.slice(-8)}
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
              {data.paypalSubscriptionId
                ? "Manage your PayPal renewal"
                : "No recurring payment"}
            </Typography>
            {cancelledNotice && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Your PayPal subscription was cancelled. No future renewal will
                be charged.
              </Alert>
            )}
            {data.paypalSubscriptionId ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={2}
                alignItems={{ sm: "center" }}
                mt={2}
              >
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  {data.billingStatus === "cancelled"
                    ? "This subscription is cancelled and will not renew."
                    : data.currentPeriodEnd
                      ? `Your next renewal is ${new Date(data.currentPeriodEnd).toLocaleDateString()}. Cancel before then to prevent the next charge.`
                      : "Cancel to stop future PayPal subscription charges."}
                </Typography>
                {data.billingStatus === "active" && (
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={cancel.isPending}
                    onClick={() => {
                      if (
                        confirm(
                          "Cancel PayPal renewal? Your subscription will not be charged again.",
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
                  : "This plan was assigned without a PayPal subscription. You are not being charged automatically, so no cancellation is required."}
              </Typography>
            )}
          </Box>

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
            <CheckCircleRounded color="success" />
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
  if (data.billingStatus === "cancelled") return "Cancelled";
  if (data.billingStatus === "active") return "Active";
  return "No paid subscription";
}

function planBillingLine(data: BillingDetails) {
  if (data.plan === "free") {
    return "$0 USD · No recurring payment";
  }
  if (!data.paypalSubscriptionId) {
    return `Manual ${data.plan === "business" ? "Team" : data.plan} access · No recurring charge`;
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
