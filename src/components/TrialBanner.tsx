import { Box, Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays } from "date-fns";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api";

interface BillingSummary {
  plan: "free" | "pro" | "business";
  billingStatus: string;
  currentPeriodEnd: string | null;
  paypalSubscriptionId?: string | null;
}

/** Shows the remaining Pro trial (or comped access) with an upgrade link. */
export function TrialBanner() {
  const location = useLocation();
  const billing = useQuery({
    queryKey: ["billing"],
    queryFn: async () => (await api.get<BillingSummary>("/billing")).data,
    staleTime: 5 * 60 * 1000,
  });
  const data = billing.data;
  if (
    !data ||
    data.plan === "free" ||
    data.paypalSubscriptionId ||
    !data.currentPeriodEnd ||
    location.pathname === "/billing"
  )
    return null;
  const days = differenceInCalendarDays(
    new Date(data.currentPeriodEnd),
    new Date(),
  );
  if (days < 0 || days > 30) return null;
  return (
    <Box
      sx={{ bgcolor: "#181817", color: "#fff", px: { xs: 2, sm: 3 }, py: 1 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        columnGap={2}
        rowGap={0.5}
        sx={{ maxWidth: 1280, mx: "auto" }}
      >
        <Typography fontSize={14} textAlign="center">
          <Box component="span" sx={{ color: "#d8ff63", fontWeight: 800 }}>
            Pro trial
          </Box>{" "}
          ·{" "}
          {days === 0
            ? "ends today"
            : `${days} day${days === 1 ? "" : "s"} left`}
          . After that, extra portals pause and branding switches off.
        </Typography>
        <Button
          component={Link}
          to={`/billing?interval=year&plan=${data.plan}`}
          size="small"
          sx={{
            bgcolor: "#d8ff63",
            color: "#181817",
            minHeight: 32,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#e5ff94" },
          }}
        >
          Keep Pro
        </Button>
      </Stack>
    </Box>
  );
}
