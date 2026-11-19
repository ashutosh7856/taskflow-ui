import { Box, CircularProgress } from "@mui/material";
import { ForceLight } from "./components/ForceLight";
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
import { RouteError } from "./components/RouteError";
import { isChunkLoadError, reloadForNewBuild } from "./lib/staleBuild";

// The landing page ships in the main bundle (it's the first paint for most
// visitors). Everything else loads on demand.
const named = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  key: K,
) =>
  lazy(async () => {
    try {
      return { default: (await loader())[key] as React.ComponentType };
    } catch (error) {
      // Old build's files are gone after a deploy: load the new build.
      if (isChunkLoadError(error) && reloadForNewBuild())
        return new Promise<never>(() => {});
      throw error;
    }
  });

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
const FeedbackPage = named(
  () => import("./features/feedback/FeedbackPage"),
  "FeedbackPage",
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
const DemoPortalPage = named(
  () => import("./features/portal/PortalPage"),
  "DemoPortalPage",
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
  {
    path: "/",
    element: (
      <ForceLight>
        <LandingPage />
      </ForceLight>
    ),
  },
  { path: "/login", element: <ForceLight>{page(<AuthPage />)}</ForceLight> },
  { path: "/signup", element: <Navigate to="/login?mode=register" replace /> },
  {
    path: "/forgot-password",
    element: <ForceLight>{page(<ForgotPasswordPage />)}</ForceLight>,
  },
  {
    path: "/admin/login",
    element: <ForceLight>{page(<AdminLoginPage />)}</ForceLight>,
  },
  {
    path: "/invites/:token",
    element: <ForceLight>{page(<InvitePage />)}</ForceLight>,
  },
  {
    path: "/p/:token",
    element: <ForceLight>{page(<PortalPage />)}</ForceLight>,
  },
  {
    path: "/demo",
    element: <ForceLight>{page(<DemoPortalPage />)}</ForceLight>,
  },
  { path: "/privacy", element: <ForceLight>{page(<LegalPage />)}</ForceLight> },
  { path: "/terms", element: <ForceLight>{page(<LegalPage />)}</ForceLight> },
  {
    path: "/pricing",
    element: <ForceLight>{page(<PricingPage />)}</ForceLight>,
  },
  {
    path: "/guides",
    element: <ForceLight>{page(<GuidesIndexPage />)}</ForceLight>,
  },
  {
    path: "/guides/:slug",
    element: <ForceLight>{page(<GuidePage />)}</ForceLight>,
  },
  {
    path: "/about",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
  {
    path: "/contact",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
  {
    path: "/security",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
  {
    path: "/acceptable-use",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
  {
    path: "/refund-policy",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
  {
    path: "/cancellation-policy",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
  {
    path: "/delivery-policy",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
  {
    path: "/cookies",
    element: <ForceLight>{page(<PublicInfoPage />)}</ForceLight>,
  },
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
          { path: "/feedback", element: page(<FeedbackPage />) },
          { path: "/admin", element: page(<AdminPage />) },
        ],
      },
      // Printable receipt: outside the app shell so it prints cleanly.
      {
        path: "/billing/receipts/:id",
        element: <ForceLight>{page(<ReceiptPage />)}</ForceLight>,
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export function App() {
  // Created on mount (not at import) so the server prerenderer can import routes.
  const [router] = useState(() =>
    createBrowserRouter(
      routes.map((route) => ({ ...route, errorElement: <RouteError /> })),
    ),
  );
  useEffect(() => {
    applyMeta(router.state.location.pathname);
    return router.subscribe((state) => applyMeta(state.location.pathname));
  }, [router]);
  return <RouterProvider router={router} />;
}
