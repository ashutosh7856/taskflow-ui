import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { Brand } from "../../components/Brand";
import { FeatureMark } from "../../components/FeatureMark";
import { offers } from "../../lib/billingPlans";
import { useAuthStore } from "../../store/auth";

type Section = { title: string; body: ReactNode };
type Page = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
};

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@danto.app";
const legalName = import.meta.env.VITE_LEGAL_BUSINESS_NAME || "Danto";
const businessAddress = import.meta.env.VITE_BUSINESS_ADDRESS || "";
const businessPhone = import.meta.env.VITE_BUSINESS_PHONE || "";

const pages: Record<string, Page> = {
  "/about": {
    eyebrow: "Company",
    title: "Work should not need translating twice.",
    intro:
      "Danto turns the source material teams already have into structured work, then keeps reporting connected to what actually happened.",
    sections: [
      {
        title: "What we build",
        body: "Danto is a subscription software service for project planning, task coordination, and evidence-based workspace updates. It is designed around structured actions—not an open-ended AI chat window.",
      },
      {
        title: "Who it is for",
        body: "Solo builders can keep private work organized. Teams can coordinate shared workspaces, assignments, due dates, checklists, and board-level or workspace-level updates.",
      },
      {
        title: "How AI fits",
        body: "AI is used only when a user requests an AI action. Relevant prompt and workspace context are sent to the configured model provider, and the result must be reviewed before it is applied.",
      },
    ],
  },
  "/contact": {
    eyebrow: "Contact",
    title: "A real support path, before and after payment.",
    intro:
      "Questions about the product, your account, a payment, cancellation, privacy, or a security concern can all start here.",
    sections: [
      {
        title: "Customer support",
        body: (
          <>
            Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Include
            your account email and, for a payment issue, the provider reference
            shown on your receipt. Never email passwords or full payment-card
            details.
          </>
        ),
      },
      {
        title: "Response target",
        body: "We aim to acknowledge support and billing requests within two business days. Security reports are triaged as quickly as practical based on severity.",
      },
      {
        title: "Business information",
        body: (
          <>
            <strong>{legalName}</strong> provides the Danto software service.
            {businessAddress && <> Business address: {businessAddress}.</>}
            {businessPhone && (
              <>
                {" "}
                Phone: <a href={`tel:${businessPhone}`}>{businessPhone}</a>.
              </>
            )}{" "}
            The legal seller and applicable tax details are shown during
            checkout and on the payment receipt or invoice. Service delivery is
            online worldwide, subject to provider availability and applicable
            law.
          </>
        ),
      },
    ],
  },
  "/security": {
    eyebrow: "Trust center",
    title: "Security is part of the product boundary.",
    intro:
      "Danto limits access by account and workspace role, uses hosted payment checkout, and records operational events needed to protect the service.",
    sections: [
      {
        title: "Application controls",
        body: "Authenticated API access, short-lived access tokens, role-based workspace permissions, request validation, secure response headers, and rate limits protect common product paths.",
      },
      {
        title: "Payments",
        body: "Payment credentials are entered with the payment provider. Danto stores subscription and transaction references, plan status, and amounts needed for access control and reconciliation—not full card or bank credentials.",
      },
      {
        title: "AI safeguards",
        body: "AI use has monthly, daily, hourly, and input-size limits. Usage is reserved before generation to reduce concurrent-limit bypass, and token totals are recorded for cost and abuse monitoring.",
      },
      {
        title: "Report a concern",
        body: (
          <>
            Send a clear description and reproduction steps to{` `}
            <a href={`mailto:${supportEmail}?subject=Security report`}>
              {supportEmail}
            </a>
            . Do not access other users’ data or disrupt the service while
            testing.
          </>
        ),
      },
    ],
  },
  "/acceptable-use": {
    eyebrow: "Policy",
    title: "Use Danto for work, not harm.",
    intro:
      "These rules protect customers, infrastructure, payment networks, and AI capacity.",
    sections: [
      {
        title: "Prohibited activity",
        body: "Do not use Danto for unlawful content, fraud, harassment, malware, credential theft, unauthorized surveillance, intellectual-property infringement, or activity that violates another person’s privacy or rights.",
      },
      {
        title: "Service abuse",
        body: "Do not scrape, resell, share accounts to avoid plan limits, automate AI actions beyond normal product use, probe for unauthorized access, overload the service, or bypass workspace, seat, payment, or usage controls.",
      },
      {
        title: "AI inputs",
        body: "Do not submit payment credentials, passwords, authentication secrets, highly sensitive regulated data, or content you do not have permission to process. Review generated work before relying on it.",
      },
      {
        title: "Enforcement",
        body: "We may rate-limit, remove content, restrict features, suspend access, or close accounts when reasonably necessary to investigate abuse, protect users, comply with law, or preserve service reliability.",
      },
    ],
  },
  "/refund-policy": {
    eyebrow: "Billing policy",
    title: "Clear rules when a payment goes wrong.",
    intro:
      "Danto subscriptions provide immediate digital access. You can cancel renewal at any time; refund eligibility is narrower because the service is available right away.",
    sections: [
      {
        title: "Eligible requests",
        body: "Contact us within seven days of a charge if it was duplicated, the wrong amount was charged, you could not access the paid service because of a verified Danto fault, or law requires a refund. Include the account email and transaction reference.",
      },
      {
        title: "Normally not refundable",
        body: "Used subscription periods, unused time after a late cancellation, accidental purchases where paid access was available, and dissatisfaction with reviewed AI output are normally not refundable except where consumer law says otherwise.",
      },
      {
        title: "Review and timing",
        body: "We aim to review a complete request within five business days. Approved refunds are returned to the original payment method. The payment provider or bank controls the final posting time, which may take additional business days.",
      },
    ],
  },
  "/cancellation-policy": {
    eyebrow: "Billing policy",
    title: "Cancel renewal without losing your work.",
    intro:
      "Plans renew automatically until cancelled. The account owner controls the subscription for every workspace they own.",
    sections: [
      {
        title: "How to cancel",
        body: "The account owner can open Billing & plan and choose Cancel renewal. If that control is unavailable, email support from the account email before the renewal date.",
      },
      {
        title: "When it takes effect",
        body: "Cancellation stops future recurring charges. Paid access normally continues through the current paid period, then owned workspaces move to Free limits. Cancellation does not automatically refund the current period.",
      },
      {
        title: "Workspace members",
        body: "A member’s personal plan does not control a workspace they do not own. If a Pro or Team owner cancels, collaborators keep their own accounts, but the owner’s workspaces return to Free entitlements when paid access ends.",
      },
    ],
  },
  "/delivery-policy": {
    eyebrow: "Service delivery",
    title: "Digital access, delivered after confirmation.",
    intro:
      "Danto sells online software subscriptions. Nothing is physically shipped.",
    sections: [
      {
        title: "Fulfilment",
        body: "Paid plan access is normally activated immediately after the payment provider confirms an active subscription. A receipt or invoice is issued by the payment provider through its checkout and account systems.",
      },
      {
        title: "If access is delayed",
        body: "Payment confirmation can occasionally be delayed by a pending mandate, provider review, failed webhook, or bank status. Do not pay twice. Contact support with the transaction reference so we can reconcile it.",
      },
      {
        title: "Availability",
        body: "The service is accessed through the Danto web application. Availability depends on a compatible browser, internet access, account status, and supported regions and payment methods.",
      },
    ],
  },
  "/cookies": {
    eyebrow: "Privacy",
    title: "A small, practical storage footprint.",
    intro:
      "Danto uses browser storage and may use essential provider cookies needed to sign in, keep a session, protect checkout, and operate the service.",
    sections: [
      {
        title: "Essential storage",
        body: "The application stores session and interface state in the browser so you stay signed in and the app remembers necessary settings. Removing it may sign you out or reset preferences.",
      },
      {
        title: "Payment providers",
        body: "Hosted checkout providers may set their own essential security, fraud-prevention, and payment-session cookies under their privacy notices when checkout loads.",
      },
      {
        title: "Choices",
        body: "You can clear browser storage or block cookies in your browser, but essential account and checkout functions may stop working. Danto does not currently use advertising cookies in the product.",
      },
    ],
  },
};

export function PublicInfoPage() {
  const page = pages[useLocation().pathname] || pages["/about"];
  return (
    <PublicShell>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography className="mono-label" color="text.secondary">
          {page.eyebrow} / Updated November 9, 2026
        </Typography>
        <Typography
          className="display-type"
          component="h1"
          sx={{ fontSize: { xs: 44, md: 68 }, lineHeight: 0.98, mt: 2 }}
        >
          {page.title}
        </Typography>
        <Typography
          sx={{
            fontSize: 18,
            lineHeight: 1.75,
            color: "text.secondary",
            mt: 3,
          }}
        >
          {page.intro}
        </Typography>
        <Divider sx={{ my: 6 }} />
        <Stack spacing={5}>
          {page.sections.map((section, index) => (
            <Box key={section.title}>
              <Typography className="mono-label" color="text.secondary">
                {String(index + 1).padStart(2, "0")}
              </Typography>
              <Typography variant="h4" mt={1} mb={1.25}>
                {section.title}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.85 }}>
                {section.body}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Container>
    </PublicShell>
  );
}

export function PricingPage() {
  const signedIn = useAuthStore((state) => Boolean(state.accessToken));
  return (
    <PublicShell>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography className="mono-label" color="text.secondary">
          Pricing / Per owner account
        </Typography>
        <Typography
          className="display-type"
          component="h1"
          sx={{ fontSize: { xs: 48, md: 76 }, lineHeight: 0.95, mt: 2 }}
        >
          Predictable capacity. No AI blank cheque.
        </Typography>
        <Typography
          sx={{
            fontSize: 18,
            lineHeight: 1.75,
            color: "text.secondary",
            mt: 3,
            maxWidth: 760,
          }}
        >
          Each paid plan belongs to an account owner and covers every workspace
          they own. Team AI actions and seats are shared account-wide.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            my: 6,
          }}
        >
          {offers.map((offer) => (
            <Box
              key={offer.plan}
              sx={{
                p: 3,
                border:
                  offer.plan === "pro"
                    ? "2px solid #181817"
                    : "1px solid #c9c4b9",
                borderRadius: 3,
                bgcolor: offer.plan === "pro" ? "#181817" : "#fffef9",
                color: offer.plan === "pro" ? "#fff" : "#181817",
                boxShadow: offer.plan === "pro" ? "6px 6px 0 #ff5c35" : "none",
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography className="mono-label">{offer.name}</Typography>
                {offer.plan === "pro" && <Chip size="small" label="Popular" />}
              </Stack>
              <Stack direction="row" alignItems="flex-end" my={2.5}>
                <Typography
                  className="display-type"
                  fontSize={56}
                  lineHeight={1}
                >
                  ${offer.price}
                </Typography>
                <Typography
                  color={offer.plan === "pro" ? "#aaa8a1" : "text.secondary"}
                >
                  {offer.price ? " / month" : " forever"}
                </Typography>
              </Stack>
              <Typography
                color={offer.plan === "pro" ? "#b9b7af" : "text.secondary"}
              >
                {offer.line}
              </Typography>
              <Stack spacing={1.4} my={3}>
                {offer.features.map((feature) => (
                  <Stack key={feature} direction="row" gap={1.2}>
                    <FeatureMark inverse={offer.plan === "pro"} />
                    <Typography fontSize={14}>{feature}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Button
                component={Link}
                to={
                  signedIn && offer.plan !== "free"
                    ? `/billing?plan=${offer.plan}`
                    : "/login?mode=register"
                }
                variant={offer.plan === "pro" ? "contained" : "outlined"}
                fullWidth
                endIcon={<ArrowForwardRounded />}
                sx={
                  offer.plan === "pro"
                    ? { bgcolor: "#fff", color: "#181817" }
                    : undefined
                }
              >
                {offer.plan === "free" ? "Start free" : `Choose ${offer.name}`}
              </Button>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            bgcolor: "#fffef9",
            border: "1px solid #c9c4b9",
            borderRadius: 3,
            p: { xs: 3, md: 5 },
          }}
        >
          <Typography className="mono-label" color="text.secondary">
            How workspace billing works
          </Typography>
          <Typography variant="h3" mt={1.5}>
            The owner’s plan governs the workspace.
          </Typography>
          <Typography color="text.secondary" lineHeight={1.8} mt={2}>
            If a Pro or Team owner invites a Free member, that member can
            collaborate in the owner’s workspace and use its shared AI
            allowance. The member’s own workspaces remain Free. A membership
            never upgrades the member’s whole account, and the same person
            counts once toward the owner’s account-wide people limit even when
            they join multiple owned workspaces.
          </Typography>
        </Box>
      </Container>
    </PublicShell>
  );
}

function PublicShell({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f2f0e9" }}>
      <Box component="header" sx={{ borderBottom: "1px solid #d4d0c5" }}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" minHeight={74} gap={2}>
            <Brand linked />
            <Box sx={{ flex: 1 }} />
            <Button component={Link} to="/pricing" color="inherit">
              Pricing
            </Button>
            <Button
              component={Link}
              to="/login?mode=register"
              variant="contained"
            >
              Start free
            </Button>
          </Stack>
        </Container>
      </Box>
      <Box component="main">{children}</Box>
      <Box component="footer" sx={{ borderTop: "1px solid #d4d0c5", py: 4 }}>
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={2}
            alignItems={{ md: "center" }}
          >
            <Brand />
            <Typography fontSize={13} color="text.secondary" sx={{ flex: 1 }}>
              © {new Date().getFullYear()} Danto
            </Typography>
            <Stack direction="row" gap={2} flexWrap="wrap">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Security", "/security"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
                ["Refunds", "/refund-policy"],
                ["Cancellation", "/cancellation-policy"],
                ["Delivery", "/delivery-policy"],
              ].map(([label, path]) => (
                <Typography
                  key={path}
                  component={Link}
                  to={path}
                  fontSize={13}
                  color="text.secondary"
                >
                  {label}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
