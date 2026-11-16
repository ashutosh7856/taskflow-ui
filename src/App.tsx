import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { LandingPage } from "./features/landing/LandingPage";
import { applyMeta } from "./content/seo";
import { useAuthStore } from "./store/auth";

// The landing page ships in the main bundle (it's the first paint for most
// visitors). Everything else loads on demand.
const named = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  key: K,
) =>
  lazy(async () => ({ default: (await loader())[key] as React.ComponentType }));

const AppShell = named(() => import("./components/AppShell"), "AppShell");
const AuthPage = named(() => import("./features/auth/AuthPage"), "AuthPage");
const ForgotPasswordPage = named(
  () => import("./features/auth/ForgotPasswordPage"),
  "ForgotPasswordPage",
);
const AdminLoginPage = named(
  () => import("./features/auth/AdminLoginPage"),
  "AdminLoginPage",
);
const ReceiptPage = named(
  () => import("./features/billing/ReceiptPage"),
  "ReceiptPage",
);
const BoardPage = named(
  () => import("./features/boards/BoardPage"),
  "BoardPage",
);
const InvitePage = named(
  () => import("./features/invites/InvitePage"),
  "InvitePage",
);
const MyTasksPage = named(
  () => import("./features/tasks/MyTasksPage"),
  "MyTasksPage",
);
const DashboardPage = named(
  () => import("./features/workspaces/DashboardPage"),
  "DashboardPage",
);
const CommandCenterPage = named(
  () => import("./features/workspaces/CommandCenterPage"),
  "CommandCenterPage",
);
const BillingPage = named(
  () => import("./features/billing/BillingPage"),
  "BillingPage",
);
const LegalPage = named(
  () => import("./features/legal/LegalPage"),
  "LegalPage",
);
const PricingPage = named(
  () => import("./features/public/PublicPages"),
  "PricingPage",
);
const PublicInfoPage = named(
  () => import("./features/public/PublicPages"),
  "PublicInfoPage",
);
const GuidePage = named(
  () => import("./features/guides/GuidePage"),
  "GuidePage",
);
const GuidesIndexPage = named(
  () => import("./features/guides/GuidePage"),
  "GuidesIndexPage",
);
const AdminPage = named(
  () => import("./features/admin/AdminPage"),
  "AdminPage",
);
const PortalPage = named(
  () => import("./features/portal/PortalPage"),
  "PortalPage",
);

function Loading() {
  return (
    <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <CircularProgress />
    </Box>
  );
}

const page = (node: ReactNode) => (
  <Suspense fallback={<Loading />}>{node}</Suspense>
);

function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}

export const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: page(<AuthPage />) },
  { path: "/signup", element: <Navigate to="/login?mode=register" replace /> },
  { path: "/forgot-password", element: page(<ForgotPasswordPage />) },
  { path: "/admin/login", element: page(<AdminLoginPage />) },
  { path: "/invites/:token", element: page(<InvitePage />) },
  { path: "/p/:token", element: page(<PortalPage />) },
  { path: "/privacy", element: page(<LegalPage />) },
  { path: "/terms", element: page(<LegalPage />) },
  { path: "/pricing", element: page(<PricingPage />) },
  { path: "/guides", element: page(<GuidesIndexPage />) },
  { path: "/guides/:slug", element: page(<GuidePage />) },
  { path: "/about", element: page(<PublicInfoPage />) },
  { path: "/contact", element: page(<PublicInfoPage />) },
  { path: "/security", element: page(<PublicInfoPage />) },
  { path: "/acceptable-use", element: page(<PublicInfoPage />) },
  { path: "/refund-policy", element: page(<PublicInfoPage />) },
  { path: "/cancellation-policy", element: page(<PublicInfoPage />) },
  { path: "/delivery-policy", element: page(<PublicInfoPage />) },
  { path: "/cookies", element: page(<PublicInfoPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: page(<AppShell />),
        children: [
          { path: "/app", element: page(<DashboardPage />) },
          { path: "/tasks", element: page(<MyTasksPage />) },
          {
            path: "/workspaces/:workspaceId/command-center",
            element: page(<CommandCenterPage />),
          },
          { path: "/boards/:boardId", element: page(<BoardPage />) },
          { path: "/billing", element: page(<BillingPage />) },
          { path: "/admin", element: page(<AdminPage />) },
        ],
      },
      // Printable receipt: outside the app shell so it prints cleanly.
      { path: "/billing/receipts/:id", element: page(<ReceiptPage />) },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export function App() {
  // Created on mount (not at import) so the server prerenderer can import routes.
  const [router] = useState(() => createBrowserRouter(routes));
  useEffect(() => {
    applyMeta(router.state.location.pathname);
    return router.subscribe((state) => applyMeta(state.location.pathname));
  }, [router]);
  return <RouterProvider router={router} />;
}
