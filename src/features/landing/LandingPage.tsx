import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { SupportLink } from "../../components/SupportLink";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import BrushRounded from "@mui/icons-material/BrushRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import InboxRounded from "@mui/icons-material/InboxRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import RemoveRounded from "@mui/icons-material/RemoveRounded";
import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  LinearProgress,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { FeatureMark } from "../../components/FeatureMark";
import { IntervalToggle } from "../../components/IntervalToggle";
import { SiteFooter } from "../../components/SiteFooter";
import { faqs } from "../../content/faqs";
import {
  displayPrice,
  offers,
  type BillingInterval,
} from "../../lib/billingPlans";
import { useAuthStore } from "../../store/auth";

const navLinks: Array<[string, string]> = [
  ["How it works", "#how"],
  ["Features", "#features"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
  ["Guides", "/guides"],
];

const audiences = [
  "Web designers",
  "Developers",
  "Brand studios",
  "Marketing agencies",
  "Video editors",
  "Copywriters",
  "Consultants",
];

const pains = [
  {
    quote: "“Hey, just checking in. Any update?”",
    copy: "Clients chase you because they can’t see the work. Each reply pulls you out of it.",
  },
  {
    quote: "“Which version did we approve?”",
    copy: "Sign-offs get lost in email and chat threads, and then nobody agrees on scope.",
  },
  {
    quote: "“Can we add one small thing?”",
    copy: "Requests arrive by DM, call and comment. Half never make it onto your list.",
  },
  {
    quote: "Friday evening: writing status reports",
    copy: "Turning your board into a polite update takes about an hour per client, every week.",
  },
];

const steps = [
  {
    title: "Set up the project",
    copy: "Start from the client template or paste the brief and let AI draft the stages and deliverables. Edit anything.",
  },
  {
    title: "Share one private link",
    copy: "Your client opens a branded portal showing progress, what’s next and what needs their input. No account, no password.",
  },
  {
    title: "Let the busywork run itself",
    copy: "Request approvals with one click, collect requests in one place, and send a weekly update that AI drafts from the board.",
  },
];

const comparison: Array<{
  row: string;
  danto: string;
  board: [Mark, string];
  email: [Mark, string];
}> = [
  {
    row: "Clients see live progress",
    danto: "Branded portal, no login",
    board: ["partial", "Your whole board, as is"],
    email: ["no", "Only when you write"],
  },
  {
    row: "Internal notes stay private",
    danto: "Hide any card with one switch",
    board: ["no", "Everything is visible"],
    email: ["partial", "Easy to forward by mistake"],
  },
  {
    row: "Approvals with a record",
    danto: "One click, timestamped",
    board: ["no", "Comments at best"],
    email: ["partial", "Buried in threads"],
  },
  {
    row: "Requests land on your board",
    danto: "Straight from the portal",
    board: ["partial", "Needs a guest account"],
    email: ["no", "You copy them over"],
  },
  {
    row: "Weekly status update",
    danto: "AI drafts it from the board",
    board: ["no", "Written by hand"],
    email: ["no", "Written by hand"],
  },
  {
    row: "Your brand",
    danto: "Logo, name and colour",
    board: ["no", "Their branding"],
    email: ["partial", "Your signature only"],
  },
];

type Mark = "yes" | "partial" | "no";

export function LandingPage() {
  const signedIn = useAuthStore((state) => Boolean(state.accessToken));
  const primaryPath = signedIn ? "/app" : "/login?mode=register";
  const primaryLabel = signedIn ? "Open your projects" : "Start free";
  const [interval, setBillingInterval] = useState<BillingInterval>("year");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Box className="landing-page lp">
      <Box component="header" className="landing-nav">
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" minHeight={68} gap={2}>
            <Brand linked />
            <Stack
              component="nav"
              aria-label="Main"
              direction="row"
              gap={3.5}
              sx={{ display: { xs: "none", md: "flex" }, ml: 5 }}
            >
              {navLinks.map(([label, href]) => (
                <NavItem key={href} href={href}>
                  {label}
                </NavItem>
              ))}
            </Stack>
            <Box sx={{ flex: 1 }} />
            {!signedIn && (
              <Button
                component={Link}
                to="/login"
                color="inherit"
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                Sign in
              </Button>
            )}
            <Button
              component={Link}
              to={primaryPath}
              variant="contained"
              sx={{ whiteSpace: "nowrap", px: { xs: 2, sm: 2.5 } }}
            >
              {signedIn ? "Open app" : "Start free"}
            </Button>
            <IconButton
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              sx={{ display: { md: "none" }, ml: -0.5, color: "var(--ink)" }}
            >
              <MenuRounded />
            </IconButton>
          </Stack>
        </Container>
      </Box>
      <Drawer
        anchor="top"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ className: "lp-mobile-menu" }}
      >
        <Stack direction="row" alignItems="center" mb={2}>
          <Brand linked />
          <Box flex={1} />
          <IconButton
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <CloseRounded />
          </IconButton>
        </Stack>
        {navLinks.map(([label, href]) => (
          <Box
            key={href}
            component={href.startsWith("#") ? "a" : Link}
            {...(href.startsWith("#") ? { href } : { to: href })}
            onClick={() => setMenuOpen(false)}
            className="lp-mobile-link"
          >
            {label}
          </Box>
        ))}
        {!signedIn && (
          <Button
            component={Link}
            to="/login"
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign in
          </Button>
        )}
      </Drawer>

      <Box component="main">
        {/* Hero */}
        <Box className="lp-hero">
          <Container maxWidth="xl" className="lp-hero-grid">
            <Box className="lp-hero-copy">
              <Typography className="lp-kicker">
                Client portals for freelancers and small agencies
              </Typography>
              <Typography component="h1" className="lp-h1">
                Stop answering{" "}
                <Box component="span" className="landing-highlight">
                  “any&nbsp;update?”
                </Box>{" "}
                emails.
              </Typography>
              <Typography className="lp-lede">
                Danto turns your project board into a live, branded page for
                each client. They follow progress, approve work in one click and
                send requests in one place. AI drafts the weekly update for you.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={1.5}
                mt={4}
                alignItems={{ sm: "center" }}
              >
                <Button
                  component={Link}
                  to={primaryPath}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRounded />}
                  className="lp-cta"
                >
                  {primaryLabel}
                </Button>
                <Button
                  component="a"
                  href="#how"
                  size="large"
                  color="inherit"
                  className="lp-cta-secondary"
                >
                  See how it works
                </Button>
              </Stack>
              <Stack component="ul" className="lp-proof">
                {[
                  "14 days of Pro included, no card needed",
                  "Clients never create an account",
                  "One client portal free forever",
                ].map((item) => (
                  <li key={item}>
                    <span className="lp-bullet" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </Stack>
            </Box>
            <HeroDemo />
          </Container>
        </Box>

        {/* Who it's for */}
        <Box className="lp-audience" aria-label="Who Danto is for">
          <Container maxWidth="xl">
            <Typography className="lp-audience-title">
              Made for people who do client work
            </Typography>
          </Container>
          <Box className="lp-audience-track">
            {/* Two copies make the loop seamless; the second is decorative. */}
            {[0, 1].map((copy) => (
              <Box
                key={copy}
                component="ul"
                className="lp-audience-list"
                aria-hidden={copy === 1 || undefined}
              >
                {audiences.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Problem */}
        <Container maxWidth="xl" className="lp-section">
          <SectionIntro
            title="The work is the easy part. Keeping clients in the loop isn’t."
            copy="Check-ins, approval chasing and status reports quietly take hours each week. Your board already has the answers. Danto shares them with your client."
          />
          <Box className="lp-pains">
            {pains.map((pain) => (
              <Box key={pain.quote} className="lp-pain">
                <Typography component="h3" className="lp-pain-quote">
                  {pain.quote}
                </Typography>
                <Typography color="text.secondary" lineHeight={1.65} mt={1}>
                  {pain.copy}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>

        {/* How it works */}
        <Box id="how" className="lp-how">
          <Container maxWidth="xl" className="lp-section">
            <SectionIntro
              title="Up and running before your next client call."
              copy="Keep working on a kanban board the way you already do. Danto turns that board into the client’s view."
            />
            <Box component="ol" className="lp-steps">
              {steps.map((step, index) => (
                <Box component="li" key={step.title} className="lp-step">
                  <span className="lp-step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <Typography component="h3" variant="h5" mt={2.5}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7} mt={1}>
                    {step.copy}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Features */}
        <Box id="features" className="lp-features">
          <Container maxWidth="xl" className="lp-section">
            <SectionIntro
              dark
              title="Everything a client needs to see. Nothing they shouldn’t."
              copy="Danto does one job well: it keeps clients informed and sign-offs moving. Keep your contracts, invoices and files where they already are."
            />
            <Box className="lp-bento">
              <BentoTile
                className="span-4"
                icon={<TaskAltRounded />}
                title="One-click approvals"
                copy="Request a sign-off on any card. Your client approves or asks for changes from the email or the portal, and every answer is timestamped."
              >
                <Box className="lp-mini-email">
                  <Typography fontSize={12} color="#77736b">
                    To: sam@acme.co
                  </Typography>
                  <Typography fontWeight={800} mt={0.5}>
                    Ready for your review: Homepage design, v2
                  </Typography>
                  <Stack direction="row" gap={1} mt={1.5}>
                    <span className="lp-pill solid">Approve</span>
                    <span className="lp-pill">Request changes</span>
                  </Stack>
                </Box>
              </BentoTile>
              <BentoTile
                className="span-2"
                icon={<AutoAwesomeRounded />}
                title="AI weekly updates"
                copy="One click drafts a friendly status email from the live board: what shipped, what’s next and what you need from them. You review it, then send."
              >
                <Box className="lp-mini-draft">
                  <p>Hi Sam,</p>
                  <p>
                    This week we finished the sitemap and the homepage design.
                    Next up is the CMS setup.
                  </p>
                  <p>
                    <strong>Needs you:</strong> approve homepage v2 by Thursday.
                  </p>
                </Box>
              </BentoTile>
              <BentoTile
                className="span-2"
                icon={<InboxRounded />}
                title="Requests in one place"
                copy="Clients send new requests from their portal. Each one becomes a card on your board, not a message you have to remember."
              />
              <BentoTile
                className="span-2"
                icon={<LockRounded />}
                title="Private where it matters"
                copy="Mark any card as internal. Rates, notes and other clients’ work never appear in the portal or in AI updates."
              />
              <BentoTile
                className="span-2"
                icon={<BrushRounded />}
                title="Your brand on every page"
                copy="Your logo, name and colour on portals and emails. The Team plan removes the Danto badge."
              />
            </Box>
          </Container>
        </Box>

        {/* Comparison */}
        <Container maxWidth="lg" id="compare" className="lp-section">
          <SectionIntro
            title="Why not just share the board?"
            copy="A shared board shows clients your whole workspace. Email threads hide the project. Danto gives clients their own view of it."
          />
          <Box className="lp-compare-wrap">
            <Box component="table" className="lp-compare">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Capability</span>
                  </th>
                  <th scope="col" className="is-danto">
                    Danto
                  </th>
                  <th scope="col">Shared Trello or Notion board</th>
                  <th scope="col">Email and chat</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item) => (
                  <tr key={item.row}>
                    <th scope="row">{item.row}</th>
                    <td className="is-danto">
                      <MarkCell mark="yes" text={item.danto} />
                    </td>
                    <td>
                      <MarkCell mark={item.board[0]} text={item.board[1]} />
                    </td>
                    <td>
                      <MarkCell mark={item.email[0]} text={item.email[1]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        </Container>

        {/* Savings */}
        <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 } }}>
          <SavingsCalculator />
        </Container>

        {/* Pricing */}
        <Box id="pricing" className="lp-pricing">
          <Container maxWidth="xl" className="lp-section">
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ md: "flex-end" }}
              gap={3}
              mb={{ xs: 4, md: 6 }}
            >
              <SectionIntro
                flush
                title="Simple pricing that grows with your client list."
                copy="Every new account gets 14 days of Pro, no card needed, and you're never charged automatically when it ends. Keep Pro for $19/month: add a card during the trial and the first charge happens on your trial end date. Your clients never pay or sign up."
              />
              <IntervalToggle value={interval} onChange={setBillingInterval} />
            </Stack>
            <Box className="landing-pricing-grid">
              {offers.map((offer) => {
                const price = displayPrice(offer, interval);
                const featured = offer.plan === "pro";
                return (
                  <Box
                    key={offer.plan}
                    className={`landing-price-card ${featured ? "featured" : ""}`}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography fontWeight={800} fontSize={18}>
                        {offer.name}
                      </Typography>
                      {featured && (
                        <span className="lp-badge">Most popular</span>
                      )}
                    </Stack>
                    <Typography color="text.secondary" fontSize={14} mt={0.5}>
                      {offer.line}
                    </Typography>
                    <Stack direction="row" alignItems="flex-end" mt={3}>
                      <Typography
                        className="display-type"
                        fontSize={56}
                        lineHeight={1}
                      >
                        ${price.amount}
                      </Typography>
                      <Typography color="text.secondary" mb={0.75} ml={0.75}>
                        {price.suffix}
                      </Typography>
                    </Stack>
                    <Typography
                      fontSize={13}
                      fontWeight={700}
                      sx={{ color: "#4f6c00", mt: 0.75, minHeight: 20 }}
                    >
                      {price.note || "No card needed"}
                    </Typography>
                    <Stack
                      component="ul"
                      spacing={1.25}
                      className="lp-plan-list"
                    >
                      {offer.features.map((feature) => (
                        <Stack
                          component="li"
                          key={feature}
                          direction="row"
                          gap={1}
                        >
                          <FeatureMark />
                          <Typography fontSize={14}>{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      component={Link}
                      to={
                        signedIn && offer.plan !== "free"
                          ? "/billing"
                          : primaryPath
                      }
                      variant={featured ? "contained" : "outlined"}
                      fullWidth
                      size="large"
                      sx={{ mt: "auto" }}
                    >
                      {signedIn
                        ? offer.plan === "free"
                          ? "Open Danto"
                          : `Choose ${offer.name}`
                        : offer.plan === "free"
                          ? "Start free"
                          : "Start 14-day trial"}
                    </Button>
                  </Box>
                );
              })}
            </Box>
            <Typography
              color="text.secondary"
              fontSize={14}
              textAlign="center"
              mt={3}
            >
              Cancel anytime from your billing page. Paid plans keep working
              until the end of the period you paid for.
            </Typography>
          </Container>
        </Box>

        {/* FAQ */}
        <Container maxWidth="md" id="faq" className="lp-section">
          <SectionIntro title="Questions, answered." copy="" />
          {faqs.map((faq) => (
            <Accordion
              key={faq.q}
              disableGutters
              elevation={0}
              className="lp-faq"
            >
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Typography component="h3" fontWeight={800} fontSize={18}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" lineHeight={1.7}>
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          <Typography color="text.secondary" mt={4}>
            Still have a question? Email{" "}
            <SupportLink className="lp-inline-link" />{" "}
            and a person will reply.
          </Typography>
        </Container>

        {/* Final CTA */}
        <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 } }}>
          <Box className="landing-final-cta lp-final">
            <Typography component="h2" className="lp-final-title">
              Send a link. Get the approval. Get paid sooner.
            </Typography>
            <Typography
              sx={{ color: "#b9b7af", mt: 2, maxWidth: 560, fontSize: 18 }}
            >
              Set up your first client portal in a few minutes. Your next client
              will notice the difference.
            </Typography>
            <Button
              component={Link}
              to={primaryPath}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRounded />}
              sx={{
                mt: 4,
                bgcolor: "var(--acid)",
                color: "var(--ink)",
                "&:hover": { bgcolor: "#e5ff94" },
              }}
            >
              {signedIn ? "Open your projects" : "Create your free portal"}
            </Button>
          </Box>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  );
}

function NavItem({ href, children }: { href: string; children: string }) {
  const props = href.startsWith("#") ? { href } : { to: href };
  return (
    <Typography
      component={href.startsWith("#") ? "a" : Link}
      {...props}
      className="lp-nav-link"
    >
      {children}
    </Typography>
  );
}

function SectionIntro({
  title,
  copy,
  dark = false,
  flush = false,
}: {
  title: string;
  copy: string;
  dark?: boolean;
  flush?: boolean;
}) {
  return (
    <Box sx={{ maxWidth: 820, mb: flush ? 0 : { xs: 4, md: 6 } }}>
      <Typography component="h2" className="lp-h2">
        {title}
      </Typography>
      {copy && (
        <Typography
          sx={{
            color: dark ? "#b9b7af" : "#625f58",
            fontSize: { xs: 16, md: 18 },
            lineHeight: 1.7,
            mt: 2,
            maxWidth: 680,
          }}
        >
          {copy}
        </Typography>
      )}
    </Box>
  );
}

function BentoTile({
  icon,
  title,
  copy,
  className = "",
  children,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Box className={`lp-tile ${className}`}>
      <Box className="value-icon">{icon}</Box>
      <Typography component="h3" variant="h5" mt={2.5}>
        {title}
      </Typography>
      <Typography sx={{ color: "#b9b7af", lineHeight: 1.7, mt: 1 }}>
        {copy}
      </Typography>
      {children && (
        <Box mt="auto" pt={3}>
          {children}
        </Box>
      )}
    </Box>
  );
}

function MarkCell({ mark, text }: { mark: Mark; text: string }) {
  const icon =
    mark === "yes" ? (
      <CheckRounded fontSize="small" />
    ) : mark === "partial" ? (
      <RemoveRounded fontSize="small" />
    ) : (
      <CloseRounded fontSize="small" />
    );
  const label = mark === "yes" ? "Yes" : mark === "partial" ? "Partly" : "No";
  return (
    <span className={`lp-mark ${mark}`}>
      <span className="lp-mark-icon" aria-label={label} role="img">
        {icon}
      </span>
      {text}
    </span>
  );
}

/**
 * The hero shows one project two ways: the freelancer's board and the
 * client's portal. Internal cards vanish in the client view, which is the
 * whole product in one glance.
 */
function HeroDemo() {
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState<"board" | "client">("board");
  const [approved, setApproved] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(() => {
      if (!touched.current) setView("client");
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  const choose = (next: "board" | "client") => {
    touched.current = true;
    setView(next);
  };

  return (
    <Box className="lp-demo">
      <Box className="lp-demo-switch" role="tablist" aria-label="Demo view">
        <span className={`lp-demo-thumb ${view}`} aria-hidden="true" />
        {(
          [
            ["board", "Your board"],
            ["client", "What your client sees"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => choose(value)}
          >
            {label}
          </button>
        ))}
      </Box>

      <Box className="lp-demo-stage">
        {/* Board view */}
        <Box
          className={`lp-demo-pane ${view === "board" ? "is-active" : ""}`}
          aria-hidden={view !== "board"}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1.5}
          >
            <Typography fontWeight={800}>
              Acme Co. · Website redesign
            </Typography>
            <span className="lp-pill small">3 members</span>
          </Stack>
          <Box className="lp-demo-columns">
            <DemoColumn title="To do">
              <DemoCard title="CMS setup" />
              <DemoCard title="Rates & margin sheet" internal />
            </DemoColumn>
            <DemoColumn title="Review">
              <DemoCard
                title="Homepage design, v2"
                tag={approved ? "Approved by client" : "Waiting on client"}
                tone={approved ? "green" : "amber"}
              />
            </DemoColumn>
            <DemoColumn title="Done">
              <DemoCard title="Sitemap & wireframes" done />
              <DemoCard title="Brand guidelines" done />
            </DemoColumn>
          </Box>
        </Box>

        {/* Client view */}
        <Box
          className={`lp-demo-pane client ${view === "client" ? "is-active" : ""}`}
          aria-hidden={view !== "client"}
        >
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box
              className="portal-monogram"
              sx={{ "--portal-accent": "#181817" } as never}
            >
              N
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontSize={12} color="text.secondary">
                Northwind Studio for Acme Co.
              </Typography>
              <Typography fontWeight={800} noWrap>
                Website redesign
              </Typography>
            </Box>
            <span className="lp-pill small live">Live</span>
          </Stack>
          <DemoStages approved={approved} />
          <Box className="lp-demo-approval">
            <span className={`lp-pill small ${approved ? "green" : "amber"}`}>
              {approved ? "Approved, thank you" : "Waiting on you"}
            </span>
            <Typography fontWeight={800} mt={1}>
              Homepage design, v2
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              New hero, pricing section and mobile navigation.
            </Typography>
            {!approved ? (
              <Stack direction="row" gap={1} mt={1.5}>
                <button
                  type="button"
                  className="lp-pill solid as-button"
                  onClick={() => setApproved(true)}
                  tabIndex={view === "client" ? 0 : -1}
                >
                  Approve
                </button>
                <span className="lp-pill">Request changes</span>
              </Stack>
            ) : (
              <button
                type="button"
                className="lp-demo-reset"
                onClick={() => setApproved(false)}
                tabIndex={view === "client" ? 0 : -1}
              >
                Reset demo
              </button>
            )}
          </Box>
          <Typography
            fontSize={12}
            color="text.secondary"
            mt={1.5}
            sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
          >
            <LockRounded sx={{ fontSize: 14 }} /> Your internal “Rates & margin
            sheet” card is hidden here.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

const stages = ["Discovery", "Design", "Build", "Launch"];

/** Client-side progress: a stage tracker in the client's brand colour. */
function DemoStages({ approved }: { approved: boolean }) {
  const current = approved ? 2 : 1;
  const percent = approved ? 72 : 48;
  return (
    <Box className="lp-demo-stages">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
      >
        <Typography fontSize={13} fontWeight={700} color="text.secondary">
          Project progress
        </Typography>
        <Typography fontSize={13} fontWeight={800}>
          {percent}% · {stages[current]} stage
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        className="lp-demo-bar"
        aria-label="Project progress"
      />
      <Box component="ol" className="lp-demo-stage-list">
        {stages.map((stage, index) => (
          <li
            key={stage}
            className={
              index < current ? "done" : index === current ? "current" : ""
            }
          >
            <span className="dot" aria-hidden="true">
              {index < current && <CheckRounded sx={{ fontSize: 11 }} />}
            </span>
            {stage}
          </li>
        ))}
      </Box>
    </Box>
  );
}

function DemoColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box className="lp-demo-column">
      <Typography fontSize={12} fontWeight={800} color="text.secondary" mb={1}>
        {title}
      </Typography>
      <Stack gap={1}>{children}</Stack>
    </Box>
  );
}

function DemoCard({
  title,
  internal,
  done,
  tag,
  tone,
}: {
  title: string;
  internal?: boolean;
  done?: boolean;
  tag?: string;
  tone?: "amber" | "green";
}) {
  return (
    <Box className={`lp-demo-card ${internal ? "internal" : ""}`}>
      <Typography
        fontSize={13}
        fontWeight={750}
        sx={{
          color: done ? "#77736b" : "inherit",
          textDecoration: done ? "line-through" : "none",
        }}
      >
        {title}
      </Typography>
      {internal && (
        <span className="lp-pill small dark">
          <LockRounded sx={{ fontSize: 12 }} /> Internal
        </span>
      )}
      {tag && <span className={`lp-pill small ${tone}`}>{tag}</span>}
    </Box>
  );
}

function SavingsCalculator() {
  const [clients, setClients] = useState(4);
  const [hours, setHours] = useState(1.5);
  const [rate, setRate] = useState(60);
  // Assumption shown to the visitor: a live portal and drafted updates cut
  // time spent on status work roughly in half.
  const savedHours = Math.round(clients * hours * 4.33 * 0.5);
  const value = savedHours * rate;
  const plan = clients <= 1 ? 0 : 19;

  return (
    <Box className="lp-calc">
      <Box>
        <Typography
          component="h2"
          className="lp-h2"
          sx={{ fontSize: { xs: 32, md: 44 } }}
        >
          What is status work costing you?
        </Typography>
        <Typography
          color="text.secondary"
          mt={1.5}
          lineHeight={1.7}
          maxWidth={520}
        >
          Move the sliders to match your week. We assume Danto cuts the time you
          spend on updates, check-ins and approval chasing by about half.
        </Typography>
        <Stack spacing={3} mt={4} maxWidth={520}>
          <CalcSlider
            label="Active clients"
            value={clients}
            display={`${clients}`}
            min={1}
            max={15}
            step={1}
            onChange={setClients}
          />
          <CalcSlider
            label="Hours per client each week on updates and check-ins"
            value={hours}
            display={`${hours} h`}
            min={0.5}
            max={4}
            step={0.5}
            onChange={setHours}
          />
          <CalcSlider
            label="Your hourly rate"
            value={rate}
            display={`$${rate}`}
            min={20}
            max={200}
            step={5}
            onChange={setRate}
          />
        </Stack>
      </Box>
      <Box className="lp-calc-result" aria-live="polite">
        <Typography sx={{ color: "#b9b7af" }}>
          You could get back about
        </Typography>
        <Typography className="lp-calc-number">{savedHours} hours</Typography>
        <Typography sx={{ color: "#b9b7af" }}>
          a month, worth roughly
        </Typography>
        <Typography className="lp-calc-number acid">
          ${value.toLocaleString("en-US")}
        </Typography>
        <Box className="lp-calc-divider" />
        <Typography sx={{ color: "#dcdad3" }}>
          {plan
            ? `Danto Pro costs $${plan} a month, or less on the yearly plan.`
            : "With one client, Danto is free."}
        </Typography>
      </Box>
    </Box>
  );
}

function CalcSlider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" gap={2}>
        <Typography fontWeight={700} fontSize={15}>
          {label}
        </Typography>
        <Typography
          fontWeight={800}
          fontSize={15}
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {display}
        </Typography>
      </Stack>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, next) => onChange(next as number)}
        aria-label={label}
        className="lp-slider"
      />
    </Box>
  );
}
