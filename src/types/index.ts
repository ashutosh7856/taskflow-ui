export type Role = "owner" | "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  role?: Role;
  createdAt: string;
  boards?: Board[];
  members?: Membership[];
  plan?: "free" | "pro" | "business";
  billingStatus?: "inactive" | "active" | "past_due" | "cancelled";
}

export interface Membership {
  id?: string;
  userId: string;
  role: Role;
  user?: User;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  backgroundColor: string;
  template: "blank" | "software" | "marketing" | "operations";
  createdAt?: string;
  role?: Role;
  lists?: List[];
  labels?: Label[];
  members?: Membership[];
  workspaceMembers?: Membership[];
}

export interface List {
  id: string;
  boardId: string;
  name: string;
  position: number;
  cards: Card[];
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  position: number;
  dueDate?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  estimateMinutes?: number | null;
  isArchived: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  category: string;
  members?: Array<{ userId: string; user: User }>;
  labels?: Array<{ labelId: string; label: Label }>;
  checklists?: Checklist[];
  comments?: Comment[];
}

export interface Label {
  id: string;
  boardId: string;
  name: string;
  color: string;
}

export interface Checklist {
  id: string;
  cardId: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isDone: boolean;
  position: number;
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Activity {
  id: string;
  action: string;
  user?: User;
  boardId: string;
  cardId?: string | null;
  createdAt: string;
  meta?: Record<string, unknown>;
}
