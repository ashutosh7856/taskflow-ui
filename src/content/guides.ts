import { howToGuides } from "./howToGuides";

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  /** A copy-ready block such as an email template. */
  template?: { label: string; text: string };
  /** Screenshots from public/guides/…, shown after the text. */
  images?: GuideImage[];
}

export interface GuideImage {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface Guide {
  slug: string;
  /** "howto" guides explain how to use Danto; others are articles. */
  kind?: "howto";
  title: string;
  /** Meta description, ~150 characters. */
  description: string;
  /** Direct 2–3 sentence answer shown first (what answer engines quote). */
  answer: string;
  readMinutes: number;
  updated: string;
  sections: GuideSection[];
  faqs: Array<{ q: string; a: string }>;
}

const articles: Guide[] = [
  {
    slug: "share-trello-board-with-clients",
    title:
      "How to share a Trello board with clients without exposing your internal work",
    description:
      "Sharing your Trello board with a client exposes internal notes, rates and other clients. Here are three safer ways to show clients progress, including a free client portal.",
    answer:
      "You can invite a client to a Trello board as a guest, but they'll see every card, comment and label on it, plus Trello's interface and branding. The safer options are a separate client-facing board you keep in sync, or a client portal that shows only the cards you choose and lets the client approve work without an account.",
    readMinutes: 6,
    updated: "2026-11-15",
    sections: [
      {
        heading: "What happens when you share a Trello board with a client?",
        paragraphs: [
          "When you add a client as a board guest, they get the same view you have. That includes internal comments (“client is slow again”), rough estimates, labels like “unpaid”, cards for other work and every half-finished idea in the backlog.",
          "They also need a Trello account, and many clients simply won't create one. The ones who do often get lost in an interface built for the people doing the work, not the people waiting on it.",
        ],
      },
      {
        heading: "Option 1: Create a separate client board",
        paragraphs: [
          "Keep your real board private and create a second, simplified board for the client with three lists: In progress, Waiting on you and Done. Move cards across by hand once or twice a week.",
          "It works, but it doubles your admin. The client board drifts out of date the first busy week, and an out-of-date board is worse than none: it tells the client nothing is happening.",
        ],
      },
      {
        heading: "Option 2: Send a weekly screenshot or summary",
        paragraphs: [
          "Many freelancers screenshot the board or paste a summary into email every Friday. It's low-tech and clients like it, but it's one-way. Approvals still happen in reply threads, and feedback is scattered across email, chat and calls.",
        ],
      },
      {
        heading: "Option 3: Use a client portal on top of your board",
        paragraphs: [
          "A client portal is a read-only, client-friendly view of the same board you already work from. You decide which cards are visible; internal cards stay private. The client opens a link, sees overall progress and what's waiting on them, and approves deliverables with one click.",
          "Because it reads from your real board, it never goes stale, and you don't maintain anything twice.",
        ],
        list: [
          "No client account or login required",
          "Internal cards, notes and rates stay hidden",
          "One-click approvals with a timestamped record",
          "Clients submit new requests that land on your board, not in your DMs",
          "Your logo and colours instead of someone else's brand",
        ],
      },
      {
        heading: "How to set up a client portal in Danto (about 2 minutes)",
        ordered: true,
        list: [
          "Create a board with the Client project template (Requests → In progress → Ready for review → Done), or import your Trello cards.",
          "Mark anything private as Internal from the card's Client panel.",
          "Click Share with client, add the client's name and email, and press Publish portal.",
          "Send the link. When a deliverable is ready, press Request approval on the card and the client gets a one-click email.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can a Trello guest see other boards in my workspace?",
        a: "A board guest only sees the boards they're invited to, but they see everything on those boards, including comments, labels, attachments and archived cards they can search for.",
      },
      {
        q: "Is there a free way to share project progress with clients?",
        a: "Yes. Danto's Free plan includes one live client portal forever, with approvals and client requests, which is enough to try it with your next client.",
      },
      {
        q: "Do my clients need to install anything?",
        a: "No. A client portal is a private web link that works on any phone or computer without an account.",
      },
    ],
  },
  {
    slug: "client-status-update-email-template",
    title: "Weekly client status update email: 5 templates for freelancers",
    description:
      "Copy-ready weekly status update email templates for freelancers and agencies: on track, waiting on client, delayed, launch week, and the one-line update.",
    answer:
      "A good client status update covers three things in under 200 words: what was completed, what's next, and what you need from the client, with a date attached. Send it on the same day every week so clients stop asking for updates in between.",
    readMinutes: 7,
    updated: "2026-11-15",
    sections: [
      {
        heading: "What should a weekly client update include?",
        list: [
          "Done this week: 2–4 concrete outcomes, not activities (“Homepage design approved”, not “worked on homepage”).",
          "Next up: what the client will see next and roughly when.",
          "Waiting on you: any approval, content or decision you need, with a deadline.",
          "Overall status in one word: on track, at risk or blocked.",
        ],
        paragraphs: [
          "Keep it short enough to read on a phone. If something needs a long explanation, link to it instead.",
        ],
      },
      {
        heading: "Template 1: On track",
        template: {
          label: "Subject: [Project] update: on track for [date]",
          text: "Hi [Name],\n\nQuick update on [Project]. We're on track for [milestone date].\n\nDone this week\n• [Outcome 1]\n• [Outcome 2]\n\nNext up\n• [Next deliverable], expected [day]\n\nNothing needed from you this week.\n\nThanks,\n[Your name]",
        },
      },
      {
        heading: "Template 2: Waiting on the client",
        template: {
          label: "Subject: [Project]: 1 thing needed from you by [day]",
          text: "Hi [Name],\n\nWe've finished [deliverable] and it's ready for your review: [link].\n\nTo keep the [date] launch on schedule, could you approve it or send changes by [day]?\n\nAlso done this week\n• [Outcome]\n\nThanks!\n[Your name]",
        },
      },
      {
        heading: "Template 3: Running late",
        template: {
          label: "Subject: [Project] update: new date for [milestone]",
          text: "Hi [Name],\n\nA heads-up: [milestone] will land on [new date] instead of [old date] because [one-line reason].\n\nWhat we're doing about it\n• [Action]\n\nEverything else is on track. Happy to jump on a quick call if useful.\n\n[Your name]",
        },
      },
      {
        heading: "Template 4: Launch week",
        template: {
          label: "Subject: [Project] launches [day]: final checklist",
          text: "Hi [Name],\n\nWe're in launch week!\n\nReady\n• [Item]\n• [Item]\n\nStill to do\n• [Item], [owner], [day]\n\nFrom you\n• Final sign-off on [item] by [day]\n\n[Your name]",
        },
      },
      {
        heading: "Template 5: The one-liner",
        template: {
          label: "Subject: [Project]: all good",
          text: "Hi [Name], quick one: [deliverable] is done, [next deliverable] is next and due [day]. Nothing needed from you. Live progress is always here: [portal link].",
        },
      },
      {
        heading: "How to write status updates in 30 seconds",
        paragraphs: [
          "If your work already lives on a board, the update is mostly written: completed cards are “done”, cards in progress are “next”, and cards awaiting approval are “waiting on you”.",
          "Danto's AI client update does exactly that. It reads only the cards visible to the client, drafts a friendly, formal or brief email, and lets you edit before sending from your own branded template.",
        ],
      },
    ],
    faqs: [
      {
        q: "How often should freelancers send client updates?",
        a: "Weekly works for most projects. Pick a fixed day, such as Friday, so clients know when to expect it. Daily updates are only worth it during launches or emergencies.",
      },
      {
        q: "How long should a client status update be?",
        a: "Under 200 words. Clients skim on their phones; if they need detail, link to a live project page instead of writing more.",
      },
      {
        q: "Should I send an update when nothing happened?",
        a: "Yes. A short note saying what's next and that nothing is needed from them prevents “any update?” emails and builds trust.",
      },
    ],
  },
  {
    slug: "client-approval-process",
    title:
      "How to get client approvals faster (and keep a record that stops scope creep)",
    description:
      "A simple client approval process for freelancers: one deliverable per request, a clear deadline, one-click sign-off and a timestamped record you can point to later.",
    answer:
      "Client approvals stall when the request is vague, buried in a long email, or needs a login. Ask for one approval at a time, include a deadline and the consequence of missing it, make approving a single click, and keep a timestamped record of every sign-off.",
    readMinutes: 6,
    updated: "2026-11-15",
    sections: [
      {
        heading: "Why do client approvals take so long?",
        list: [
          "The ask is hidden in paragraph four of a long email.",
          "Several things need approval at once, so the client waits until they have time for all of them.",
          "There's no deadline, so it's never urgent.",
          "Approving means downloading files, logging in somewhere, or writing a reply.",
        ],
      },
      {
        heading: "A 4-step approval process that works",
        ordered: true,
        list: [
          "One deliverable per request. “Approve the homepage design” gets answered; “thoughts on the latest batch?” doesn't.",
          "Give a date and the reason: “by Thursday so development can start Monday.”",
          "Make approval one click, with “request changes” as the only alternative. Open-ended feedback rounds are where scope creep starts.",
          "Record it: what was approved, by whom and when. Point back to it when “one small change” arrives three weeks later.",
        ],
      },
      {
        heading: "How do you prove a client approved something?",
        paragraphs: [
          "An email reply saying “looks good” technically counts, but it's hard to find later and easy to dispute. A dedicated approval record, with the deliverable, the person and a timestamp, is much stronger and takes no extra work if your tools capture it automatically.",
        ],
      },
      {
        heading: "How Danto handles approvals",
        paragraphs: [
          "Press Request approval on any card. Your client gets an email in your branding with a single Review and approve button that opens the portal without an account. They approve or request changes; you get notified, the card shows the status, and the approval is logged with their name and time.",
        ],
      },
    ],
    faqs: [
      {
        q: "What's the difference between an approval and feedback?",
        a: "An approval is a yes/no decision on a specific deliverable. Feedback is open-ended. Ask for approvals and only accept feedback as a “request changes” response, so every round has a clear outcome.",
      },
      {
        q: "How many revision rounds should a freelancer include?",
        a: "Two is the common default. Writing it into your proposal and tracking each “changes requested” makes extra rounds easy to identify and bill.",
      },
      {
        q: "Can clients approve work from their phone?",
        a: "Yes. Danto approval emails and portals are mobile-friendly and need no app or account.",
      },
    ],
  },
  {
    slug: "client-portal-for-freelancers",
    title: "What is a client portal, and does a freelancer need one?",
    description:
      "A client portal is a private page where clients see project progress, approve work and send requests. Here's when freelancers need one and what to look for.",
    answer:
      "A client portal is a private web page where a client can check project progress, approve deliverables and submit requests without emailing you. Freelancers with three or more active clients, or clients who often ask for updates, usually save several hours a week by using one.",
    readMinutes: 5,
    updated: "2026-11-15",
    sections: [
      {
        heading: "What does a client portal do?",
        list: [
          "Shows live progress: what's done, in progress and coming next",
          "Collects approvals on deliverables, with a record of who approved what",
          "Takes in new requests so they don't get lost in chat",
          "Presents your work under your brand",
        ],
      },
      {
        heading: "Do freelancers really need a client portal?",
        paragraphs: [
          "Not always. With one client and a weekly call, email is fine. A portal starts paying off when you juggle several clients, when approvals regularly hold up your work, or when you spend more than an hour a week writing updates.",
          "It also changes how clients see you: a branded project page signals an organised business, which makes higher rates easier to justify.",
        ],
      },
      {
        heading: "What to look for in a client portal",
        list: [
          "No client login. Every extra step lowers how often clients actually use it.",
          "It updates from the tool you already work in, so you never maintain two systems.",
          "Private internal items, so notes and rates never leak.",
          "One-click approvals and a request form.",
          "Your branding.",
          "Fair pricing: you shouldn't need a $50+/month all-in-one suite just to share progress.",
        ],
      },
      {
        heading: "Client portal vs. all-in-one freelance software",
        paragraphs: [
          "All-in-one platforms bundle proposals, contracts, invoicing, time tracking and portals. They're powerful but expensive and ask you to move your whole business. If you already invoice elsewhere and mainly need clients to see progress and approve work, a focused portal on top of your project board is simpler and cheaper.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is there a free client portal for freelancers?",
        a: "Danto includes one live client portal free forever, with approvals and client requests. Paid plans start at $19/month for unlimited portals and custom branding.",
      },
      {
        q: "Is a client portal secure?",
        a: "A good portal uses a long, unguessable private link, shows only items you mark as visible, and lets you replace the link at any time so old links stop working.",
      },
      {
        q: "Can I use my own logo on the portal?",
        a: "Yes. On Danto Pro you can add your logo, business name and accent colour, and Team removes Danto branding entirely.",
      },
    ],
  },
  {
    slug: "stop-clients-asking-for-updates",
    title: "How to stop clients asking “any update?”",
    description:
      "Clients ask for updates when they can't see progress. Five habits that stop “just checking in” emails, plus how a live client portal removes them for good.",
    answer:
      "Clients ask “any update?” when they can't see progress and don't know when they'll next hear from you. Set a fixed update day, make progress visible at all times through a shared link, and tell clients exactly what you need from them and when.",
    readMinutes: 4,
    updated: "2026-11-15",
    sections: [
      {
        heading: "Why clients keep checking in",
        paragraphs: [
          "It's rarely impatience. Usually the client has their own boss asking them for a status, and they have nothing to say. Every “just checking in” email is a client trying to answer someone else's question.",
        ],
      },
      {
        heading: "5 habits that stop update requests",
        ordered: true,
        list: [
          "Set an update rhythm on day one: “You'll hear from me every Friday.”",
          "Give clients a live view they can check anytime, so they can answer their boss without asking you.",
          "Always end an update with what you need from them, and by when.",
          "Flag delays early, before the client notices.",
          "Acknowledge requests within a business day, even if the work comes later.",
        ],
      },
      {
        heading: "What a live project link changes",
        paragraphs: [
          "When a client can open a link and see that the homepage is approved, the CMS is in progress and one item is waiting on them, there's nothing left to ask. Most freelancers who share a live portal see check-in emails drop to near zero within a couple of weeks.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I politely tell a client to stop asking for updates?",
        a: "Don't tell them to stop. Give them a better source: “To save you waiting on me, here's a live link that always shows where things stand, and I'll send a summary every Friday.”",
      },
      {
        q: "What if the client never opens the portal?",
        a: "Keep sending your weekly update with the portal link at the bottom. Approval requests are emailed directly, so the client can act without remembering the link.",
      },
    ],
  },
  {
    slug: "best-client-portal-software-for-freelancers",
    title: "Best client portal software for freelancers in 2026 (honest comparison)",
    description:
      "Danto, Copilot, Plutio, SuiteDash, HoneyBook and Moxie compared for freelancers: what each client portal does well, what it costs and who it's for.",
    answer:
      "If you want a full back office (invoices, contracts, CRM) with a portal included, look at Plutio, SuiteDash, HoneyBook or Moxie. If you want a polished portal for a larger agency, Copilot is strong but starts around $39–59 a month. If you mainly need clients to see progress and approve work without logging in, Danto is the simplest option and is free for your first client.",
    readMinutes: 7,
    updated: "2026-11-19",
    sections: [
      {
        heading: "First decide what you actually need",
        paragraphs: [
          "Client portal tools fall into two groups. All-in-one freelancer suites bundle proposals, contracts, invoicing and scheduling, with a portal as one feature. Focused portals do one job: give each client a page with progress, approvals and requests.",
          "If you already invoice in another tool and your real problem is “any update?” emails and approvals buried in threads, a suite means moving your whole business for one feature. If you're starting from zero and want everything in one place, a suite can make sense.",
        ],
      },
      {
        heading: "The tools compared",
        paragraphs: [
          "Prices below are the entry prices listed publicly at the time of writing (November 2026). They change often, so check each vendor's pricing page before you decide.",
        ],
        list: [
          "Danto: focused client portal. Free for one client, Pro $19/month for unlimited portals and your branding, Team $49/month white-label. Clients don't log in. Includes one-click approvals, client requests and an AI-written weekly update. No invoicing or contracts.",
          "Copilot (now also sold as Assembly): polished portal for agencies and firms, with messaging, files and billing. Listed from about $39–59/month; custom domains and full white-label sit on higher plans. No free plan.",
          "Plutio: all-in-one suite (projects, proposals, invoices, portal). Listed from $19/month. Good if you want one tool for everything; more to set up.",
          "SuiteDash: all-in-one with white-label portals and CRM, listed from $19/month. Very capable; reviewers often mention a steep learning curve.",
          "HoneyBook: client flow and payments suite, popular with US creatives. Listed from about $36/month. Strong for bookings, contracts and invoices.",
          "Moxie: freelancer suite with a low starting price, but the client portal is on its Pro plan (about $25/month).",
        ],
      },
      {
        heading: "Which one should you pick?",
        list: [
          "You want progress, approvals and requests, and already invoice elsewhere: Danto.",
          "You run an agency and want messaging, files and billing in one branded portal: Copilot.",
          "You want one tool for proposals, contracts, invoices and projects: Plutio, SuiteDash or HoneyBook.",
          "You're on a tight budget and need invoicing more than a portal: Moxie's Starter plan.",
        ],
      },
      {
        heading: "What matters most for clients",
        paragraphs: [
          "Whatever you choose, the portal only works if clients open it. The biggest drop-off is a login: every account a client has to create makes them less likely to look. The second is clutter: clients want to see what's done, what's next and what needs them, not your whole project tool.",
          "You can see the client view of Danto without signing up at danto.app/demo.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the cheapest client portal for freelancers?",
        a: "Danto is free for one client portal, including approvals and requests. Among paid tools, Danto Pro, Plutio and SuiteDash start around $19/month.",
      },
      {
        q: "Do my clients need an account?",
        a: "In Danto, no: clients open a private link. Many suites and portals ask clients to log in, which is worth checking before you choose.",
      },
      {
        q: "Can I use a client portal with my existing invoicing tool?",
        a: "Yes. A focused portal like Danto doesn't replace invoicing, so you keep Stripe, QuickBooks, Wave or whatever you use today.",
      },
    ],
  },
  {
    slug: "copilot-client-portal-alternative",
    title: "A simpler, cheaper Copilot alternative for freelancers",
    description:
      "Copilot (Assembly) is a strong client portal for agencies, but freelancers often need less. How Danto compares on price, setup, branding and client experience.",
    answer:
      "Copilot is a full client platform for agencies and firms, with listed plans starting around $39–59 a month and custom domains on higher tiers. Freelancers who mainly need clients to see progress and approve work can use Danto instead: it's free for one client, $19/month for unlimited portals with your branding, and clients don't need to log in.",
    readMinutes: 4,
    updated: "2026-11-19",
    sections: [
      {
        heading: "Where Copilot is the better choice",
        list: [
          "You want client messaging, file sharing, contracts and billing inside one portal.",
          "You have many team members and want per-client permissions and integrations.",
          "Your clients expect to log in to a full client app.",
        ],
      },
      {
        heading: "Where Danto is the better choice",
        list: [
          "You're a freelancer or small studio and want to stop “any update?” emails.",
          "You want clients to open a link on their phone and tap Approve, with no account.",
          "You already work in a project board and don't want a second system.",
          "You want your branding without paying for a top tier: branding is on Danto Pro ($19/month).",
          "You want a free start: your first client portal is free, with no time limit.",
        ],
      },
      {
        heading: "Side by side",
        list: [
          "Free plan: Danto yes (1 client). Copilot no (trial only).",
          "Entry price: Danto $19/month. Copilot listed at about $39–59/month.",
          "Client login: Danto none, a private link. Copilot clients sign in to the portal.",
          "Approvals: both. Danto approvals are one tap with a timestamped record.",
          "Invoicing and contracts: Copilot yes. Danto no; keep your current tool.",
          "Setup: Danto takes minutes from a template or a pasted brief.",
        ],
        paragraphs: [
          "Copilot prices are from public listings in November 2026 and may have changed. Check copilot.com for current plans.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Copilot the same as Assembly?",
        a: "Copilot's client portal has also been marketed under the name Assembly. Check their site for the current product name and plans.",
      },
      {
        q: "Can I move from Copilot to Danto?",
        a: "Yes. Create a board per client (or paste a project brief and let AI set it up), mark which items the client should see, and send the new link.",
      },
    ],
  },
  {
    slug: "client-portal-without-honeybook-or-dubsado",
    title: "Need a client portal but not HoneyBook or Dubsado?",
    description:
      "HoneyBook and Dubsado are full business suites. If you only need clients to see progress and approve work, here's a lighter option that works with your current invoicing.",
    answer:
      "HoneyBook and Dubsado are built around bookings, contracts and payments, and the client portal is one part of a larger system that takes time to set up. If you already handle invoices elsewhere and just need clients to follow progress and approve deliverables, a focused portal such as Danto is faster to set up and free for your first client.",
    readMinutes: 4,
    updated: "2026-11-19",
    sections: [
      {
        heading: "When a full suite is worth it",
        paragraphs: [
          "If you want lead forms, proposals, contracts, invoices and scheduling to run as one automated flow, HoneyBook and Dubsado are good at that. Their portals make the most sense when the client is already going through that flow.",
        ],
      },
      {
        heading: "When it's more than you need",
        list: [
          "You already invoice with Stripe, PayPal, QuickBooks or Wave and don't want to switch.",
          "Your pain is during the project: updates, approvals and feedback, not booking.",
          "You don't want to spend a weekend building workflows.",
          "You work with clients outside the US, where some suite features matter less.",
        ],
      },
      {
        heading: "What a focused portal gives you",
        list: [
          "A page per client showing what's done, in progress and next.",
          "One-tap approvals with a timestamped record, so “I never approved that” doesn't happen.",
          "A request button, so new asks land on your board instead of in your DMs.",
          "An AI-written weekly update you can send every Friday.",
          "Your logo and colours, and no login for clients.",
        ],
        paragraphs: [
          "See what a client sees at danto.app/demo. No signup needed.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use Danto alongside HoneyBook or Dubsado?",
        a: "Yes. Some freelancers keep a suite for contracts and invoices and use Danto for the project itself, because clients find the progress page simpler.",
      },
      {
        q: "How much does Danto cost?",
        a: "One client portal is free forever. Pro is $19/month (or $190/year) for unlimited portals, branding and AI updates. Team is $49/month with white-label and 10 seats.",
      },
    ],
  },
];

export const guides: Guide[] = [...howToGuides, ...articles];

export function findGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
