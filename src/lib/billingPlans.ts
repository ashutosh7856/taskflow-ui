export const offers = [
  {
    plan: "free",
    name: "Free",
    price: 0,
    line: "For solo builders and students",
    features: [
      "1 workspace · 3 active boards",
      "Private solo workspace",
      "20 AI actions / month",
    ],
  },
  {
    plan: "pro",
    name: "Pro",
    price: 9,
    line: "For freelancers and power users",
    features: [
      "5 workspaces · unlimited boards",
      "Private solo workspaces",
      "500 AI actions / month",
      "Priority email support",
    ],
  },
  {
    plan: "business",
    name: "Team",
    price: 24,
    line: "For agencies and startups",
    features: [
      "Unlimited workspaces and boards",
      "25 unique team members",
      "Unlimited monthly structured AI · fair use",
      "Workspace Pulse AI briefing",
      "Full collaboration and tracking",
    ],
  },
] as const;
