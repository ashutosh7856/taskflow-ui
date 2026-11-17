import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import VerifiedUserRounded from "@mui/icons-material/VerifiedUserRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, errorMessage } from "../lib/api";
import {
  displayPrice,
  offers,
  type BillingInterval,
} from "../lib/billingPlans";
import { IntervalToggle } from "./IntervalToggle";
import { FeatureMark } from "./FeatureMark";

type PaidPlan = "pro" | "business";

export function BillingDialog({
  open,
  onClose,
  initialPlan,
  initialInterval = "year",
}: {
  open: boolean;
  onClose: () => void;
  initialPlan?: "pro" | "business" | null;
  initialInterval?: BillingInterval;
}) {
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [interval, setBillingInterval] =
    useState<BillingInterval>(initialInterval);
  const [success, setSuccess] = useState(false);
  const client = useQueryClient();
  const billing = useQuery({
    queryKey: ["billing"],
    enabled: open,
    queryFn: async () => (await api.get("/billing")).data,
  });
  const checkout = useMutation({
    mutationFn: async ({ plan, code }: { plan: PaidPlan; code?: string }) =>
      (
        await api.post("/billing/checkout", {
          plan,
          interval,
          ...(code && interval === "month" ? { discountCode: code } : {}),
        })
      ).data as { checkoutUrl?: string; changed?: boolean },
    onSuccess: async (data) => {
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      // Existing subscribers switch plans in place, no new checkout.
      await Promise.all([
        client.invalidateQueries({ queryKey: ["billing"] }),
        client.invalidateQueries({ queryKey: ["workspaces"] }),
      ]);
      setSuccess(true);
    },
  });
  const deferredDays: number =
    (selectedPlan && billing.data?.deferredDays?.[selectedPlan]) || 0;
  const firstCharge = new Date(Date.now() + deferredDays * 86_400_000);
  const hasSubscription =
    Boolean(billing.data?.subscriptionId) &&
    billing.data?.billingStatus === "active";
  const chosenOffer = offers.find((offer) => offer.plan === selectedPlan);
  const close = () => {
    setSelectedPlan(null);
    checkout.reset();
    setDiscountCode("");
    setSuccess(false);
    onClose();
  };

  useEffect(() => {
    if (open && initialPlan) setSelectedPlan(initialPlan);
    if (open) setBillingInterval(initialInterval);
  }, [initialPlan, initialInterval, open]);

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: "#f2f0e9",
          borderRadius: { xs: 0, sm: 3 },
          minHeight: { sm: 680 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
          m: { xs: 0, sm: 4 },
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#181817",
          color: "#fff",
          p: { xs: 3, md: 5 },
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 300,
            height: 300,
            border: "1px solid #ff5c35",
            borderRadius: "50%",
            right: -50,
            top: -190,
          }}
        />
        <Stack
          direction="row"
          alignItems="flex-start"
          sx={{ position: "relative" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
              {selectedPlan ? "Secure checkout" : "Your account plan"}
            </Typography>
            <Typography
              variant="h3"
              sx={{ mt: 1, fontSize: { xs: 36, md: 52 } }}
            >
              {selectedPlan
                ? `Upgrade to ${chosenOffer?.name}.`
                : "Invest in momentum."}
            </Typography>
            <Typography sx={{ color: "#b9b7af", mt: 1 }}>
              {selectedPlan
                ? "Review the plan, then continue to secure checkout."
                : "One plan covers every workspace you own. Cancel anytime."}
            </Typography>
          </Box>
          <IconButton onClick={close} sx={{ color: "#fff" }}>
            <CloseRounded />
          </IconButton>
        </Stack>
      </Box>
      <DialogContent
        sx={{
          p: { xs: 2, md: 4 },
          pb: { xs: "max(24px, env(safe-area-inset-bottom))", md: 4 },
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {(billing.error || checkout.error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage(billing.error || checkout.error)}
          </Alert>
        )}
        {billing.isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : success ? (
          <SuccessState close={close} />
        ) : selectedPlan ? (
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={3}
            alignItems="flex-start"
          >
            <Box
              sx={{
                width: { xs: "100%", md: 330 },
                bgcolor: "#181817",
                color: "#fff",
                borderRadius: 3,
                p: 3,
                boxShadow: "5px 5px 0 #ff5c35",
              }}
            >
              <Button
                startIcon={<ArrowBackRounded />}
                onClick={() => {
                  setSelectedPlan(null);
                  checkout.reset();
                }}
                sx={{ color: "#d8ff63", px: 0, mb: 2 }}
              >
                Change plan
              </Button>
              <Typography className="mono-label" sx={{ color: "#9d9b94" }}>
                Order summary
              </Typography>
              <Typography variant="h4" mt={1}>
                {chosenOffer?.name}
              </Typography>
              <Stack direction="row" alignItems="flex-end" my={2}>
                <Typography
                  className="display-type"
                  sx={{ fontSize: 50, lineHeight: 1 }}
                >
                  $
                  {chosenOffer
                    ? displayPrice(chosenOffer, interval).amount
                    : ""}
                </Typography>
                <Typography sx={{ color: "#aaa8a1", ml: 0.75 }}>
                  / month
                </Typography>
              </Stack>
              <Box sx={{ mb: 2 }}>
                <IntervalToggle
                  dark
                  value={interval}
                  onChange={(value) => {
                    setBillingInterval(value);
                    checkout.reset();
                  }}
                />
                {chosenOffer && (
                  <Typography
                    fontSize={13}
                    sx={{ color: "#d8ff63", mt: 1, fontWeight: 700 }}
                  >
                    {displayPrice(chosenOffer, interval).note}
                  </Typography>
                )}
              </Box>
              <Stack spacing={1.2} sx={{ display: { xs: "none", sm: "flex" } }}>
                {chosenOffer?.features.map((feature) => (
                  <Stack key={feature} direction="row" gap={1}>
                    <FeatureMark inverse />
                    <Typography fontSize={14}>{feature}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Typography fontSize={12} sx={{ color: "#8f8d86", mt: 3 }}>
                {interval === "year"
                  ? "Billed once a year. Cancel renewal anytime from Billing."
                  : "Billed monthly. Cancel anytime from Billing."}{" "}
                Taxes may apply.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, width: "100%" }}>
              <Typography className="mono-label" color="text.secondary">
                Payment method
              </Typography>
              <PaymentMethod />
              {deferredDays > 0 && !hasSubscription && (
                <Alert
                  severity="success"
                  icon={<VerifiedUserRounded />}
                  sx={{ mt: 2 }}
                >
                  <strong>Nothing charged today.</strong> Your first payment is
                  on{" "}
                  {firstCharge.toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  , when your trial ends. Cancel before then and you won’t be
                  charged.
                </Alert>
              )}
              {interval === "month" && !hasSubscription && (
                <TextField
                  fullWidth
                  label="Discount code (optional)"
                  value={discountCode}
                  onChange={(event) =>
                    setDiscountCode(event.target.value.toUpperCase())
                  }
                  inputProps={{ maxLength: 30 }}
                  sx={{ mt: 2, bgcolor: "#fffef9" }}
                  helperText="Valid codes discount the first payment; renewals return to the regular monthly price."
                />
              )}
              <Button
                variant="contained"
                fullWidth
                disabled={checkout.isPending || checkout.isSuccess}
                onClick={() =>
                  checkout.mutate({
                    plan: selectedPlan,
                    code: discountCode.trim() || undefined,
                  })
                }
                sx={{ mt: 2, minHeight: 48 }}
              >
                {checkout.isPending || checkout.isSuccess
                  ? hasSubscription
                    ? "Switching plan…"
                    : "Opening secure checkout…"
                  : hasSubscription
                    ? `Switch to ${chosenOffer?.name}`
                    : deferredDays > 0
                      ? "Add payment method · $0 today"
                      : "Continue to secure checkout"}
              </Button>
              {hasSubscription && (
                <Typography fontSize={12} color="text.secondary" mt={1}>
                  Your saved payment method is used. The price difference for
                  the rest of this period is charged or credited now.
                </Typography>
              )}
              <Stack
                direction="row"
                justifyContent="center"
                gap={1}
                mt={2}
                color="text.secondary"
              >
                <VerifiedUserRounded fontSize="small" />
                <Typography fontSize={12}>
                  Encrypted checkout · No payment details stored by Danto
                </Typography>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <IntervalToggle value={interval} onChange={setBillingInterval} />
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
                gap: 2,
              }}
            >
              {offers.map((offer) => {
                // A trial (no subscription yet) isn't "active": keep it buyable.
                const current =
                  billing.data?.plan === offer.plan &&
                  (offer.plan === "free" ||
                    (Boolean(billing.data?.subscriptionId) &&
                      billing.data?.billingStatus === "active"));
                const onTrial = billing.data?.plan === offer.plan && !current;
                return (
                  <Box
                    key={offer.plan}
                    className={`pricing-card ${offer.plan === "pro" ? "is-featured" : ""}`}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Typography className="mono-label">
                        {offer.name}
                      </Typography>
                      {(current || onTrial) && (
                        <Typography
                          className="mono-label"
                          sx={{ color: "#ff5c35" }}
                        >
                          {onTrial ? "Trial" : "Current plan"}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" alignItems="flex-end" mt={2}>
                      <Typography
                        className="display-type"
                        sx={{ fontSize: 52, lineHeight: 1 }}
                      >
                        ${displayPrice(offer, interval).amount}
                      </Typography>
                      {offer.price > 0 && (
                        <Typography color="text.secondary" ml={0.75}>
                          / month
                        </Typography>
                      )}
                    </Stack>
                    {offer.price > 0 && (
                      <Typography
                        fontSize={13}
                        fontWeight={800}
                        sx={{ color: "#4f6c00", mt: 0.5 }}
                      >
                        {displayPrice(offer, interval).note}
                      </Typography>
                    )}
                    <Typography color="text.secondary" mt={1}>
                      {offer.line}
                    </Typography>
                    <Stack spacing={1.25} my={3}>
                      {offer.features.map((feature) => (
                        <Stack key={feature} direction="row" gap={1}>
                          <FeatureMark />
                          <Typography fontSize={14}>{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    {offer.plan === "free" ? (
                      <Button disabled fullWidth>
                        {current ? "Your current plan" : "Included"}
                      </Button>
                    ) : (
                      <Button
                        variant={
                          offer.plan === "pro" ? "contained" : "outlined"
                        }
                        startIcon={<RocketLaunchRounded />}
                        disabled={current || !billing.data?.checkout?.configured}
                        fullWidth
                        onClick={() => setSelectedPlan(offer.plan)}
                      >
                        {current
                          ? "Active"
                          : onTrial
                            ? `Keep ${offer.name}`
                            : `Choose ${offer.name}`}
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
        {!billing.isLoading && !billing.data?.checkout?.configured && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Checkout is temporarily unavailable. Please try again shortly or
            email support@danto.app.
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentMethod() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        p: { xs: 1.25, sm: 1.5 },
        mt: 1.5,
        border: "1px solid #b9b5aa",
        borderRadius: 2,
        bgcolor: "#fffef9",
        color: "#181817",
      }}
    >
      <VerifiedUserRounded sx={{ color: "#4f6c00" }} />
      <Box>
        <Typography fontWeight={800} fontSize={14}>
          Card, UPI, wallets & local methods
        </Typography>
        <Typography fontSize={12} color="text.secondary">
          Processed by Dodo Payments, our merchant of record
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography fontSize={13} color="text.secondary" textAlign="right">
          Secure checkout
        </Typography>
      </Box>
    </Box>
  );
}

function SuccessState({ close }: { close: () => void }) {
  return (
    <Stack alignItems="center" textAlign="center" sx={{ py: 7 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          bgcolor: "#181817",
          color: "#fff",
          boxShadow: "5px 5px 0 #ff5c35",
          mb: 3,
        }}
      >
        <CheckRounded sx={{ fontSize: 38 }} />
      </Box>
      <Typography className="mono-label" color="text.secondary">
        Payment approved
      </Typography>
      <Typography variant="h3" sx={{ fontSize: { xs: 36, sm: 48 }, mt: 1 }}>
        You’re ready to move.
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 440, my: 2 }}>
        Your account plan is active across every workspace you own. The new AI
        allowance and seat limit are available immediately.
      </Typography>
      <Button variant="contained" onClick={close}>
        Return to Danto
      </Button>
    </Stack>
  );
}
