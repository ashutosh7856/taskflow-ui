export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  /** A copy-ready block such as an email template. */
  template?: { label: string; text: string };
}

export interface Guide {
  slug: string;
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

export const guides: Guide[] = [
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
];

export function findGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
