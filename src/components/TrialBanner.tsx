import WorkspacePremiumRounded from "@mui/icons-material/WorkspacePremiumRounded";
import { Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays } from "date-fns";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { NoticeBar } from "./NoticeBar";

interface BillingSummary {
  plan: "free" | "pro" | "business";
  billingStatus: string;
  currentPeriodEnd: string | null;
  subscriptionId?: string | null;
}

const DISMISS_KEY = "danto-trial-notice-dismissed-at";
const HIDE_FOR_MS = 3 * 24 * 60 * 60 * 1000;

function dismissedRecently() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < HIDE_FOR_MS;
  } catch {
    return false;
  }
}

/** Remaining Pro trial (or comped access) with an upgrade link. */
export function TrialBanner() {
  const location = useLocation();
  const [hidden, setHidden] = useState(dismissedRecently);
  const billing = useQuery({
    queryKey: ["billing"],
    queryFn: async () => (await api.get<BillingSummary>("/billing")).data,
    staleTime: 5 * 60 * 1000,
  });
  const data = billing.data;
  if (
    !data ||
    data.plan === "free" ||
    data.subscriptionId ||
    !data.currentPeriodEnd ||
    location.pathname === "/billing"
  )
    return null;
  const days = differenceInCalendarDays(
    new Date(data.currentPeriodEnd),
    new Date(),
  );
  if (days < 0 || days > 30) return null;
  // Closing hides it for a few days, but the last day always shows.
  if (hidden && days > 1) return null;
  const planName = data.plan === "business" ? "Team" : "Pro";
  const price = data.plan === "business" ? 49 : 19;

  return (
    <NoticeBar
      icon={<WorkspacePremiumRounded />}
      title={
        days === 0
          ? `Your ${planName} trial ends today`
          : `${days} day${days === 1 ? "" : "s"} left in your ${planName} trial`
      }
      onClose={() => {
        try {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
          // Private mode: just hide for this visit.
        }
        setHidden(true);
      }}
      actions={
        <Button
          component={Link}
          to={`/billing?interval=month&plan=${data.plan}`}
          size="small"
          sx={{
            bgcolor: "#d8ff63",
            color: "#181817",
            fontWeight: 800,
            minHeight: 34,
            px: 2,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#ecffad" },
          }}
        >
          Keep {planName} · $0 today
        </Button>
      }
    >
      Then you move to Free automatically, never charged. To keep {planName}{" "}
      (${price}/month), add a card now: the first charge happens when the
      trial ends.
    </NoticeBar>
  );
}
