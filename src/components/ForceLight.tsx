import { useLayoutEffect, type ReactNode } from "react";

/**
 * Marketing, legal, auth and client-portal pages are designed for light only.
 * Marking <body> light scopes every colour token (and MUI's variables) to the
 * light scheme for the page and anything it portals into <body> (dialogs,
 * menus), whatever the app-wide setting is.
 */
export function ForceLight({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    document.body.setAttribute("data-theme", "light");
    return () => document.body.removeAttribute("data-theme");
  }, []);
  return children;
}
