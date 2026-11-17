import CloseRounded from "@mui/icons-material/CloseRounded";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

/**
 * One consistent in-app notice: icon, short title + detail, actions and a
 * close button. `tone="dark"` for upgrade prompts, `"accent"` for things that
 * need the user (invites).
 */
export function NoticeBar({
  icon,
  title,
  children,
  actions,
  onClose,
  tone = "dark",
}: {
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  tone?: "dark" | "accent";
}) {
  const dark = tone === "dark";
  return (
    <Box sx={{ px: { xs: 1.5, sm: 3 }, pt: 1.5 }}>
      <Stack
        role="status"
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={{ xs: 1.25, sm: 2 }}
        sx={{
          maxWidth: 1280,
          mx: "auto",
          position: "relative",
          px: { xs: 1.75, sm: 2 },
          py: 1.5,
          pr: { xs: 5, sm: 1.5 },
          borderRadius: 3,
          bgcolor: dark ? "var(--panel)" : "var(--tint-lime)",
          color: dark ? "#fff" : "var(--ink)",
          border: dark
            ? "1px solid var(--panel-line)"
            : "1px solid var(--tint-lime-line)",
          boxShadow: dark
            ? "0 10px 30px rgba(24,24,23,.18)"
            : "0 6px 20px rgba(79,108,0,.10)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: dark ? "var(--acid)" : "var(--panel)",
              color: dark ? "var(--on-accent)" : "#d8ff63",
              "& svg": { fontSize: 20 },
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={850} fontSize={14.5} lineHeight={1.35}>
              {title}
            </Typography>
            {children && (
              <Typography
                fontSize={13}
                lineHeight={1.45}
                sx={{ color: dark ? "#c9c7bf" : "var(--muted)", mt: 0.25 }}
              >
                {children}
              </Typography>
            )}
          </Box>
        </Stack>
        {actions && (
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            sx={{ flexShrink: 0, pl: { xs: 6.25, sm: 0 } }}
          >
            {actions}
          </Stack>
        )}
        {onClose && (
          <IconButton
            aria-label="Dismiss"
            size="small"
            onClick={onClose}
            sx={{
              position: { xs: "absolute", sm: "static" },
              top: 8,
              right: 8,
              color: dark ? "#c9c7bf" : "var(--muted)",
              "&:hover": {
                bgcolor: dark ? "rgba(255,255,255,.12)" : "var(--hover)",
                color: dark ? "#fff" : "var(--ink)",
              },
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
}
