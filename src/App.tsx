import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthPage } from "./features/auth/AuthPage";
import { BoardPage } from "./features/boards/BoardPage";
import { InvitePage } from "./features/invites/InvitePage";
import { DashboardPage } from "./features/workspaces/DashboardPage";
import { CommandCenterPage } from "./features/workspaces/CommandCenterPage";
import { BillingPage } from "./features/billing/BillingPage";
import { LegalPage } from "./features/legal/LegalPage";
import { LandingPage } from "./features/landing/LandingPage";
import { useAuthStore } from "./store/auth";

function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <AuthPage /> },
  { path: "/invites/:token", element: <InvitePage /> },
  { path: "/privacy", element: <LegalPage /> },
  { path: "/terms", element: <LegalPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/app", element: <DashboardPage /> },
          {
            path: "/workspaces/:workspaceId/command-center",
            element: <CommandCenterPage />,
          },
          { path: "/boards/:boardId", element: <BoardPage /> },
          { path: "/billing", element: <BillingPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
