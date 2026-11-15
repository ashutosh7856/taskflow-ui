const KEY = "danto-ref";

/** Remembers the first ?ref= / ?utm_source= a visitor arrived with. */
export function captureAttribution() {
  try {
    if (localStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const source =
      params.get("ref") ||
      params.get("utm_source") ||
      (document.referrer && !document.referrer.includes(window.location.host)
        ? new URL(document.referrer).hostname
        : "");
    if (source) localStorage.setItem(KEY, source.slice(0, 80));
  } catch {
    /* storage blocked: attribution is optional */
  }
}

export function signupSource() {
  try {
    return localStorage.getItem(KEY) || undefined;
  } catch {
    return undefined;
  }
}
