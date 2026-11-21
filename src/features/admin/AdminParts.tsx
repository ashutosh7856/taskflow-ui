import { Box, CircularProgress, Typography } from "@mui/material";
import type { ReactNode } from "react";

/** Building blocks shared by the admin tabs. */
export function Loading() {
  return (
    <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
      <CircularProgress />
    </Box>
  );
}
export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 3,
        bgcolor: "var(--surface)",
        border: "1px solid var(--line)",
      }}
    >
      <Typography className="mono-label" color="text.secondary">
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 34,
          fontWeight: 850,
          letterSpacing: "-.04em",
          lineHeight: 1.15,
          mt: 0.5,
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {hint}
      </Typography>
    </Box>
  );
}
export function Panel({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.75 },
        borderRadius: 3,
        bgcolor: "var(--surface)",
        border: "1px solid var(--line)",
        minWidth: 0,
      }}
    >
      <Typography fontWeight={850} fontSize={17}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {detail}
      </Typography>
      {children}
    </Box>
  );
}
