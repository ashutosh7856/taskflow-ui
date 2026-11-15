import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { prerenderToNodeStream } from "react-dom/static";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router-dom";
import { routes } from "./App";
import { SITE } from "./content/seo";
import { theme } from "./theme";

export { headTags, indexablePaths, metaFor } from "./content/seo";

/** Renders one public route to static HTML (used at build time only). */
export async function render(path: string) {
  const cache = createCache({ key: "css" });
  const emotion = createEmotionServer(cache);
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`${SITE}${path}`));
  if (context instanceof Response) return null;
  const router = createStaticRouter(handler.dataRoutes, context);

  const { prelude } = await prerenderToNodeStream(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={new QueryClient()}>
          <StaticRouterProvider
            router={router}
            context={context}
            hydrate={false}
          />
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>,
  );
  let html = "";
  const decoder = new TextDecoder();
  for await (const chunk of prelude as unknown as AsyncIterable<
    Uint8Array | string
  >)
    html +=
      typeof chunk === "string"
        ? chunk
        : decoder.decode(chunk, { stream: true });
  const styles = emotion.constructStyleTagsFromChunks(
    emotion.extractCriticalToChunks(html),
  );
  return { html, styles };
}
