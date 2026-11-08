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
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
  const checkoutSection = useRef<HTMLDivElement>(null);
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
    if (!checkout) return;
    const frame = requestAnimationFrame(() => {
      checkoutSection.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [checkout]);

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
                ? "Review the plan, then continue securely with PayPal."
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
              <Stack spacing={1.2} sx={{ display: { xs: "none", sm: "flex" } }}>
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
                Payment method
              </Typography>
              <PaymentMethod />
              {!checkout && (
                <Button
                  variant="contained"
                  fullWidth
                  disabled={setup.isPending}
                  onClick={() => {
                    setProviderError("");
                    setup.mutate(selectedPlan);
                  }}
                  sx={{ mt: 2, minHeight: 48 }}
                >
                  {setup.isPending
                    ? "Preparing PayPal…"
                    : "Continue with PayPal"}
                </Button>
              )}
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
                  ref={checkoutSection}
                  sx={{
                    bgcolor: "#fffef9",
                    border: "1px solid #d4d0c5",
                    borderRadius: 3,
                    p: { xs: 2, sm: 3 },
                    mt: 2,
                    scrollMarginTop: 12,
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
                  Encrypted checkout · No payment details stored by Danto
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
      <Radio
        checked
        readOnly
        inputProps={{ "aria-label": "PayPal selected" }}
        sx={{ p: 0.5, color: "#0070ba", "&.Mui-checked": { color: "#0070ba" } }}
      />
      <Box
        component="img"
        src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-color.svg"
        alt="PayPal"
        sx={{
          width: 88,
          height: 28,
          objectFit: "contain",
          objectPosition: "left center",
        }}
      />
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
        Return to Danto
      </Button>
    </Stack>
  );
}
