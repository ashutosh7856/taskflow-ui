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
import { BillingPage } from "./features/billing/BillingPage";
import { LegalPage } from "./features/legal/LegalPage";
import { useAuthStore } from "./store/auth";

function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
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
          { path: "/", element: <DashboardPage /> },
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
