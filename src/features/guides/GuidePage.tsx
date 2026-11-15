import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findGuide, guides, type Guide } from "../../content/guides";
import { PublicShell } from "../public/PublicPages";

export function GuidesIndexPage() {
  return (
    <PublicShell>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography className="mono-label" color="text.secondary">
          Guides
        </Typography>
        <Typography
          component="h1"
          className="display-type"
          sx={{
            fontSize: { xs: 40, md: 64 },
            lineHeight: 1,
            mt: 1.5,
            maxWidth: 860,
          }}
        >
          Better client communication, without the extra hours.
        </Typography>
        <Typography
          sx={{
            color: "#625f58",
            fontSize: 18,
            mt: 2,
            maxWidth: 680,
            lineHeight: 1.7,
          }}
        >
          Practical guides and copy-ready templates for freelancers and small
          agencies who want happier clients and fewer status emails.
        </Typography>
        <Box className="guide-grid">
          {guides.map((guide) => (
            <Box
              key={guide.slug}
              component={Link}
              to={`/guides/${guide.slug}`}
              className="guide-card"
            >
              <Typography className="mono-label" color="text.secondary">
                {guide.readMinutes} min read
              </Typography>
              <Typography component="h2" variant="h5" mt={1.5}>
                {guide.title}
              </Typography>
              <Typography color="text.secondary" mt={1} lineHeight={1.65}>
                {guide.description}
              </Typography>
              <Typography
                fontWeight={800}
                mt={2}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                Read guide <ArrowForwardRounded fontSize="small" />
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </PublicShell>
  );
}

export function GuidePage() {
  const { slug = "" } = useParams();
  const guide = findGuide(slug);
  if (!guide) return <Navigate to="/guides" replace />;
  const related = guides.filter((item) => item.slug !== guide.slug).slice(0, 3);
  return (
    <PublicShell>
      <Container
        maxWidth="md"
        component="article"
        sx={{ py: { xs: 5, md: 9 } }}
      >
        <Typography
          component="nav"
          aria-label="Breadcrumb"
          variant="body2"
          color="text.secondary"
        >
          <Link to="/guides" style={{ color: "inherit" }}>
            Guides
          </Link>{" "}
          / {guide.readMinutes} min read · Updated{" "}
          <time dateTime={guide.updated}>
            {new Date(`${guide.updated}T12:00:00Z`).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              },
            )}
          </time>
        </Typography>
        <Typography
          component="h1"
          className="display-type"
          sx={{ fontSize: { xs: 36, md: 54 }, lineHeight: 1.04, mt: 2 }}
        >
          {guide.title}
        </Typography>
        <Box className="guide-answer">
          <Typography className="mono-label" sx={{ color: "#4b5a12" }}>
            Short answer
          </Typography>
          <Typography sx={{ fontSize: 18, lineHeight: 1.7, mt: 1 }}>
            {guide.answer}
          </Typography>
        </Box>
        {guide.sections.map((section) => (
          <GuideSectionBlock key={section.heading} section={section} />
        ))}
        <Box className="guide-cta">
          <Typography variant="h5">
            Try it with your next client, free
          </Typography>
          <Typography sx={{ color: "#b9b7af", mt: 1, mb: 2.5 }}>
            Danto gives every client a live portal with one-click approvals and
            AI-written updates. One portal is free forever.
          </Typography>
          <Button
            component={Link}
            to={`/login?mode=register&ref=guide-${guide.slug}`}
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            sx={{
              bgcolor: "#d8ff63",
              color: "#181817",
              "&:hover": { bgcolor: "#e5ff94" },
            }}
          >
            Create your free client portal
          </Button>
        </Box>
        <Box component="section" mt={7}>
          <Typography component="h2" variant="h4">
            Frequently asked questions
          </Typography>
          {guide.faqs.map((faq) => (
            <Box key={faq.q} sx={{ mt: 3 }}>
              <Typography component="h3" variant="h6">
                {faq.q}
              </Typography>
              <Typography color="#44423d" lineHeight={1.75} mt={0.75}>
                {faq.a}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box component="aside" mt={8}>
          <Typography className="mono-label" color="text.secondary" mb={2}>
            Keep reading
          </Typography>
          <Stack gap={1.25}>
            {related.map((item) => (
              <Typography
                key={item.slug}
                component={Link}
                to={`/guides/${item.slug}`}
                fontWeight={800}
                sx={{ color: "#181817" }}
              >
                {item.title} →
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
    </PublicShell>
  );
}

function GuideSectionBlock({
  section,
}: {
  section: Guide["sections"][number];
}) {
  const ListTag = section.ordered ? "ol" : "ul";
  return (
    <Box component="section" mt={6}>
      <Typography
        component="h2"
        variant="h4"
        sx={{ fontSize: { xs: 26, md: 32 } }}
      >
        {section.heading}
      </Typography>
      {section.paragraphs?.map((paragraph) => (
        <Typography
          key={paragraph.slice(0, 40)}
          sx={{ fontSize: 17, lineHeight: 1.8, color: "#3e3b36", mt: 2 }}
        >
          {paragraph}
        </Typography>
      ))}
      {section.list && (
        <Box component={ListTag} className="guide-list">
          {section.list.map((item) => (
            <li key={item.slice(0, 40)}>{item}</li>
          ))}
        </Box>
      )}
      {section.template && (
        <TemplateBlock
          label={section.template.label}
          text={section.template.text}
        />
      )}
    </Box>
  );
}

function TemplateBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Box className="guide-template">
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography fontWeight={800} sx={{ flex: 1 }}>
          {label}
        </Typography>
        <Button
          size="small"
          startIcon={<ContentCopyRounded />}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`${label}\n\n${text}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              /* clipboard blocked */
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </Stack>
      <Box component="pre">{text}</Box>
    </Box>
  );
}
