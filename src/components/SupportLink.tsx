import { Tooltip } from "@mui/material";
import { useState, type ReactNode } from "react";

export const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "support@danto.app";

/**
 * Opens a pre-filled email to support. Many computers have no mail app set
 * up, so mailto: silently does nothing there; the address is also copied
 * so people can paste it into Gmail or Outlook.
 */
export function SupportLink({
  subject = "Danto support",
  children,
  className,
}: {
  subject?: string;
  children?: ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    `Hi Danto team,\n\n\n\nPage: ${typeof window === "undefined" ? "" : window.location.href}`,
  )}`;
  return (
    <Tooltip
      open={copied}
      title="Opening your email app · address copied"
      placement="top"
      disableHoverListener
      disableFocusListener
      disableTouchListener
    >
      <a
        href={href}
        className={className}
        onClick={() => {
          navigator.clipboard?.writeText(SUPPORT_EMAIL).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }}
      >
        {children ?? SUPPORT_EMAIL}
      </a>
    </Tooltip>
  );
}
