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
          bgcolor: active ? (dark ? "#fff" : "#181817") : "transparent",
          color: active
            ? dark
              ? "#181817"
              : "#fff"
            : dark
              ? "#d4d2cb"
              : "#4b4842",
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
        border: `1px solid ${dark ? "#4b4a45" : "#c9c4b9"}`,
        bgcolor: dark ? "#232321" : "#fffef9",
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
              bgcolor: "#d8ff63",
              color: "#181817",
            }}
          >
            2 months free
          </Box>
        </>,
      )}
    </Box>
  );
}
