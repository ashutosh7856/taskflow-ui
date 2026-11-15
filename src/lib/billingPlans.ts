export const offers = [
  {
    plan: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    line: "Try it with your next client",
    features: [
      "1 live client portal",
      "One-click approvals & client requests",
      "3 boards · AI project planner",
      "10 AI actions / month",
    ],
  },
  {
    plan: "pro",
    name: "Pro",
    price: 19,
    yearlyPrice: 190,
    line: "For freelancers with several clients",
    features: [
      "Unlimited client portals",
      "Your logo, name & colors",
      "AI weekly client updates, sent from Danto",
      "Approval emails to clients",
      "3 teammates · unlimited boards",
      "300 AI actions / month",
    ],
  },
  {
    plan: "business",
    name: "Team",
    price: 49,
    yearlyPrice: 490,
    line: "For studios and small agencies",
    features: [
      "Everything in Pro",
      "White-label portals (no Danto badge)",
      "10 teammates across all workspaces",
      "Workspace Pulse: every client at a glance",
      "1,500 AI actions / month",
      "Priority support",
    ],
  },
] as const;

export type BillingInterval = "month" | "year";

/** Price shown per month for the chosen interval (yearly is billed upfront). */
export function displayPrice(
  offer: { price: number; yearlyPrice: number },
  interval: BillingInterval,
) {
  if (!offer.price) return { amount: 0, suffix: "forever", note: "" };
  if (interval === "year") {
    const monthly = offer.yearlyPrice / 12;
    return {
      amount: Number.isInteger(monthly) ? monthly : Number(monthly.toFixed(2)),
      suffix: "/ month",
      note: `$${offer.yearlyPrice} billed yearly · save $${offer.price * 12 - offer.yearlyPrice}`,
    };
  }
  return { amount: offer.price, suffix: "/ month", note: "Billed monthly" };
}
