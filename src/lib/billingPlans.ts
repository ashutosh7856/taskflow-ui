export const offers = [
  {
    plan: "free",
    name: "Free",
    price: 0,
    line: "For getting organized",
    features: [
      "All owned workspaces",
      "3 team seats",
      "10 pooled AI actions / month",
    ],
  },
  {
    plan: "pro",
    name: "Pro",
    price: 12,
    line: "For teams that ship",
    features: [
      "All owned workspaces",
      "5 team seats",
      "100 pooled AI actions / month",
    ],
  },
  {
    plan: "business",
    name: "Business",
    price: 39,
    line: "For serious operations",
    features: [
      "All owned workspaces",
      "25 team seats",
      "500 pooled AI actions / month",
    ],
  },
] as const;
