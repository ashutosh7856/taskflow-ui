import type { Board } from "../types";

export type BoardTemplate = Board["template"];

export const workflowConfig: Record<
  BoardTemplate,
  {
    name: string;
    cardNoun: string;
    helper: string;
    categories: Array<{ value: string; label: string }>;
  }
> = {
  blank: {
    name: "Flexible",
    cardNoun: "task",
    helper: "Capture the outcome and the next action.",
    categories: [
      { value: "task", label: "Task" },
      { value: "milestone", label: "Milestone" },
      { value: "idea", label: "Idea" },
    ],
  },
  software: {
    name: "Software",
    cardNoun: "work item",
    helper: "Add enough context for engineering, review, and QA.",
    categories: [
      { value: "feature", label: "Feature" },
      { value: "bug", label: "Bug" },
      { value: "chore", label: "Chore" },
      { value: "spike", label: "Research spike" },
    ],
  },
  marketing: {
    name: "Marketing",
    cardNoun: "deliverable",
    helper: "Define the channel, audience, owner, and publish date.",
    categories: [
      { value: "campaign", label: "Campaign" },
      { value: "content", label: "Content" },
      { value: "social", label: "Social post" },
      { value: "email", label: "Email" },
      { value: "experiment", label: "Experiment" },
    ],
  },
  operations: {
    name: "Operations",
    cardNoun: "request",
    helper: "Capture impact, urgency, owner, and resolution target.",
    categories: [
      { value: "request", label: "Request" },
      { value: "incident", label: "Incident" },
      { value: "process", label: "Process improvement" },
      { value: "maintenance", label: "Maintenance" },
    ],
  },
};

export function boardWorkflow(template?: string) {
  return (
    workflowConfig[(template || "blank") as BoardTemplate] ||
    workflowConfig.blank
  );
}

export function categoryLabel(template: string | undefined, category: string) {
  return (
    boardWorkflow(template).categories.find((item) => item.value === category)
      ?.label || category
  );
}
