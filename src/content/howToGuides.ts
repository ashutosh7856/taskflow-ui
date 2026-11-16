import type { Guide, GuideImage } from "./guides";

/**
 * Step-by-step "how to use Danto" guides, one per client-work template.
 * Screenshots are generated from demo data by tools/guide-screenshots
 * (run it again after UI changes so the pictures stay accurate).
 */
const UPDATED = "2026-11-17";

const approveHeights: Record<string, number> = {
  "social-media": 648,
  website: 564,
  "design-branding": 564,
  "video-production": 598,
  "content-writing": 564,
  photography: 598,
  "client-projects": 476,
};

function shots(folder: string) {
  const img = (
    file: string,
    width: number,
    height: number,
    alt: string,
    caption: string,
  ): GuideImage => ({
    src: `/guides/${folder}/${file}`,
    width,
    height,
    alt,
    caption,
  });
  return {
    board: (alt: string, caption: string) =>
      img("board.jpg", 1600, 900, alt, caption),
    card: (alt: string, caption: string) =>
      img("card.jpg", 900, 1188, alt, caption),
    portal: (alt: string, caption: string) =>
      img("portal.jpg", 1440, 900, alt, caption),
    approve: (alt: string, caption: string) =>
      img("approve.jpg", 600, approveHeights[folder], alt, caption),
  };
}

const newBoard = (template: string): GuideImage => ({
  src: "/guides/shared/new-board.jpg",
  width: 900,
  height: 836,
  alt: "Danto's Start a board dialog with client work and team templates",
  caption: `Pick “${template}” under Client work. The stages and card fields are listed before you create the board.`,
});

type TemplateGuide = {
  slug: string;
  folder: string;
  template: string;
  noun: string;
  plural: string;
  /** Who the guide is for, used in the title. */
  audience: string;
  description: string;
  answer: string;
  stages: string[];
  stagesIntro: string;
  boardImage: [string, string];
  fieldsIntro: string;
  fields: string[];
  cardImage: [string, string];
  sendLabel: string;
  approveLabel: string;
  doneList: string;
  completeLabel: string;
  portalIntro: string;
  portalImage: [string, string];
  approveImage: [string, string];
  checklists: string[];
  tips: string[];
  faqs: Array<{ q: string; a: string }>;
};

function templateGuide(t: TemplateGuide): Guide {
  const s = shots(t.folder);
  return {
    slug: t.slug,
    kind: "howto",
    title: `How to manage ${t.audience} in Danto`,
    description: t.description,
    answer: t.answer,
    readMinutes: 4,
    updated: UPDATED,
    sections: [
      {
        heading: `1. Create a ${t.template} board`,
        paragraphs: [
          `From your dashboard, click New board, name it after the client and project (for example “${t.boardImage[0].split(" board")[0]}”), choose ${t.template} and click Create board.`,
        ],
        images: [newBoard(t.template)],
      },
      {
        heading: "2. Know your stages",
        paragraphs: [t.stagesIntro],
        list: t.stages,
        ordered: true,
        images: [s.board(...t.boardImage)],
      },
      {
        heading: `3. Add ${t.plural} and fill in the details`,
        paragraphs: [
          `Click Add a card in any list. Choosing a type adds a starter checklist, and every card has a “${capitalize(t.noun)} details” section with fields made for this work. ${t.fieldsIntro}`,
        ],
        list: t.fields,
        images: [s.card(...t.cardImage)],
      },
      {
        heading: "4. Send it to your client for approval",
        paragraphs: [
          `When a ${t.noun} is ready, open it, keep “Visible to client” on and click ${t.sendLabel}. The card moves into the review stage and your client gets an email with a link. They don't need an account.`,
          t.portalIntro,
        ],
        images: [s.portal(...t.portalImage)],
      },
      {
        heading: "5. Your client approves or asks for changes",
        paragraphs: [
          `The client opens the ${t.noun}, sees the details you shared, and clicks ${t.approveLabel} or Request changes. Approving moves the card to the next stage for you. Requesting changes sends it back to your working stage with their comment, so nothing gets lost in email threads.`,
        ],
        images: [s.approve(...t.approveImage)],
      },
      {
        heading: `6. Finish with “${t.completeLabel}”`,
        paragraphs: [
          `Drag the card into ${t.doneList}, or tick ${t.completeLabel} in the card. Both do the same thing: the card counts as finished, and the client's progress bar moves. If you drag it back out, it's reopened.`,
        ],
      },
      {
        heading: "Starter checklists",
        paragraphs: [
          "These are added automatically when you pick the card type. Edit or delete steps freely, and your client sees progress (“3 of 5 steps done”) without seeing your internal notes.",
        ],
        list: t.checklists,
      },
      {
        heading: "Tips from people who do this work",
        list: t.tips,
      },
    ],
    faqs: [
      {
        q: "Will my client see everything on the board?",
        a: `No. Clients see only cards with “Visible to client” on, and only fields marked with the eye icon. Internal ${t.plural}, labels and comments stay private.`,
      },
      ...t.faqs,
    ],
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const howToGuides: Guide[] = [
  {
    slug: "getting-started",
    kind: "howto",
    title:
      "Getting started with Danto: from first board to first client approval",
    description:
      "Set up your first Danto board, pick the right template for your kind of work, share a client portal and get your first approval in about ten minutes.",
    answer:
      "Create a workspace, start a board from the template that matches your work (social media, website, design, video, writing, photography or general client work), add your cards, then turn on the client portal and send your first item for approval. Your client approves with one click, no account needed.",
    readMinutes: 3,
    updated: UPDATED,
    sections: [
      {
        heading: "1. Pick a template for the kind of work",
        paragraphs: [
          "Every template comes with its own stages, card fields, starter checklists and approval wording. A social media board has Ideas, Drafting, Client approval, Scheduled and Published, and posts have platform, caption and hashtag fields. A photography board tracks shoot dates, locations and proof galleries instead.",
        ],
        images: [newBoard("the template that fits")],
      },
      {
        heading: "2. Follow the guide for your template",
        list: [
          "Social media: posts, captions and a publishing calendar",
          "Website projects: pages, previews and launch",
          "Design & branding: proofs, revision rounds and final files",
          "Video production: rough cut, fine cut and delivery",
          "Content writing: briefs, drafts and published articles",
          "Photography: bookings, proof galleries and delivery",
          "Client projects: any other client work or retainer",
        ],
      },
      {
        heading: "3. Turn on the client portal",
        paragraphs: [
          "Open the board and click Client portal. Add the client's name and a short welcome message, then copy the link. Clients see progress, what's waiting on them and only the cards you mark as visible.",
        ],
      },
      {
        heading: "4. Send your first approval",
        paragraphs: [
          "Open a card that's ready, click the send-for-approval button and your client gets an email. When they approve, the card moves on by itself.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I change the stages a template gives me?",
        a: "Yes. Rename, add, reorder or delete lists like on any board. The finish list (Published, Delivered, Live…) keeps marking cards as finished even if you rename it.",
      },
      {
        q: "Do my clients need a Danto account?",
        a: "No. They open the portal link and approve with their name. Only you and your team need accounts.",
      },
    ],
  },
  templateGuide({
    slug: "social-media-content-calendar",
    folder: "social-media",
    template: "Social media",
    noun: "post",
    plural: "posts",
    audience: "a client's social media content calendar",
    description:
      "Plan, draft, get client approval on and publish social posts for a client in Danto, with captions, platforms and hashtags on every post.",
    answer:
      "Create a Social media board. Posts move from Ideas to Drafting, then to Client approval, where the client reads the caption and approves in one click. Approved posts move to Scheduled, and you mark them published when they go live.",
    stagesIntro:
      "Each post moves left to right. Client approval is the only stage the client acts in; everything else is your workflow.",
    stages: [
      "Ideas: post ideas and requests from the client",
      "Drafting: caption and visual in progress",
      "Client approval: waiting for the client to approve",
      "Scheduled: approved and queued in your publishing tool",
      "Published: live. Add the post link for your records",
    ],
    boardImage: [
      "Bloom Café · Instagram board with posts in each stage",
      "Platforms show on every card, so you can see the mix at a glance.",
    ],
    fieldsIntro: "Fields with the eye icon are shown to the client.",
    fields: [
      "Platforms: Instagram, TikTok, LinkedIn and more",
      "Caption: the exact text that will be posted",
      "Visual / asset link: Canva, Figma or Drive link",
      "Hashtags",
      "Live post link: added after publishing",
      "Publish date: the card's date, shown on the board",
    ],
    cardImage: [
      "A social post card with platforms, caption and hashtags",
      "“Mark published” replaces the generic complete checkbox on social boards.",
    ],
    sendLabel: "Send post for approval",
    approveLabel: "Approve post",
    doneList: "Published",
    completeLabel: "Mark published",
    portalIntro:
      "In the portal, posts waiting on the client sit at the top, with their platforms. The Published counter shows how much of the plan is live.",
    portalImage: [
      "Client portal for Bloom Café showing a post waiting for review",
      "What your client sees: what needs their review first, then everything else by stage.",
    ],
    approveImage: [
      "Client approving a social post with its caption and hashtags shown",
      "The client reads the real caption and hashtags before approving.",
    ],
    checklists: [
      "Feed post: caption written, visual ready, hashtags and tags added, alt text written, scheduled",
      "Reel / short video: hook and script, footage ready, edited with captions, cover image, scheduled",
      "Carousel: slide copy, slides designed, caption written, scheduled",
    ],
    tips: [
      "Batch approvals: send a week of posts at once so the client reviews in one sitting.",
      "Put the exact caption in the Caption field, not a summary. Clients approve what they read.",
      "Use the Evergreen label for posts you can reuse when the calendar has a gap.",
    ],
    faqs: [
      {
        q: "Does Danto publish to Instagram or TikTok for me?",
        a: "No. Keep using your scheduler (Meta Business Suite, Buffer, Later…). Danto handles planning and client approval, and Scheduled is where approved posts wait.",
      },
    ],
  }),
  templateGuide({
    slug: "website-project-management",
    folder: "website",
    template: "Website project",
    noun: "page",
    plural: "pages",
    audience: "a client website project",
    description:
      "Run a client website build page by page in Danto: discovery, design, build, client review and launch, with preview links the client can approve.",
    answer:
      "Create a Website project board and add one card per page or feature. Cards move through Discovery & content, Design and Build. When a page is ready, send it for client review with its preview link. Approved pages go Live.",
    stagesIntro:
      "Treat each page as its own card. Clients sign off page by page instead of approving the whole site at the end, when changes cost the most.",
    stages: [
      "Discovery & content: content, photos and copy you need from the client",
      "Design: mockups in Figma or similar",
      "Build: development on staging",
      "Client review: the client checks the preview link",
      "Live: launched",
    ],
    boardImage: [
      "Northwind Dental · New website board with pages in each stage",
      "Page URLs show on cards. “Needs content” flags pages blocked on the client.",
    ],
    fieldsIntro: "The client sees all three fields in the portal.",
    fields: [
      "Preview link: staging URL for the page",
      "Design link: the Figma or mockup file",
      "Page URL: for example /about",
    ],
    cardImage: [
      "A website page card with preview, design and page URL fields",
      "Open-link buttons sit next to every link field.",
    ],
    sendLabel: "Send for client review",
    approveLabel: "Approve",
    doneList: "Live",
    completeLabel: "Mark live",
    portalIntro:
      "The portal shows every page and where it is, so the client can see the whole site come together without asking.",
    portalImage: [
      "Client portal for Northwind Dental showing a page waiting for review",
      "Pages waiting on the client sit at the top.",
    ],
    approveImage: [
      "Client approving a website page with its preview link",
      "The client clicks through to the preview link, then approves or asks for changes.",
    ],
    checklists: [
      "Page: content received, design approved, built and responsive, SEO title and meta description, tested on mobile and desktop",
      "Launch: domain and SSL, redirects from old URLs, analytics, forms tested, favicon and social preview image, speed check, backups",
    ],
    tips: [
      "Add a Launch card early. Its checklist catches the things that get forgotten on launch day.",
      "Use the Needs content label and keep those cards visible, so the client sees what's blocked on them.",
      "Ask for approval on the design before the build, not after.",
    ],
    faqs: [
      {
        q: "Should I make a card per page or per task?",
        a: "Per page works best for client review, because the client approves pages. Use the Feature / integration and Fix types for work that isn't a page.",
      },
    ],
  }),
  templateGuide({
    slug: "design-approval-workflow",
    folder: "design-branding",
    template: "Design & branding",
    noun: "design",
    plural: "designs",
    audience: "design and branding projects",
    description:
      "Get logo and design proofs approved faster in Danto: send proofs, track revision rounds and file formats, and deliver final files.",
    answer:
      "Create a Design & branding board. Designs move from Brief to Designing, then to Client review with a proof link and revision round. Approved designs go to Final files, and you mark them delivered when the files are sent.",
    stagesIntro:
      "Revision rounds are tracked on every card, so it's clear when a request is an extra round.",
    stages: [
      "Brief: what the client asked for, with a moodboard",
      "Designing: concepts and revisions",
      "Client review: proof sent, waiting for approval",
      "Final files: approved; exporting the final formats",
      "Delivered: files sent to the client",
    ],
    boardImage: [
      "Fern & Co · Brand identity board with designs in each stage",
      "The revision round shows on each card.",
    ],
    fieldsIntro: "Every field is visible to the client.",
    fields: [
      "Proof link: Figma prototype, PDF or image",
      "Revision round: Concepts, 1st revision, 2nd revision, Final",
      "File formats: SVG, PNG, PDF, AI and more",
      "Size / dimensions: for example 1080×1350 or A4",
    ],
    cardImage: [
      "A logo design card waiting for client approval",
      "While approval is pending, you can withdraw the request.",
    ],
    sendLabel: "Send proof for approval",
    approveLabel: "Approve design",
    doneList: "Delivered",
    completeLabel: "Mark delivered",
    portalIntro:
      "The portal shows the revision round right on the card, so the client knows where things stand.",
    portalImage: [
      "Client portal for Fern & Co showing a logo waiting for review",
      "What the client sees when a proof is waiting.",
    ],
    approveImage: [
      "Client approving a logo proof with its revision round shown",
      "The proof link, round and formats are shown before the client decides.",
    ],
    checklists: [
      "Logo: brief and moodboard agreed, initial concepts, chosen concept refined, colour/mono/reversed versions, exported SVG, PNG and PDF",
      "Brand identity: logo approved, colour palette, typography, brand guidelines, final file pack delivered",
    ],
    tips: [
      "Write the number of included rounds in your contract, then use the Extra round label when a client goes past it.",
      "Send one proof per card so feedback stays attached to the right design.",
    ],
    faqs: [
      {
        q: "Can the client comment on a design without approving?",
        a: "Yes. They can leave a comment, approve or request changes. Requesting changes moves the card back to Designing.",
      },
    ],
  }),
  templateGuide({
    slug: "video-production-workflow",
    folder: "video-production",
    template: "Video production",
    noun: "video",
    plural: "videos",
    audience: "video editing and production for clients",
    description:
      "Manage client video projects in Danto: brief and script, footage, rough and fine cuts, client review with a review link, and delivery.",
    answer:
      "Create a Video production board. Videos move from Brief & script to Footage in and Editing, then to Client review with a review link and cut stage (rough, fine, final). Approved videos are delivered with a final files link.",
    stagesIntro:
      "The Cut field tells the client what kind of feedback you need: structure on a rough cut, details on a fine cut.",
    stages: [
      "Brief & script",
      "Footage in: waiting on or receiving footage",
      "Editing",
      "Client review: the client watches the cut",
      "Delivered: final exports sent",
    ],
    boardImage: [
      "Kite Running Club · YouTube board with videos in each stage",
      "Cut stage and formats show on every card.",
    ],
    fieldsIntro: "All fields can be shown to the client.",
    fields: [
      "Cut: Rough cut, Fine cut, Final",
      "Review link: Frame.io, Vimeo or Drive link",
      "Formats: 16:9, 9:16, 1:1, 4:5",
      "Target length",
      "Final files link",
    ],
    cardImage: [
      "A video card in editing with cut stage and review link",
      "Delivery date replaces the generic due date on video boards.",
    ],
    sendLabel: "Send cut for approval",
    approveLabel: "Approve cut",
    doneList: "Delivered",
    completeLabel: "Mark delivered",
    portalIntro:
      "Clients see which cut is waiting on them and which formats they'll get.",
    portalImage: [
      "Client portal for Kite Running Club showing a cut waiting for review",
      "Cut stage and formats show on the review card.",
    ],
    approveImage: [
      "Client approving a video cut with its review link",
      "The client opens the review link, then approves the cut or requests changes.",
    ],
    checklists: [
      "Video: footage and assets received, rough cut, music and sound, colour grade, captions, final export",
      "Short / reel: hook in the first 3 seconds, edit, burned-in captions, vertical export",
    ],
    tips: [
      "Ask for approval at rough cut. Structural changes after the fine cut cost the most time.",
      "Use Waiting on footage so the client sees a delay is on their side.",
      "Keep timestamped notes in your review tool and a summary in the card comment.",
    ],
    faqs: [
      {
        q: "Can I upload the video to Danto?",
        a: "You can attach files to cards, but for review we recommend a link to Frame.io, Vimeo or Drive in the Review link field, so the client can stream it at full quality.",
      },
    ],
  }),
  templateGuide({
    slug: "content-writing-workflow",
    folder: "content-writing",
    template: "Content writing",
    noun: "piece",
    plural: "pieces",
    audience: "content writing for clients",
    description:
      "Manage blog posts and client writing in Danto: briefs with target keywords, drafts, client approval, publishing and published URLs.",
    answer:
      "Create a Content writing board. Pieces move from Topics & briefs to Writing, then to Client review with a draft link, keyword and word count. Approved pieces are Ready to publish and end in Published with their live URL.",
    stagesIntro:
      "Agree the brief and keyword before writing. The card keeps them in front of you and the client.",
    stages: [
      "Topics & briefs: topic, keyword and angle",
      "Writing",
      "Client review: draft sent for approval",
      "Ready to publish: approved, waiting to go live",
      "Published",
    ],
    boardImage: [
      "Ledgerly · Blog content board with pieces in each stage",
      "Target keyword and word count show on the cards.",
    ],
    fieldsIntro: "The client sees all four fields.",
    fields: [
      "Target keyword",
      "Word count",
      "Draft link: Google Docs or similar",
      "Published URL",
    ],
    cardImage: [
      "A blog post card with keyword, word count and draft link",
      "The blog post checklist covers editing, metadata and internal links.",
    ],
    sendLabel: "Send draft for approval",
    approveLabel: "Approve draft",
    doneList: "Published",
    completeLabel: "Mark published",
    portalIntro:
      "Clients see the keyword and length you agreed on, right on the draft waiting for them.",
    portalImage: [
      "Client portal for Ledgerly showing a draft waiting for review",
      "Drafts waiting on the client come first.",
    ],
    approveImage: [
      "Client approving a blog draft with keyword, word count and draft link",
      "The client opens the draft link, then approves or requests changes.",
    ],
    checklists: [
      "Blog post: brief and keyword confirmed, outline approved, draft written, edited and proofread, meta title and description, images and alt text, internal links",
    ],
    tips: [
      "Get the outline approved first. It's the cheapest point to change direction.",
      "Use the Refresh label for updates to existing posts.",
      "Add the Published URL once it's live. It's proof of work for renewals.",
    ],
    faqs: [
      {
        q: "Can the client edit the draft in Danto?",
        a: "Edits stay in your Google Doc (or other editor). Danto holds the link, the approval and the conversation around it.",
      },
    ],
  }),
  templateGuide({
    slug: "photography-client-workflow",
    folder: "photography",
    template: "Photography",
    noun: "shoot",
    plural: "shoots",
    audience: "photography clients from inquiry to delivery",
    description:
      "Track photography shoots in Danto from inquiry to booked shoot, editing, proof gallery selection and final delivery, with dates and locations.",
    answer:
      "Create a Photography board. Shoots move from Inquiries to Booked and Editing, then to Proofs with client, where the client approves their selection from your gallery link. Delivered shoots record how many images were sent.",
    stagesIntro:
      "Labels track the business side (contract signed, deposit paid), and stages track the work.",
    stages: [
      "Inquiries",
      "Booked: contract and deposit done",
      "Editing: culling and editing",
      "Proofs with client: the client chooses from the gallery",
      "Delivered",
    ],
    boardImage: [
      "Harbour Hotel · Spring shoots board with shoots in each stage",
      "Shoot dates show on every card.",
    ],
    fieldsIntro: "The client sees all five fields.",
    fields: [
      "Shoot date",
      "Location",
      "Package: for example Half day · 40 edited images",
      "Gallery link: Pic-Time, Pixieset or similar",
      "Images delivered",
    ],
    cardImage: [
      "A booked shoot card with date, location and package",
      "The session checklist starts at contract and ends at gallery delivery.",
    ],
    sendLabel: "Send proofs for selection",
    approveLabel: "Approve selection",
    doneList: "Delivered",
    completeLabel: "Mark delivered",
    portalIntro:
      "Clients see upcoming shoots with dates and locations, and which galleries need their selection.",
    portalImage: [
      "Client portal for Harbour Hotel showing proofs waiting for selection",
      "Proof galleries waiting on the client sit at the top.",
    ],
    approveImage: [
      "Client approving a photo selection with gallery link and shoot details",
      "The client makes their picks in your gallery, then approves the selection here.",
    ],
    checklists: [
      "Session: contract signed, deposit paid, questionnaire and shot list, shoot done and backed up, culled, edited, gallery delivered",
    ],
    tips: [
      "Don't move a card to Booked until the Contract signed and Deposit paid labels are on.",
      "Use Rush for shoots with a faster delivery promise, so they stand out on the board.",
    ],
    faqs: [
      {
        q: "Does Danto host my gallery?",
        a: "No. Keep your gallery tool. Danto links to it, tracks the selection approval and keeps the client updated.",
      },
    ],
  }),
  templateGuide({
    slug: "client-project-management",
    folder: "client-projects",
    template: "Client project",
    noun: "deliverable",
    plural: "deliverables",
    audience: "any client project or retainer",
    description:
      "Use Danto's Client project template for retainers and general client work: requests, work in progress, client review and done.",
    answer:
      "Create a Client project board. Requests come in, move to In progress, then to Client review with a preview link and revision round. Approved deliverables are Done. Use it for retainers or any work that doesn't fit a specialist template.",
    stagesIntro:
      "Four simple stages that fit almost any client work. Clients can also submit requests from the portal.",
    stages: [
      "Requests: new asks, including ones the client submits in the portal",
      "In progress",
      "Client review",
      "Done",
    ],
    boardImage: [
      "Acme Co · Monthly retainer board with deliverables in each stage",
      "Requests, work in progress, review and done at a glance.",
    ],
    fieldsIntro: "Both fields are visible to the client.",
    fields: ["Preview / file link", "Revision round: 1st, 2nd, 3rd, Final"],
    cardImage: [
      "A deliverable card with preview link and revision round",
      "The revision round shows on the card tile too.",
    ],
    sendLabel: "Send for client approval",
    approveLabel: "Approve",
    doneList: "Done",
    completeLabel: "Mark done",
    portalIntro:
      "Clients see what's waiting on them, overall progress and a Submit a request button, so new asks land on your board instead of in email.",
    portalImage: [
      "Client portal for Acme Co showing a deliverable waiting for review",
      "The client's view of the retainer.",
    ],
    approveImage: [
      "Client approving a deliverable with its file link and revision round",
      "One click to approve, or a comment and Request changes.",
    ],
    checklists: [
      "Add your own: open a card, click Add in Checklists, and reuse it on similar cards.",
    ],
    tips: [
      "Share the portal link in your email signature for retainer clients.",
      "Use Waiting on client so slow feedback is visible, without awkward reminders.",
    ],
    faqs: [
      {
        q: "When should I use a specialist template instead?",
        a: "If most of your cards are posts, pages, designs, videos, articles or shoots, the matching template gives you better fields and wording. Client project is the flexible default.",
      },
    ],
  }),
];
