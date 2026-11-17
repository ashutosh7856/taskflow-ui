import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { SupportLink } from "../../components/SupportLink";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

import { SiteFooter } from "../../components/SiteFooter";
import { Brand } from "../../components/Brand";
import { FeatureMark } from "../../components/FeatureMark";
import {
  displayPrice,
  offers,
  type BillingInterval,
} from "../../lib/billingPlans";
import { IntervalToggle } from "../../components/IntervalToggle";
import { useAuthStore } from "../../store/auth";

type Section = { title: string; body: ReactNode };
type Page = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
};
const legalName = import.meta.env.VITE_LEGAL_BUSINESS_NAME || "Danto";
const businessAddress =
  import.meta.env.VITE_BUSINESS_ADDRESS ||
  "E-247, Gamma 1, Greater Noida, Uttar Pradesh 201308, India";
const businessPhone = import.meta.env.VITE_BUSINESS_PHONE || "+91 70119 43774";

const pages: Record<string, Page> = {
  "/about": {
    eyebrow: "About Danto",
    title: "Client work runs on trust. Trust runs on visibility.",
    intro:
      "Danto is a client portal and project board for freelancers and small agencies. It gives every client a live view of their project, a one-click way to approve work, and a clear place to send requests, so nobody has to chase anybody.",
    sections: [
      {
        title: "Why we built it",
        body: "Most freelancers don't lose clients over the quality of their work. They lose them over communication: slow updates, approvals lost in email threads, and requests that arrive through five different channels. Danto turns the board you already work from into a client experience that answers those questions before they're asked.",
      },
      {
        title: "Who it's for",
        body: "Designers, developers, marketers, video editors, consultants and small studios who manage several client projects at once and want to look organised without adopting a heavy agency platform.",
      },
      {
        title: "How AI helps",
        body: "AI drafts the boring parts, like turning a project brief into a board or writing your weekly client update from real progress. It only runs when you ask, it only uses the project data you choose, and you always review the result before anything is sent.",
      },
      {
        title: "Where we're based",
        body: (
          <>
            Danto is an independent, bootstrapped product. We answer every
            support email ourselves at <SupportLink />.
          </>
        ),
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
            Email <SupportLink />. Include your account email and, for a payment
            issue, the provider reference shown on your receipt. Never email
            passwords or full payment-card details.
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
                Phone:{" "}
                <a href={`tel:${businessPhone.replace(/\s/g, "")}`}>
                  {businessPhone}
                </a>
                .
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
            <SupportLink subject="Security report" />. Do not access other
            users’ data or disrupt the service while testing.
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
  const [interval, setBillingInterval] = useState<BillingInterval>("year");
  return (
    <PublicShell>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography className="mono-label" color="text.secondary">
          Pricing
        </Typography>
        <Typography
          className="display-type"
          component="h1"
          sx={{ fontSize: { xs: 48, md: 76 }, lineHeight: 0.95, mt: 2 }}
        >
          Simple pricing that grows with your client list.
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
          Start free with your first client. Upgrade when you're ready to bring
          everyone in. Your clients never pay and never need an account.
        </Typography>
        <Box sx={{ mt: 5 }}>
          <IntervalToggle value={interval} onChange={setBillingInterval} />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            mt: 3,
            mb: 6,
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
                {offer.plan === "pro" && (
                  <Chip
                    size="small"
                    label="Most popular"
                    sx={{
                      bgcolor: "#d8ff63",
                      color: "#181817",
                      fontWeight: 800,
                    }}
                  />
                )}
              </Stack>
              <Stack direction="row" alignItems="flex-end" my={2.5}>
                <Typography
                  className="display-type"
                  fontSize={56}
                  lineHeight={1}
                >
                  ${displayPrice(offer, interval).amount}
                </Typography>
                <Typography
                  color={offer.plan === "pro" ? "#aaa8a1" : "text.secondary"}
                  sx={{ ml: 0.75, mb: 0.5 }}
                >
                  {displayPrice(offer, interval).suffix}
                </Typography>
              </Stack>
              {offer.price > 0 && (
                <Typography
                  fontSize={13}
                  fontWeight={700}
                  sx={{
                    mt: -1.5,
                    mb: 1.5,
                    color: offer.plan === "pro" ? "#d8ff63" : "#4f6c00",
                  }}
                >
                  {displayPrice(offer, interval).note}
                </Typography>
              )}
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

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f2f0e9",
      }}
    >
      <Box component="header" sx={{ borderBottom: "1px solid #d4d0c5" }}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" minHeight={74} gap={2}>
            <Brand linked />
            <Box sx={{ flex: 1 }} />
            <Button
              component={Link}
              to="/guides"
              color="inherit"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Guides
            </Button>
            <Button
              component={Link}
              to="/pricing"
              color="inherit"
              sx={{ minWidth: 0, px: { xs: 1, sm: 2 } }}
            >
              Pricing
            </Button>
            <Button
              component={Link}
              to="/login?mode=register"
              variant="contained"
              sx={{
                whiteSpace: "nowrap",
                flexShrink: 0,
                px: { xs: 2, sm: 2.5 },
              }}
            >
              Start free
            </Button>
          </Stack>
        </Container>
      </Box>
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}
