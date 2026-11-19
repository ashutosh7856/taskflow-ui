import type { PublicPortal, PublicPortalCard } from "../../types";

/**
 * The public demo at /demo: a sample client portal anyone can click through.
 * Everything happens in the browser; nothing is saved or sent.
 */
export const DEMO_TOKEN = "demo";

const day = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * day).toISOString();
const ahead = (days: number) => new Date(Date.now() + days * day).toISOString();

function card(
  id: string,
  title: string,
  extra: Partial<PublicPortalCard> = {},
): PublicPortalCard {
  return {
    id,
    title,
    description: null,
    category: "General",
    dueDate: null,
    isCompleted: false,
    completedAt: null,
    approvalStatus: "none",
    approvalRequestedAt: null,
    waitingOnClient: null,
    delayReason: null,
    checklist: { done: 0, total: 0 },
    feedback: [],
    ...extra,
  };
}

export function demoPortal(): PublicPortal {
  const lists: PublicPortal["lists"] = [
    {
      id: "l-requests",
      name: "Requests",
      // Empty so the progress bar shows "In progress" as the current stage;
      // visitors can try "Send a request" to add one.
      cards: [],
    },
    {
      id: "l-progress",
      name: "In progress",
      cards: [
        card("c-menu", "Online menu page", {
          description: "Menu with prices, dietary tags and the seasonal specials block.",
          dueDate: ahead(4),
          checklist: { done: 3, total: 5 },
          waitingOnClient: "The new winter menu prices (a photo of the board is fine)",
        }),
        card("c-booking", "Table booking form", {
          dueDate: ahead(9),
          checklist: { done: 1, total: 4 },
        }),
      ],
    },
    {
      id: "l-review",
      name: "Client review",
      cards: [
        card("c-home", "Homepage design", {
          description:
            "New homepage with the warm photo header, opening hours up top and a 'Book a table' button.",
          dueDate: ahead(1),
          approvalStatus: "pending",
          approvalRequestedAt: ago(0.2),
          checklist: { done: 6, total: 6 },
        }),
        card("c-logo", "Logo refresh", {
          description: "Cleaner wordmark and a round badge for cups and social.",
          approvalStatus: "pending",
          approvalRequestedAt: ago(1),
          checklist: { done: 4, total: 4 },
        }),
      ],
    },
    {
      id: "l-done",
      name: "Done",
      cards: [
        card("c-brief", "Project brief & sitemap", {
          isCompleted: true,
          completedAt: ago(12),
          approvalStatus: "approved",
          feedback: [
            {
              id: "f-brief",
              kind: "approved",
              authorName: "Maya",
              message: "Approved",
              createdAt: ago(12),
            },
          ],
        }),
        card("c-colors", "Colours & fonts", {
          isCompleted: true,
          completedAt: ago(8),
          approvalStatus: "approved",
          feedback: [
            {
              id: "f-colors",
              kind: "changes_requested",
              authorName: "Maya",
              message: "Can the green be a little warmer?",
              createdAt: ago(10),
            },
            {
              id: "f-colors-2",
              kind: "approved",
              authorName: "Maya",
              message: "Perfect, love it",
              createdAt: ago(8),
            },
          ],
        }),
        card("c-photos", "Photo shoot plan", { isCompleted: true, completedAt: ago(5) }),
      ],
    },
  ];
  return withStats({
    board: {
      name: "Harbor Coffee website",
      clientName: "Maya",
      welcome:
        "Hi Maya! Everything for the new website lives here. Check progress any time, and approve designs when they're ready.",
      allowRequests: true,
      updatedAt: ago(0.05),
    },
    brand: { name: "Northline Studio", color: "#1f5f4a", logoUrl: null, showBadge: true },
    stats: { total: 0, completed: 0, awaitingApproval: 0, overdue: 0 },
    lists,
    requests: [],
  });
}

function withStats(data: PublicPortal): PublicPortal {
  const cards = data.lists.flatMap((list) => list.cards);
  return {
    ...data,
    stats: {
      total: cards.length,
      completed: cards.filter((c) => c.isCompleted).length,
      awaitingApproval: cards.filter((c) => c.approvalStatus === "pending").length,
      overdue: 0,
    },
  };
}

/** Same rules as the real portal: approve moves on, changes go back to work. */
export function demoRespond(
  data: PublicPortal,
  cardId: string,
  kind: "approved" | "changes_requested" | "comment",
  authorName: string,
  message: string,
): PublicPortal {
  const entry = {
    id: `f-${Date.now()}`,
    kind,
    authorName: authorName || "Maya",
    message: message || "Approved",
    createdAt: new Date().toISOString(),
  };
  let moved: PublicPortalCard | null = null;
  const lists = data.lists.map((list) => ({
    ...list,
    cards: list.cards.flatMap((c) => {
      if (c.id !== cardId) return [c];
      const next = { ...c, feedback: [...c.feedback, entry] };
      if (kind === "comment") {
        // A reply to "we need…" counts as sent.
        return [{ ...next, waitingOnClient: null }];
      }
      moved = {
        ...next,
        approvalStatus: kind,
        ...(kind === "approved"
          ? { isCompleted: true, completedAt: entry.createdAt }
          : {}),
      };
      return [];
    }),
  }));
  if (moved) {
    const target = kind === "approved" ? "l-done" : "l-progress";
    const list = lists.find((l) => l.id === target)!;
    list.cards = kind === "approved" ? [moved, ...list.cards] : [...list.cards, moved];
  }
  return withStats({ ...data, lists, board: { ...data.board, updatedAt: entry.createdAt } });
}

export function demoRequest(
  data: PublicPortal,
  authorName: string,
  title: string,
  details: string,
): PublicPortal {
  const now = new Date().toISOString();
  const lists = data.lists.map((list, index) =>
    index === 0
      ? {
          ...list,
          cards: [
            ...list.cards,
            card(`c-req-${Date.now()}`, title, { description: details || null }),
          ],
        }
      : list,
  );
  return withStats({
    ...data,
    lists,
    requests: [
      { id: `r-${Date.now()}`, authorName: authorName || "Maya", message: title, createdAt: now },
      ...data.requests,
    ],
  });
}
