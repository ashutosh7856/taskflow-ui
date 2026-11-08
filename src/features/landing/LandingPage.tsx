import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import ViewKanbanRounded from "@mui/icons-material/ViewKanbanRounded";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { AnimatedContent } from "../../components/bits/AnimatedContent";
import { SpotlightCard } from "../../components/bits/SpotlightCard";
import { offers } from "../../lib/billingPlans";
import { useAuthStore } from "../../store/auth";

const workflows = [
  {
    index: "01",
    name: "Developer delivery",
    copy: "Paste a PR description or commit log and let Danto extract shipped work, QA follow-ups, documentation, and release tasks.",
    stages: "Raw commits  →  Structured work  →  Release",
    color: "#d8ff63",
  },
  {
    index: "02",
    name: "Creator operations",
    copy: "Turn a rough content calendar into channel-aware creation, approval, repurposing, and publishing work.",
    stages: "Ideas  →  Create  →  Approve  →  Publish",
    color: "#ffd166",
  },
  {
    index: "03",
    name: "Meeting follow-through",
    copy: "Drop in messy meeting notes. Danto pulls out decisions, owners, deadlines, risks, and next actions.",
    stages: "Notes  →  Decisions  →  Owners  →  Done",
    color: "#ff8b73",
  },
  {
    index: "04",
    name: "Agency workspace pulse",
    copy: "Keep client deliverables, approvals, ownership, and stakeholder updates connected to the live work.",
    stages: "Intake  →  Produce  →  Approve  →  Report",
    color: "#b9dcff",
  },
];

const valuePoints = [
  {
    icon: <ViewKanbanRounded />,
    title: "Raw input becomes real work",
    copy: "Paste briefs, emails, notes, PRs, or commit logs. Danto converts them into a workflow-specific board you can review before applying.",
  },
  {
    icon: <GroupsRounded />,
    title: "The board stays honest",
    copy: "Completion is independent from list position. Deadlines, owners, labels, checklists, priorities, and overdue work stay visible.",
  },
  {
    icon: <AutoAwesomeRounded />,
    title: "AI acts on live context",
    copy: "Import meeting notes, PR or commit logs, creator plans, emails, and briefs—then generate updates grounded in the actual board.",
  },
  {
    icon: <InsightsRounded />,
    title: "Workspace Pulse shows the truth",
    copy: "Team owners see board health, assigned work, done, active, and delayed cards, plus exactly which board each assignment comes from.",
  },
];

export function LandingPage() {
  const signedIn = useAuthStore((state) => Boolean(state.accessToken));
  const primaryPath = signedIn ? "/app" : "/login?mode=register";

  return (
    <Box className="landing-page">
      <Box component="header" className="landing-nav">
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" minHeight={72} gap={2}>
            <Brand linked />
            <Stack
              direction="row"
              gap={3}
              sx={{ display: { xs: "none", md: "flex" }, ml: 4 }}
            >
              <NavLink href="#product">Product</NavLink>
              <NavLink href="#workflows">Workflows</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
            </Stack>
            <Box sx={{ flex: 1 }} />
            {!signedIn && (
              <Button
                component={Link}
                to="/login"
                color="inherit"
                sx={{
                  minWidth: 0,
                  px: { xs: 0.5, sm: 2 },
                  fontSize: { xs: 12, sm: 14 },
                  whiteSpace: "nowrap",
                }}
              >
                Sign in
              </Button>
            )}
            <Button
              component={Link}
              to={primaryPath}
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              sx={{
                minWidth: 0,
                px: { xs: 1.25, sm: 2.5 },
                whiteSpace: "nowrap",
                "& .MuiButton-endIcon": {
                  display: { xs: "none", sm: "inherit" },
                },
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                {signedIn ? "Open workspace" : "Start free"}
              </Box>
              <Box
                component="span"
                sx={{ display: { xs: "inline", sm: "none" } }}
              >
                {signedIn ? "Open" : "Start"}
              </Box>
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box component="main">
        <Container maxWidth="xl" className="landing-hero">
          <Box className="landing-hero-grid">
            <AnimatedContent>
              <Box>
                <Chip
                  label="20 AI actions included on Free"
                  sx={{ bgcolor: "#e9f7b9", fontWeight: 800, mb: 3 }}
                />
                <Typography
                  component="h1"
                  className="display-type"
                  sx={{
                    fontSize: { xs: 52, sm: 72, lg: 92 },
                    lineHeight: 0.93,
                    maxWidth: 850,
                  }}
                >
                  Turn messy input into{" "}
                  <Box component="span" className="landing-highlight">
                    organized action.
                  </Box>
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 17, md: 20 },
                    color: "#625f58",
                    lineHeight: 1.7,
                    maxWidth: 670,
                    mt: 3,
                  }}
                >
                  Danto is the AI-first task workspace that reads your notes,
                  emails, PRs, commits, and content plans—then builds the board,
                  follow-up work, and status update with you.
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
                    sx={{ minHeight: 54, px: 3 }}
                  >
                    {signedIn
                      ? "Go to your boards"
                      : "Create your free account"}
                  </Button>
                  <Button
                    component="a"
                    href="#product"
                    size="large"
                    sx={{ minHeight: 54 }}
                  >
                    See how it works
                  </Button>
                </Stack>
                <Stack
                  direction="row"
                  gap={{ xs: 2, sm: 4 }}
                  flexWrap="wrap"
                  mt={4}
                >
                  {["3 boards free", "20 AI actions", "No card required"].map(
                    (item) => (
                      <Stack
                        key={item}
                        direction="row"
                        gap={0.75}
                        alignItems="center"
                      >
                        <CheckCircleRounded
                          sx={{ color: "#638000", fontSize: 18 }}
                        />
                        <Typography fontSize={13} fontWeight={700}>
                          {item}
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>
              </Box>
            </AnimatedContent>

            <AnimatedContent delay={130}>
              <HeroBoard />
            </AnimatedContent>
          </Box>
        </Container>

        <Box className="landing-marquee" aria-label="Danto capabilities">
          <div>
            NOTES TO BOARD · PR AND COMMIT PARSING · CONTENT SCHEDULING · TRUE
            COMPLETION · EXECUTIVE UPDATES · LABELS · CHECKLISTS · DUE DATES ·
            NOTES TO BOARD · PR AND COMMIT PARSING · CONTENT SCHEDULING ·
          </div>
        </Box>

        <Container maxWidth="xl" id="workflows" className="landing-section">
          <AnimatedContent>
            <SectionIntro
              eyebrow="One input. A usable system."
              title="Stop translating work by hand."
              copy="A generic board waits for you to create every card. Danto starts with the material you already have and turns it into the right workflow for the job."
            />
          </AnimatedContent>
          <Box className="workflow-grid">
            {workflows.map((workflow, index) => (
              <AnimatedContent key={workflow.name} delay={index * 70}>
                <SpotlightCard className="workflow-card">
                  <Stack direction="row" justifyContent="space-between">
                    <Typography className="mono-label">
                      {workflow.index}
                    </Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: workflow.color,
                      }}
                    />
                  </Stack>
                  <Typography variant="h5" mt={4}>
                    {workflow.name}
                  </Typography>
                  <Typography color="text.secondary" mt={1} lineHeight={1.7}>
                    {workflow.copy}
                  </Typography>
                  <Typography
                    className="mono-label"
                    sx={{ mt: 4, color: "#77736b" }}
                  >
                    {workflow.stages}
                  </Typography>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </Box>
        </Container>

        <Box id="product" className="landing-dark-section">
          <Container maxWidth="xl">
            <AnimatedContent>
              <SectionIntro
                dark
                eyebrow="Why Danto"
                title="Not another board to maintain."
                copy="Danto helps create the work, coordinate it, and explain progress from one live source. The AI is part of the workflow—not a decorative chatbot beside it."
              />
            </AnimatedContent>
            <Box className="value-grid">
              {valuePoints.map((point, index) => (
                <AnimatedContent key={point.title} delay={index * 70}>
                  <Box className="value-card">
                    <Box className="value-icon">{point.icon}</Box>
                    <Typography variant="h5" mt={3}>
                      {point.title}
                    </Typography>
                    <Typography
                      sx={{ color: "#b9b7af", lineHeight: 1.75, mt: 1 }}
                    >
                      {point.copy}
                    </Typography>
                  </Box>
                </AnimatedContent>
              ))}
            </Box>
            <AnimatedContent>
              <Box className="ai-story">
                <Box>
                  <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
                    Autonomous task workspace
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ mt: 1, fontSize: { xs: 34, md: 50 } }}
                  >
                    From raw source to execution. From execution to a clean
                    update.
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  {[
                    "Parse meeting notes, email, PR descriptions, commits, briefs, and content plans",
                    "Create workflow-specific lists and actionable cards only after your review",
                    "Generate clean executive documents grounded in live completion and delivery data",
                  ].map((item, index) => (
                    <Stack
                      key={item}
                      direction="row"
                      gap={1.5}
                      alignItems="flex-start"
                    >
                      <Typography
                        className="mono-label"
                        sx={{ color: "#ff8b73", pt: 0.3 }}
                      >
                        0{index + 1}
                      </Typography>
                      <Typography>{item}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </AnimatedContent>
          </Container>
        </Box>

        <Container maxWidth="xl" id="pricing" className="landing-section">
          <AnimatedContent>
            <SectionIntro
              eyebrow="Simple pricing"
              title="Start free. Add capacity when the work grows."
              copy="Free and Pro are built for private solo work. Team unlocks collaboration across every workspace you own. PayPal handles checkout; Danto never stores your payment credentials."
            />
          </AnimatedContent>
          <Box className="landing-pricing-grid">
            {offers.map((offer, index) => (
              <AnimatedContent key={offer.plan} delay={index * 90}>
                <Box
                  className={`landing-price-card ${offer.plan === "pro" ? "featured" : ""}`}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography className="mono-label">{offer.name}</Typography>
                    {offer.plan === "pro" && (
                      <Chip label="Popular" size="small" />
                    )}
                  </Stack>
                  <Stack direction="row" alignItems="flex-end" mt={3}>
                    <Typography
                      className="display-type"
                      fontSize={58}
                      lineHeight={1}
                    >
                      ${offer.price}
                    </Typography>
                    <Typography color="text.secondary" mb={0.6}>
                      {offer.price ? " / month" : " forever"}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" mt={1}>
                    {offer.line}
                  </Typography>
                  <Stack spacing={1.25} my={3}>
                    {offer.features.map((feature) => (
                      <Stack key={feature} direction="row" gap={1}>
                        <CheckCircleRounded
                          sx={{ color: "#638000", fontSize: 19 }}
                        />
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
                    variant={offer.plan === "pro" ? "contained" : "outlined"}
                    fullWidth
                    sx={{ mt: "auto" }}
                  >
                    {signedIn
                      ? "Open billing"
                      : offer.plan === "free"
                        ? "Start free"
                        : `Start with ${offer.name}`}
                  </Button>
                </Box>
              </AnimatedContent>
            ))}
          </Box>
        </Container>

        <Container maxWidth="xl" sx={{ pb: { xs: 7, md: 12 } }}>
          <AnimatedContent>
            <Box className="landing-final-cta">
              <Typography className="mono-label" sx={{ color: "#d8ff63" }}>
                Your next project deserves a clear start
              </Typography>
              <Typography
                className="display-type"
                sx={{ fontSize: { xs: 42, md: 68 }, lineHeight: 0.98, mt: 2 }}
              >
                Make the work visible. Then make it move.
              </Typography>
              <Button
                component={Link}
                to={primaryPath}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRounded />}
                sx={{ mt: 4, bgcolor: "#d8ff63", color: "#181817" }}
              >
                {signedIn ? "Open Danto" : "Create your account"}
              </Button>
            </Box>
          </AnimatedContent>
        </Container>
      </Box>

      <Box component="footer" className="landing-footer">
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            alignItems={{ sm: "center" }}
          >
            <Brand />
            <Typography color="text.secondary" fontSize={13} sx={{ flex: 1 }}>
              © {new Date().getFullYear()} Danto. Turn input into action.
            </Typography>
            <Stack direction="row" gap={2}>
              <Typography
                component={Link}
                to="/privacy"
                color="text.secondary"
                fontSize={13}
              >
                Privacy
              </Typography>
              <Typography
                component={Link}
                to="/terms"
                color="text.secondary"
                fontSize={13}
              >
                Terms
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <Typography
      component="a"
      href={href}
      color="text.secondary"
      fontSize={14}
      fontWeight={700}
    >
      {children}
    </Typography>
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  dark?: boolean;
}) {
  return (
    <Box sx={{ maxWidth: 850, mb: { xs: 4, md: 6 } }}>
      <Typography
        className="mono-label"
        sx={{ color: dark ? "#d8ff63" : "#77736b" }}
      >
        {eyebrow}
      </Typography>
      <Typography
        className="display-type"
        sx={{ fontSize: { xs: 40, md: 60 }, lineHeight: 1, mt: 1.5 }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: dark ? "#b9b7af" : "#625f58",
          fontSize: { xs: 16, md: 18 },
          lineHeight: 1.7,
          mt: 2,
          maxWidth: 720,
        }}
      >
        {copy}
      </Typography>
    </Box>
  );
}

function HeroBoard() {
  const columns = [
    { name: "Ready", cards: ["Confirm launch scope", "Map customer journey"] },
    {
      name: "In progress",
      cards: ["Build onboarding flow", "Prepare release brief"],
    },
    { name: "Done", cards: ["Approve visual direction", "Connect analytics"] },
  ];
  return (
    <Box className="hero-board-shell">
      <Stack direction="row" alignItems="center" mb={2.5}>
        <Box>
          <Typography className="mono-label" color="text.secondary">
            Product launch
          </Typography>
          <Typography variant="h5">Customer portal</Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row">
          {["A", "M", "J"].map((letter, index) => (
            <Box
              key={letter}
              className="mock-avatar"
              sx={{ ml: index ? -0.7 : 0 }}
            >
              {letter}
            </Box>
          ))}
        </Stack>
      </Stack>
      <Box className="hero-board-columns">
        {columns.map((column, columnIndex) => (
          <Box key={column.name} className="hero-board-column">
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
              <Typography fontWeight={800} fontSize={13}>
                {column.name}
              </Typography>
              <Typography className="mono-label">
                0{column.cards.length}
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {column.cards.map((card, cardIndex) => (
                <Box key={card} className="hero-mock-card">
                  <Box
                    sx={{
                      width: 34 + cardIndex * 14,
                      height: 5,
                      borderRadius: 4,
                      bgcolor:
                        columnIndex === 2
                          ? "#86a82c"
                          : columnIndex === 1
                            ? "#ff8b73"
                            : "#7ba7d9",
                      mb: 1.2,
                    }}
                  />
                  <Typography fontSize={12.5} fontWeight={750}>
                    {card}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    mt={1.5}
                  >
                    <Typography className="mono-label" color="text.secondary">
                      {columnIndex === 2 ? "Complete" : "This week"}
                    </Typography>
                    {columnIndex === 2 && (
                      <CheckCircleRounded
                        sx={{ fontSize: 16, color: "#638000" }}
                      />
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
