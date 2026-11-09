import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { Brand } from "../../components/Brand";

const updated = "November 9, 2026";

const privacySections = [
  [
    "Information we collect",
    "We collect account details such as name and email, workspace content you create, collaboration activity, basic device and log information, and billing status or subscription identifiers returned by our payment providers. Danto does not receive or store your full card number, bank credentials, or payment-provider password.",
  ],
  [
    "How we use information",
    "We use information to provide and secure the service, synchronize boards, enable collaboration, process subscriptions, support users, prevent abuse, and improve reliability. AI features send the prompt and relevant board context to the configured AI provider only when you choose to use them.",
  ],
  [
    "Sharing and processors",
    "We share only what is needed with infrastructure, email, AI, analytics, and payment providers acting on our behalf. The checkout provider processes payment information under its own privacy terms. We do not sell personal information.",
  ],
  [
    "Retention and deletion",
    "Account and workspace data is retained while your account is active and as needed for security, legal, and backup purposes. You may request access, correction, export, or deletion using the support channel provided in the application.",
  ],
  [
    "Security",
    "We use access controls, authenticated API requests, encrypted network transport, and payment-provider hosted checkout. No online service can guarantee absolute security; report suspected account misuse promptly.",
  ],
  [
    "Your choices",
    "You can update workspace content, leave shared workspaces, cancel a paid plan, and request privacy assistance. Depending on your location, you may have additional rights to access, correct, delete, restrict, or object to processing.",
  ],
  [
    "International processing and changes",
    "Service providers may process data in countries different from yours. We will update this notice when practices materially change and show the new effective date.",
  ],
] as const;

const termsSections = [
  [
    "Using Danto",
    "You must provide accurate account information, protect your credentials, and use the service lawfully. You are responsible for content added by you and for ensuring you have the right to share it with collaborators.",
  ],
  [
    "Plans and payment",
    "Free and paid plan limits are shown before purchase. Paid subscriptions are billed monthly through the payment provider shown at checkout and renew automatically until cancelled. Taxes or currency conversion may be applied by the provider. Danto does not store your payment credentials. Discounts apply only for the period stated at checkout, after which the regular price resumes.",
  ],
  [
    "Cancellation and refunds",
    "You may cancel from Billing & Plan at any time. Cancellation stops future renewals and does not normally refund a completed billing period, except where required by law or under our Refund Policy. Access may continue until the paid period ends.",
  ],
  [
    "AI features",
    "AI output may be incomplete or inaccurate and must be reviewed before use. Do not submit secrets or regulated personal data to AI features. AI allowances are shared across workspaces owned by the subscriber and reset on the stated billing cycle. Monthly, daily, hourly, input-size, and other fair-use limits prevent automation, abuse, resale, and service disruption.",
  ],
  [
    "Your content",
    "You retain ownership of your content and grant Danto the limited permission needed to host, process, back up, and display it to provide the service. You are responsible for exports or backups needed for your own compliance.",
  ],
  [
    "Availability and acceptable use",
    "Do not attempt unauthorized access, disrupt the service, upload malicious code, abuse invitations, or use Danto to violate another person's rights. We may limit or suspend access to protect users and the service.",
  ],
  [
    "Disclaimers and liability",
    "The service is provided on an as-available basis. To the extent permitted by law, Danto is not liable for indirect or consequential losses. Nothing in these terms excludes rights or liability that cannot legally be excluded.",
  ],
  [
    "Changes and contact",
    "We may update features, limits, and these terms. Material changes will be communicated through the service when practical. Questions, legal notices, and billing disputes should be sent through the support channel provided in your account.",
  ],
] as const;

export function LegalPage() {
  const privacy = useLocation().pathname === "/privacy";
  const supportEmail =
    import.meta.env.VITE_SUPPORT_EMAIL || "support@danto.app";
  const sections = privacy ? privacySections : termsSections;
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f2f0e9" }}>
      <Box
        component="header"
        sx={{
          px: { xs: 2, md: 4 },
          height: 78,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #d4d0c5",
        }}
      >
        <Brand linked />
        <Box sx={{ flex: 1 }} />
        <Button component={Link} to="/" startIcon={<ArrowBackRounded />}>
          Back to app
        </Button>
      </Box>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 9 } }}>
        <Typography className="mono-label" color="text.secondary">
          Legal / Effective {updated}
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 64 }, my: 2 }}>
          {privacy ? "Privacy Policy" : "Terms of Service"}
        </Typography>
        <Typography fontSize={18} color="text.secondary" sx={{ maxWidth: 700 }}>
          {privacy
            ? "This notice explains what Danto collects, why it is used, and the choices available to you."
            : "These terms explain the rules for using Danto and the details of paid subscriptions."}
        </Typography>
        <Divider sx={{ my: 5 }} />
        <Stack spacing={4}>
          {sections.map(([title, body], index) => (
            <Box key={title}>
              <Typography className="mono-label" color="text.secondary">
                {String(index + 1).padStart(2, "0")}
              </Typography>
              <Typography variant="h5" mt={0.75} mb={1}>
                {title}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {body}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 5 }} />
        <Box
          sx={{
            bgcolor: "#fffef9",
            border: "1px solid #d4d0c5",
            borderRadius: 2,
            p: 3,
            mb: 4,
          }}
        >
          <Typography fontWeight={850}>Contact</Typography>
          <Typography color="text.secondary" mt={0.5}>
            Privacy, legal, and billing questions:{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          This product-facing policy is a practical baseline and should be
          reviewed for your business entity, operating country, and customer
          markets before launch.
        </Typography>
      </Container>
    </Box>
  );
}
