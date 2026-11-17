import { Box, ButtonBase } from "@mui/material";
import type { BillingInterval } from "../lib/billingPlans";

/** Monthly / Yearly switch used on every pricing surface. */
export function IntervalToggle({
  value,
  onChange,
  dark = false,
}: {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
  dark?: boolean;
}) {
  const option = (interval: BillingInterval, label: React.ReactNode) => {
    const active = value === interval;
    return (
      <ButtonBase
        role="radio"
        aria-checked={active}
        onClick={() => onChange(interval)}
        sx={{
          px: { xs: 1.75, sm: 2.25 },
          minHeight: 40,
          borderRadius: 99,
          fontWeight: 800,
          fontSize: 14,
          gap: 0.75,
          whiteSpace: "nowrap",
          // `dark` = sits on a dark panel (same in both themes).
          bgcolor: active
            ? dark
              ? "#fff"
              : "var(--selected-bg)"
            : "transparent",
          color: active
            ? dark
              ? "#181817"
              : "var(--selected-fg)"
            : dark
              ? "#d4d2cb"
              : "var(--muted)",
          transition: "background-color .15s, color .15s",
        }}
      >
        {label}
      </ButtonBase>
    );
  };
  return (
    <Box
      role="radiogroup"
      aria-label="Billing period"
      sx={{
        display: "inline-flex",
        p: 0.5,
        gap: 0.25,
        borderRadius: 99,
        border: `1px solid ${dark ? "#4b4a45" : "var(--line-strong)"}`,
        bgcolor: dark ? "#232321" : "var(--surface)",
        maxWidth: "100%",
      }}
    >
      {option("month", "Monthly")}
      {option(
        "year",
        <>
          Yearly
          <Box
            component="span"
            sx={{
              fontSize: 11,
              fontWeight: 800,
              px: 0.9,
              py: 0.25,
              borderRadius: 99,
              bgcolor: "var(--acid)",
              color: "var(--on-accent)",
            }}
          >
            2 months free
          </Box>
        </>,
      )}
    </Box>
  );
}
