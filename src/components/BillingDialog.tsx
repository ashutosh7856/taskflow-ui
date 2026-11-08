import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import CreditCardRounded from "@mui/icons-material/CreditCardRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
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
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { api, errorMessage } from "../lib/api";
import { offers } from "../lib/billingPlans";
import { useAuthStore } from "../store/auth";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: Record<string, unknown>) => {
        render: (node: HTMLElement) => Promise<void>;
      };
    };
  }
}

type PaidPlan = "pro" | "business";

export function BillingDialog({
  open,
  onClose,
  initialPlan,
}: {
  open: boolean;
  onClose: () => void;
  initialPlan?: "pro" | "business" | null;
}) {
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan | null>(null);
  const [checkout, setCheckout] = useState<{
    plan: PaidPlan;
    paypalPlanId: string;
  } | null>(null);
  const [providerError, setProviderError] = useState("");
  const [success, setSuccess] = useState(false);
  const user = useAuthStore((state) => state.user);
  const paypalNode = useRef<HTMLDivElement>(null);
  const client = useQueryClient();
  const billing = useQuery({
    queryKey: ["billing"],
    enabled: open,
    queryFn: async () => (await api.get("/billing")).data,
  });
  const setup = useMutation({
    mutationFn: async (plan: PaidPlan) =>
      (await api.post("/billing/paypal/setup", { plan })).data,
    onSuccess: (data) => setCheckout(data),
  });
  const chosenOffer = offers.find((offer) => offer.plan === selectedPlan);
  const close = () => {
    setSelectedPlan(null);
    setCheckout(null);
    setProviderError("");
    setSuccess(false);
    onClose();
  };

  useEffect(() => {
    if (open && initialPlan) setSelectedPlan(initialPlan);
  }, [initialPlan, open]);

  useEffect(() => {
    if (!checkout || !billing.data?.paypal?.clientId || !paypalNode.current)
      return;
    let cancelled = false;
    const mount = async () => {
      if (!window.paypal) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>(
            "script[data-taskflow-paypal]",
          );
          if (existing) {
            if (window.paypal) resolve();
            else {
              existing.addEventListener("load", () => resolve(), {
                once: true,
              });
              existing.addEventListener(
                "error",
                () => reject(new Error("PayPal checkout could not load")),
                { once: true },
              );
            }
            return;
          }
          const script = document.createElement("script");
          script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(billing.data.paypal.clientId)}&components=buttons&vault=true&intent=subscription`;
          script.dataset.taskflowPaypal = "true";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("PayPal checkout could not load"));
          document.head.appendChild(script);
        });
      }
      if (cancelled || !window.paypal || !paypalNode.current) return;
      paypalNode.current.innerHTML = "";
      await window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            shape: "pill",
            label: "subscribe",
            height: 48,
          },
          createSubscription: (_data: unknown, actions: any) =>
            actions.subscription.create({
              plan_id: checkout.paypalPlanId,
              custom_id: user?.id,
            }),
          onApprove: async (data: any) => {
            await api.post("/billing/paypal/activate", {
              subscriptionId: data.subscriptionID,
            });
            await Promise.all([
              client.invalidateQueries({ queryKey: ["billing"] }),
              client.invalidateQueries({ queryKey: ["workspaces"] }),
            ]);
            setCheckout(null);
            setSuccess(true);
          },
          onCancel: () => setCheckout(null),
          onError: () => {
            setProviderError(
              "PayPal could not complete checkout. No charge was made.",
            );
            setCheckout(null);
          },
        })
        .render(paypalNode.current);
    };
    mount().catch(() => {
      setProviderError(
        "PayPal checkout could not load. Check your connection and try again.",
      );
      setCheckout(null);
    });
    return () => {
      cancelled = true;
    };
  }, [checkout, billing.data, client, user?.id]);

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          bgcolor: "#f2f0e9",
          borderRadius: { xs: 0, sm: 3 },
          minHeight: { sm: 680 },
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
                ? "Review the plan, then choose how you want to pay."
                : "One plan covers every workspace you own. Cancel anytime."}
            </Typography>
          </Box>
          <IconButton onClick={close} sx={{ color: "#fff" }}>
            <CloseRounded />
          </IconButton>
        </Stack>
      </Box>
      <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
        {(billing.error || setup.error || providerError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {providerError || errorMessage(billing.error || setup.error)}
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
                  setCheckout(null);
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
                  ${chosenOffer?.price}
                </Typography>
                <Typography sx={{ color: "#aaa8a1" }}>
                  {" "}
                  / account / month
                </Typography>
              </Stack>
              <Stack spacing={1.2}>
                {chosenOffer?.features.map((feature) => (
                  <Stack key={feature} direction="row" gap={1}>
                    <CheckRounded sx={{ color: "#d8ff63", fontSize: 18 }} />
                    <Typography fontSize={14}>{feature}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Typography fontSize={12} sx={{ color: "#8f8d86", mt: 3 }}>
                Recurring monthly subscription. Cancel from account billing.
                Taxes may apply.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, width: "100%" }}>
              <Typography className="mono-label" color="text.secondary">
                Choose payment method
              </Typography>
              <Stack spacing={1.5} mt={1.5}>
                <PaymentMethod
                  icon={<LanguageRounded />}
                  title="PayPal"
                  detail="International cards, PayPal balance and supported local methods"
                  badge="Available"
                  active
                  onClick={() => {
                    setProviderError("");
                    setup.mutate(selectedPlan);
                  }}
                  disabled={setup.isPending || !!checkout}
                />
                <PaymentMethod
                  icon={<CreditCardRounded />}
                  title="UPI AutoPay & cards"
                  detail="Fast recurring mandate for Indian customers through Razorpay"
                  badge="Recommended for India"
                />
                <PaymentMethod
                  icon={<AccountBalanceRounded />}
                  title="Bank mandate"
                  detail="eMandate and netbanking for larger Indian business accounts"
                  badge="Razorpay setup"
                />
              </Stack>
              {setup.isPending && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  gap={1.5}
                  sx={{
                    bgcolor: "#fffef9",
                    border: "1px solid #d4d0c5",
                    borderRadius: 2,
                    p: 2.5,
                    mt: 2,
                  }}
                >
                  <CircularProgress size={22} />
                  <Box>
                    <Typography fontWeight={800}>
                      Preparing secure PayPal checkout
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      The first sandbox setup can take a few seconds.
                    </Typography>
                  </Box>
                </Stack>
              )}
              {checkout && (
                <Box
                  sx={{
                    bgcolor: "#fffef9",
                    border: "1px solid #d4d0c5",
                    borderRadius: 3,
                    p: { xs: 2, sm: 3 },
                    mt: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1} mb={2}>
                    <VerifiedUserRounded sx={{ color: "#4f6c00" }} />
                    <Box>
                      <Typography fontWeight={800}>
                        Approve with PayPal
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        PayPal securely handles your payment details.
                      </Typography>
                    </Box>
                  </Stack>
                  <div ref={paypalNode} />
                </Box>
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
                  Encrypted checkout · No payment details stored by TaskFlow
                </Typography>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" },
              gap: 2,
            }}
          >
            {offers.map((offer) => {
              const current = billing.data?.plan === offer.plan;
              return (
                <Box
                  key={offer.plan}
                  className={`pricing-card ${offer.plan === "pro" ? "is-featured" : ""}`}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography className="mono-label">{offer.name}</Typography>
                    {current && (
                      <Typography
                        className="mono-label"
                        sx={{ color: "#ff5c35" }}
                      >
                        Current plan
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" alignItems="flex-end" mt={2}>
                    <Typography
                      className="display-type"
                      sx={{ fontSize: 52, lineHeight: 1 }}
                    >
                      ${offer.price}
                    </Typography>
                    {offer.price > 0 && (
                      <Typography color="text.secondary">
                        {" "}
                        / account / mo
                      </Typography>
                    )}
                  </Stack>
                  <Typography color="text.secondary" mt={1}>
                    {offer.line}
                  </Typography>
                  <Stack spacing={1.25} my={3}>
                    {offer.features.map((feature) => (
                      <Stack key={feature} direction="row" gap={1}>
                        <CheckRounded sx={{ fontSize: 18, color: "#4f6c00" }} />
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
                      variant={offer.plan === "pro" ? "contained" : "outlined"}
                      startIcon={<RocketLaunchRounded />}
                      disabled={current || !billing.data?.paypal?.configured}
                      fullWidth
                      onClick={() => setSelectedPlan(offer.plan)}
                    >
                      {current ? "Active" : `Choose ${offer.name}`}
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
        {!billing.isLoading && !billing.data?.paypal?.configured && (
          <Alert severity="info" sx={{ mt: 2 }}>
            PayPal is not configured on the server yet. Add the sandbox client
            ID and secret to enable checkout.
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentMethod({
  icon,
  title,
  detail,
  badge,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  badge: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      disabled={!active || disabled}
      onClick={onClick}
      sx={{
        width: "100%",
        appearance: "none",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        border: active ? "2px solid #181817" : "1px solid #d4d0c5",
        borderRadius: 2.5,
        bgcolor: active ? "#fffef9" : "#e9e6de",
        color: "#181817",
        cursor: active && !disabled ? "pointer" : "default",
        opacity: active ? 1 : 0.72,
        "&:hover": active
          ? { transform: "translateY(-1px)", boxShadow: "3px 3px 0 #181817" }
          : {},
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          bgcolor: active ? "#d8ff63" : "#d4d0c5",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={850}>{title}</Typography>
        <Typography fontSize={13} color="text.secondary">
          {detail}
        </Typography>
      </Box>
      <Typography
        className="mono-label"
        sx={{ color: active ? "#4f6c00" : "#77736b", textAlign: "right" }}
      >
        {badge}
      </Typography>
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
          borderRadius: "50%",
          bgcolor: "#d8ff63",
          boxShadow: "5px 5px 0 #181817",
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
        Return to TaskFlow
      </Button>
    </Stack>
  );
}
