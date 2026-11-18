import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import { theme } from "./theme";
import { captureAttribution } from "./lib/attribution";
import { reloadForNewBuild } from "./lib/staleBuild";

captureAttribution();

// Vite's own preload step fails the same way after a deploy.
window.addEventListener("vite:preloadError", (event) => {
  if (reloadForNewBuild()) event.preventDefault();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

const app = (
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);

const container = document.getElementById("root")!;
// Public pages ship prerendered HTML (for search engines and AI crawlers):
// hydrate it. App screens ship an empty shell: render from scratch.
// Only reuse prerendered HTML made for this exact page. Any other page that
// was served it (e.g. a route missing from _redirects) renders fresh, since
// hydrating mismatched HTML flashes an error.
const trim = (path: string) => path.replace(/\/+$/, "") || "/";
const prerendered = container.dataset.prerendered;
if (
  container.firstElementChild &&
  prerendered !== undefined &&
  trim(prerendered) === trim(window.location.pathname)
) {
  hydrateRoot(container, app, {
    // A signed-in visitor sees slightly different buttons than the
    // prerendered anonymous HTML; React patches that up on its own.
    onRecoverableError: () => {},
  });
} else {
  container.replaceChildren();
  createRoot(container).render(app);
}
