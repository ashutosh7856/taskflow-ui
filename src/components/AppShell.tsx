import TaskAltRounded from "@mui/icons-material/TaskAltRounded";
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { type MouseEvent, useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMyTasks } from "../lib/tasks";
import { useAuthStore } from "../store/auth";
import { Brand } from "./Brand";
import { TrialBanner } from "./TrialBanner";
import { InvitesBanner } from "./InvitesBanner";
import { ThemeModeSwitch } from "./ThemeModeSwitch";

/**
 * Fetch the main app screens once the app is idle. A tab left open keeps
 * working after a deploy (its files would otherwise be gone), and switching
 * screens is instant.
 */
function prefetchScreens() {
  const load = () => {
    void Promise.allSettled([
      import("../features/workspaces/DashboardPage"),
      import("../features/boards/BoardPage"),
      import("../features/tasks/MyTasksPage"),
      import("../features/billing/BillingPage"),
      import("../features/workspaces/CommandCenterPage"),
      import("../features/feedback/FeedbackPage"),
    ]);
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 4000 });
  else setTimeout(load, 2500);
}

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  useEffect(prefetchScreens, []);
  const tasks = useMyTasks();
  const dueSoon =
    tasks.data?.filter(
      (task) =>
        !task.isCompleted &&
        task.dueDate &&
        new Date(task.dueDate).getTime() < Date.now() + 864e5,
    ).length || 0;
  const openAccount = (event: MouseEvent<HTMLElement>) =>
    setAccountAnchor(event.currentTarget);
  const signOut = () => {
    setAccountAnchor(null);
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--bg)",
      }}
    >
      <Box
        component="header"
        sx={{
          height: { xs: 68, md: 78 },
          px: { xs: 2, md: 4 },
          bgcolor: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 3,
          position: "sticky",
          top: 0,
          zIndex: 1200,
        }}
      >
        <Brand linked to="/app" />
        <Box sx={{ flex: 1 }} />
        <Button
          component={NavLink}
          to="/tasks"
          startIcon={
            <Badge
              badgeContent={dueSoon}
              color="error"
              max={99}
              title={dueSoon ? `${dueSoon} due within a day` : undefined}
            >
              <TaskAltRounded />
            </Badge>
          }
          sx={{
            color: "var(--ink)",
            fontWeight: 800,
            "&.active": { bgcolor: "var(--surface-3)" },
          }}
        >
          My tasks
        </Button>
        <ButtonBase
          aria-label="Open account menu"
          aria-controls={accountAnchor ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={accountAnchor ? "true" : undefined}
          onClick={openAccount}
          sx={{ borderRadius: "50%" }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: "var(--panel)",
              color: "#d8ff63",
              border: "2px solid var(--surface)",
              boxShadow: "2px 2px 0 #ff5c35",
              fontSize: 15,
              fontWeight: 850,
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
        </ButtonBase>
        <Menu
          id="account-menu"
          anchorEl={accountAnchor}
          open={!!accountAnchor}
          onClose={() => setAccountAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 240,
                border: "1px solid var(--line)",
                borderRadius: 2,
                boxShadow: "0 16px 40px rgba(0,0,0,.14)",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography fontWeight={800}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <ThemeModeSwitch />
          <Divider />
          <MenuItem
            onClick={() => {
              setAccountAnchor(null);
              navigate("/billing");
            }}
            sx={{ mx: 1, mt: 0.75, borderRadius: 1.5, fontWeight: 700 }}
          >
            Billing & plan
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAccountAnchor(null);
              navigate("/feedback", {
                state: { from: location.pathname + location.search },
              });
            }}
            sx={{ mx: 1, borderRadius: 1.5, fontWeight: 700 }}
          >
            Report a bug or idea
          </MenuItem>
          {user?.isAdmin && (
            <MenuItem
              onClick={() => {
                setAccountAnchor(null);
                navigate("/admin");
              }}
              sx={{ mx: 1, borderRadius: 1.5, fontWeight: 700 }}
            >
              Admin dashboard
            </MenuItem>
          )}
          <MenuItem
            onClick={signOut}
            sx={{ mx: 1, my: 0.75, borderRadius: 1.5, fontWeight: 700 }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Box>
      <InvitesBanner />
      <TrialBanner />
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
      <Box
        component="footer"
        sx={{
          borderTop: "1px solid var(--line)",
          px: { xs: 2, md: 4 },
          py: 2.5,
        }}
      >
        <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            © {new Date().getFullYear()} Danto
          </Typography>
          <Typography
            component="a"
            href="/privacy"
            variant="body2"
            color="text.secondary"
          >
            Privacy
          </Typography>
          <Typography
            component="a"
            href="/terms"
            variant="body2"
            color="text.secondary"
          >
            Terms
          </Typography>
          <Typography
            component="a"
            href="/billing"
            variant="body2"
            color="text.secondary"
          >
            Billing
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
