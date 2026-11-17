import { Box, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";

const columns: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: "Product",
    links: [
      ["How it works", "/#how"],
      ["Features", "/#features"],
      ["Compare", "/#compare"],
      ["Pricing", "/pricing"],
      ["FAQ", "/#faq"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["All guides", "/guides"],
      [
        "Client update templates",
        "/guides/client-status-update-email-template",
      ],
      ["Client approval process", "/guides/client-approval-process"],
      [
        "Sharing boards with clients",
        "/guides/share-trello-board-with-clients",
      ],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Security", "/security"],
      ["Sign in", "/login"],
      ["Create account", "/login?mode=register"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Refunds", "/refund-policy"],
      ["Cancellation", "/cancellation-policy"],
      ["Acceptable use", "/acceptable-use"],
      ["Cookies", "/cookies"],
    ],
  },
];

/** Site-wide footer for the landing page and every public page. */
export function SiteFooter() {
  return (
    <Box component="footer" className="site-footer">
      <Container maxWidth="xl">
        <Box className="site-footer-grid">
          <Box className="site-footer-brand">
            <Brand linked />
            <Typography
              color="text.secondary"
              fontSize={14}
              mt={1.5}
              maxWidth={300}
              lineHeight={1.6}
            >
              Client portals, one-click approvals and AI status updates for
              freelancers and small agencies.
            </Typography>
            <Typography
              component="a"
              href="mailto:support@danto.app"
              fontSize={14}
              fontWeight={700}
              sx={{ display: "inline-block", mt: 2, color: "var(--ink)" }}
            >
              support@danto.app
            </Typography>
          </Box>
          {columns.map((column) => (
            <Box component="nav" key={column.title} aria-label={column.title}>
              <Typography fontSize={13} fontWeight={800} mb={1.5}>
                {column.title}
              </Typography>
              {column.links.map(([label, href]) =>
                href.startsWith("/#") ? (
                  <a key={href} href={href} className="site-footer-link">
                    {label}
                  </a>
                ) : (
                  <Link key={href} to={href} className="site-footer-link">
                    {label}
                  </Link>
                ),
              )}
            </Box>
          ))}
        </Box>
        <Typography className="site-footer-legal" color="text.secondary">
          © {new Date().getFullYear()} Danto. Payments are processed securely by
          Dodo Payments, our merchant of record.
        </Typography>
      </Container>
    </Box>
  );
}
