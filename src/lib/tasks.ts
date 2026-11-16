import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

/** Cards assigned to the signed-in user (GET /me/tasks). */
export interface MyTask {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  isCompleted: boolean;
  completedAt: string | null;
  approvalStatus: "none" | "pending" | "approved" | "changes_requested";
  listId: string;
  listName: string;
  listRole: "intake" | "active" | "review" | "done" | null;
  boardId: string;
  boardName: string;
  boardTemplate: string;
  workspaceId: string;
  workspaceName: string;
}

export const myTasksKey = ["my-tasks"];

export function useMyTasks() {
  return useQuery({
    queryKey: myTasksKey,
    queryFn: async () => (await api.get<MyTask[]>("/me/tasks")).data,
    staleTime: 30_000,
  });
}
