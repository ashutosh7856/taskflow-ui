import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { List } from "../types";

/**
 * Board templates come from the API (GET /templates) so the backend owns the
 * stages, fields and wording. These types mirror trello-backend
 * src/lib/templates.ts.
 */
export type ListRole = "intake" | "active" | "review" | "done";

export type FieldType =
  "text" | "longtext" | "url" | "date" | "number" | "select" | "multiselect";

export type TemplateField = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  client?: boolean;
  onCard?: boolean;
};

export type FieldValue = string | number | string[];

export type BoardTemplate = {
  id: string;
  name: string;
  group: "client" | "team";
  description: string;
  cardNoun: string;
  helper: string;
  lists: Array<{ name: string; role: ListRole }>;
  labels: Array<{ name: string; color: string }>;
  categories: Array<{ value: string; label: string; checklist?: string[] }>;
  fields: TemplateField[];
  wording: {
    complete: string;
    completed: string;
    due: string;
    requestApproval: string;
    approve: string;
  };
};

/** Used until the catalog loads, and for unknown template ids. */
const fallback: BoardTemplate = {
  id: "blank",
  name: "Blank",
  group: "team",
  description: "Start from a clean board.",
  cardNoun: "task",
  helper: "Capture the outcome and the next action.",
  lists: [],
  labels: [],
  categories: [
    { value: "task", label: "Task" },
    { value: "milestone", label: "Milestone" },
    { value: "idea", label: "Idea" },
  ],
  fields: [],
  wording: {
    complete: "Mark complete",
    completed: "Completed",
    due: "Due date",
    requestApproval: "Request approval",
    approve: "Approve",
  },
};

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => (await api.get<BoardTemplate[]>("/templates")).data,
    staleTime: 60 * 60 * 1000,
  });
}

export type Workflow = BoardTemplate & {
  /** The board's finish list (e.g. "Published"), if it has one. */
  doneList?: Pick<List, "id" | "name">;
  /** Finish wording, taken from the board's own done list when present. */
  completeLabel: string;
  completedLabel: string;
};

export function resolveWorkflow(
  catalog: BoardTemplate[] | undefined,
  template: string | undefined,
  lists?: Array<Pick<List, "id" | "name" | "role">>,
): Workflow {
  const base =
    catalog?.find((item) => item.id === (template || "blank")) || fallback;
  const done = lists?.find((list) => list.role === "done");
  return {
    ...base,
    doneList: done ? { id: done.id, name: done.name } : undefined,
    completeLabel: done
      ? `Mark ${done.name.toLowerCase()}`
      : base.wording.complete,
    completedLabel: done ? done.name : base.wording.completed,
  };
}

/** Workflow for a board: its template plus its actual done list. */
export function useWorkflow(
  template: string | undefined,
  lists?: Array<Pick<List, "id" | "name" | "role">>,
) {
  const catalog = useTemplates();
  return resolveWorkflow(catalog.data, template, lists);
}

export function categoryLabel(workflow: Workflow, category: string) {
  return (
    workflow.categories.find((item) => item.value === category)?.label ||
    category
  );
}

/** Short text for a field value on a card tile or in the portal. */
export function formatFieldValue(
  field: Pick<TemplateField, "type">,
  value: FieldValue,
) {
  if (Array.isArray(value)) return value.join(", ");
  if (field.type === "date" && typeof value === "string")
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  if (field.type === "number" && typeof value === "number")
    return value.toLocaleString();
  return String(value);
}
