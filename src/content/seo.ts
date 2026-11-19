import { faqs } from "./faqs";
import { findGuide, guides } from "./guides";
import { SOCIALS } from "./socials";

export const SITE = "https://danto.app";
export const SITE_NAME = "Danto";
const OG_IMAGE = `${SITE}/og.png`;

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Array<Record<string, unknown>>;
}

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: SITE_NAME,
  url: SITE,
  logo: `${SITE}/assets/danto-mark.png`,
  email: "support@danto.app",
  sameAs: SOCIALS.map((s) => s.url),
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: SITE_NAME,
  url: SITE,
  publisher: { "@id": `${SITE}/#organization` },
};

const software = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Danto",
  url: SITE,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Client portal and project board for freelancers and small agencies: live progress, one-click client approvals, request intake and AI-written status updates.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    {
      "@type": "Offer",
      name: "Pro",
      price: "19",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "19",
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
    },
    {
      "@type": "Offer",
      name: "Team",
      price: "49",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "49",
        priceCurrency: "USD",
        billingDuration: "P1M",
      },
    },
  ],
  publisher: { "@id": `${SITE}/#organization` },
};

const faqPage = (items: Array<{ q: string; a: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});

const breadcrumbs = (items: Array<[string, string]>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: `${SITE}${path}`,
  })),
});

const staticPages: Record<string, Omit<PageMeta, "path">> = {
  "/": {
    title: "Danto: Client portal & approvals for freelancers and agencies",
    description:
      "Give every client a live, branded portal. Clients see progress, approve work in one click and send requests, and AI drafts your weekly status update. Start free.",
    jsonLd: [organization, website, software, faqPage(faqs)],
  },
  "/pricing": {
    title: "Pricing · Danto client portals",
    description:
      "Free for one client portal. Pro is $19/month for unlimited portals, your branding and AI client updates. Team is $49/month with white-label portals and 10 seats.",
    jsonLd: [
      software,
      breadcrumbs([
        ["Home", "/"],
        ["Pricing", "/pricing"],
      ]),
    ],
  },
  "/guides": {
    title: "Client communication guides for freelancers · Danto",
    description:
      "Practical guides and templates for freelancers and agencies: client status updates, faster approvals, sharing progress, and stopping “any update?” emails.",
    jsonLd: [
      breadcrumbs([
        ["Home", "/"],
        ["Guides", "/guides"],
      ]),
    ],
  },
  "/about": {
    title: "About Danto",
    description:
      "Danto is a client portal and project board for freelancers and small agencies, built so clients always know where their project stands.",
  },
  "/contact": {
    title: "Contact Danto support",
    description:
      "Reach the Danto team at support@danto.app. We reply within two business days.",
  },
  "/security": {
    title: "Security at Danto",
    description:
      "How Danto protects accounts, client portals, payments and AI usage.",
  },
  "/privacy": {
    title: "Privacy Policy · Danto",
    description: "How Danto collects, uses and protects your data.",
  },
  "/terms": {
    title: "Terms of Service · Danto",
    description: "The terms that govern your use of Danto.",
  },
  "/refund-policy": {
    title: "Refund Policy · Danto",
    description: "When and how Danto refunds subscription payments.",
  },
  "/cancellation-policy": {
    title: "Cancellation Policy · Danto",
    description: "How to cancel your Danto subscription and what happens next.",
  },
  "/delivery-policy": {
    title: "Delivery Policy · Danto",
    description: "How paid Danto plans are activated after purchase.",
  },
  "/acceptable-use": {
    title: "Acceptable Use Policy · Danto",
    description: "What you can and can't do with Danto.",
  },
  "/cookies": {
    title: "Cookie Policy · Danto",
    description: "How Danto uses cookies and local storage.",
  },
  "/login": {
    title: "Sign in · Danto",
    description: "Sign in to Danto or create your free account.",
  },
  "/forgot-password": {
    title: "Reset your password · Danto",
    description: "Reset your Danto password with a one-time code.",
    noindex: true,
  },
};

/** Every public, indexable path: used for prerendering and the sitemap. */
export const indexablePaths = [
  ...Object.entries(staticPages)
    .filter(([path, meta]) => !meta.noindex && path !== "/login")
    .map(([path]) => path),
  ...guides.map((guide) => `/guides/${guide.slug}`),
];

export function metaFor(path: string): PageMeta {
  const clean = path.split("?")[0].replace(/\/$/, "") || "/";
  if (clean.startsWith("/guides/")) {
    const guide = findGuide(clean.slice("/guides/".length));
    if (guide)
      return {
        path: clean,
        type: "article",
        title: `${guide.title} · Danto`,
        description: guide.description,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            datePublished: guide.updated,
            dateModified: guide.updated,
            mainEntityOfPage: `${SITE}${clean}`,
            image: OG_IMAGE,
            author: { "@id": `${SITE}/#organization` },
            publisher: { "@id": `${SITE}/#organization` },
          },
          faqPage(guide.faqs),
          breadcrumbs([
            ["Home", "/"],
            ["Guides", "/guides"],
            [guide.title, clean],
          ]),
        ],
      };
  }
  const known = staticPages[clean];
  if (known) return { path: clean, ...known };
  // App screens and client portals are private: never index them.
  return {
    path: clean,
    title: clean.startsWith("/p/") ? "Project portal" : "Danto",
    description: staticPages["/"].description,
    noindex: true,
  };
}

/** Head tags for the prerenderer (server) as an HTML string. */
export function headTags(meta: PageMeta) {
  const esc = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const url = `${SITE}${meta.path === "/" ? "" : meta.path}`;
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    meta.noindex
      ? `<meta name="robots" content="noindex, nofollow" />`
      : `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${meta.type || "website"}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    ...(meta.jsonLd || []).map(
      (data) =>
        `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`,
    ),
  ].join("\n    ");
}

/** Keeps title/description/canonical/robots in sync during client navigation. */
export function applyMeta(path: string) {
  if (typeof document === "undefined") return;
  const meta = metaFor(path);
  document.title = meta.title;
  const set = (
    selector: string,
    attr: string,
    value: string,
    create: () => HTMLElement,
  ) => {
    let node = document.head.querySelector(selector);
    if (!node) {
      node = create();
      document.head.appendChild(node);
    }
    node.setAttribute(attr, value);
  };
  const metaTag = (key: string, name: string) => () => {
    const node = document.createElement("meta");
    node.setAttribute(key, name);
    return node;
  };
  set(
    'meta[name="description"]',
    "content",
    meta.description,
    metaTag("name", "description"),
  );
  set(
    'meta[name="robots"]',
    "content",
    meta.noindex ? "noindex, nofollow" : "index, follow",
    metaTag("name", "robots"),
  );
  set(
    'meta[property="og:title"]',
    "content",
    meta.title,
    metaTag("property", "og:title"),
  );
  set(
    'meta[property="og:description"]',
    "content",
    meta.description,
    metaTag("property", "og:description"),
  );
  set(
    'link[rel="canonical"]',
    "href",
    `${SITE}${meta.path === "/" ? "" : meta.path}`,
    () => {
      const node = document.createElement("link");
      node.setAttribute("rel", "canonical");
      return node;
    },
  );
}
