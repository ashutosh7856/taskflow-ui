import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useRouteError } from "react-router-dom";
import {
  isChunkLoadError,
  isReloadingForNewBuild,
  reloadForNewBuild,
} from "../lib/staleBuild";

/** Friendly fallback for any page that fails to load or render. */
export function RouteError() {
  const error = useRouteError();
  const stale = isChunkLoadError(error);
  // A new version was deployed: the page is reloading into it, so show a
  // spinner for that second instead of an error.
  const [reloading] = useState(
    () => isReloadingForNewBuild() || (stale && reloadForNewBuild()),
  );
  if (reloading)
    return (
      <Box
        aria-label="Loading the latest version"
        sx={{ minHeight: "60vh", display: "grid", placeItems: "center", bgcolor: "var(--bg)" }}
      >
        <CircularProgress />
      </Box>
    );
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 3,
        bgcolor: "var(--bg)",
        color: "var(--ink)",
      }}
    >
      <Stack gap={1.5} alignItems="center" textAlign="center" maxWidth={420}>
        <Typography variant="h5" fontWeight={850}>
          {stale ? "Danto was just updated" : "Something went wrong"}
        </Typography>
        <Typography color="text.secondary">
          {stale
            ? "Reload to get the latest version. Your work is saved."
            : "Reload the page to try again. If it keeps happening, email support@danto.app."}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </Stack>
    </Box>
  );
}
