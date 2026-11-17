import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import { theme } from "./theme";
import { captureAttribution } from "./lib/attribution";

captureAttribution();

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
if (container.firstElementChild) {
  hydrateRoot(container, app, {
    // A signed-in visitor sees slightly different buttons than the
    // prerendered anonymous HTML; React patches that up on its own.
    onRecoverableError: () => {},
  });
} else {
  createRoot(container).render(app);
}
