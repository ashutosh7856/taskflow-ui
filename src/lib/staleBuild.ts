/**
 * After a deploy, a tab still running the previous build asks for code files
 * that no longer exist. The fix is to load the new build: reload once. The
 * timestamp guard stops a reload loop if the files are really missing.
 */
const KEY = "danto-stale-build-reload-at";

export function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk|Unable to preload CSS/i.test(
    message,
  );
}

/** Reloads the page unless we already did so in the last 30 seconds. */
let reloading = false;

/** True once this tab has started reloading into the new build. */
export function isReloadingForNewBuild() {
  return reloading;
}

export function reloadForNewBuild() {
  // Several failed imports can arrive together (Vite's preload step and the
  // import itself): they all share the reload already under way.
  if (reloading) return true;
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: still reload; worst case the error page shows.
  }
  reloading = true;
  window.location.reload();
  return true;
}
