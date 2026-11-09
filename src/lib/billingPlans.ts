export const offers = [
  {
    plan: "free",
    name: "Free",
    price: 0,
    line: "For solo builders and students",
    features: [
      "1 workspace · 3 active boards",
      "Private solo workspace",
      "10 AI actions / month",
    ],
  },
  {
    plan: "pro",
    name: "Pro",
    price: 12,
    line: "For freelancers and small teams",
    features: [
      "5 workspaces · unlimited boards",
      "3 people total · full collaboration",
      "300 shared AI actions / month",
      "Priority email support",
    ],
  },
  {
    plan: "business",
    name: "Team",
    price: 39,
    line: "For agencies and startups",
    features: [
      "Unlimited workspaces and boards",
      "10 people total · account-wide",
      "1,500 shared AI actions / month",
      "Workspace Pulse AI briefing",
      "Full collaboration and tracking",
    ],
  },
] as const;
