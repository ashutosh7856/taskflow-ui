export type Role = "owner" | "admin" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
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
  brandName?: string | null;
  brandColor?: string | null;
  brandLogoUrl?: string | null;
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
  template: "blank" | "client" | "software" | "marketing" | "operations";
  portalEnabled?: boolean;
  portalClientName?: string | null;
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
  clientVisible?: boolean;
  approvalStatus?: ApprovalStatus;
  approvalRequestedAt?: string | null;
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

export type ApprovalStatus =
  "none" | "pending" | "approved" | "changes_requested";
export type ClientFeedbackKind =
  "comment" | "approved" | "changes_requested" | "request";

export interface ClientFeedback {
  id: string;
  boardId?: string;
  cardId?: string | null;
  kind: ClientFeedbackKind;
  authorName: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export interface PortalSettings {
  enabled: boolean;
  paused?: boolean;
  url: string | null;
  clientName: string | null;
  clientEmail: string | null;
  welcome: string | null;
  allowRequests: boolean;
  weeklyUpdates?: boolean;
  lastAutoUpdateAt?: string | null;
  plan: "free" | "pro" | "business";
  entitlements: {
    weeklyUpdates?: boolean;
    clientPortals: number | null;
    portalBranding: boolean;
    whiteLabel: boolean;
  };
  unread: number;
  feedback: ClientFeedback[];
}

export interface PublicPortalCard {
  files?: Array<{
    id: string;
    cardId: string;
    name: string;
    contentType: string;
    size: number;
    createdAt: string;
    url: string;
  }>;
  id: string;
  title: string;
  description?: string | null;
  category: string;
  dueDate?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  approvalStatus: ApprovalStatus;
  approvalRequestedAt?: string | null;
  checklist: { done: number; total: number };
  feedback: ClientFeedback[];
}

export interface PublicPortal {
  board: {
    name: string;
    clientName: string | null;
    welcome: string | null;
    allowRequests: boolean;
    updatedAt: string;
  };
  brand: {
    name: string;
    color: string | null;
    logoUrl: string | null;
    showBadge: boolean;
  };
  stats: {
    total: number;
    completed: number;
    awaitingApproval: number;
    overdue: number;
  };
  lists: Array<{ id: string; name: string; cards: PublicPortalCard[] }>;
  requests: Array<{
    id: string;
    authorName: string;
    message: string;
    createdAt: string;
  }>;
}
