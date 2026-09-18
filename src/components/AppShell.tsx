import AddRounded from "@mui/icons-material/AddRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/auth";

const sidebarWidth = 248;

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f8fa",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          position: "fixed",
          inset: 0,
          right: "auto",
          width: sidebarWidth,
          bgcolor: "#111827",
          color: "white",
          p: 2,
          flexDirection: "column",
          zIndex: 1200,
        }}
      >
        <Brand />
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => navigate("/?create=workspace")}
          sx={{ mt: 3, mb: 2, bgcolor: "#3b82f6", height: 44 }}
        >
          New workspace
        </Button>
        <List sx={{ px: 0 }}>
          <ListItemButton
            selected={location.pathname === "/"}
            onClick={() => navigate("/")}
            sx={{
              borderRadius: 2,
              color: "#d1d5db",
              "&.Mui-selected": {
                bgcolor: "rgba(255,255,255,.1)",
                color: "white",
              },
              "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,.14)" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
              <DashboardRounded />
            </ListItemIcon>
            <ListItemText primary="Workspaces" />
          </ListItemButton>
        </List>
        <Box sx={{ flex: 1 }} />
        <Divider sx={{ borderColor: "rgba(255,255,255,.1)", mb: 2 }} />
        <Stack direction="row" alignItems="center" spacing={1.5} px={1}>
          <Avatar
            sx={{ width: 38, height: 38, bgcolor: "#6366f1", fontWeight: 700 }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              color="#9ca3af"
              noWrap
              display="block"
            >
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Sign out">
            <IconButton onClick={signOut} sx={{ color: "#9ca3af" }}>
              <LogoutRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box
        sx={{
          ml: { md: `${sidebarWidth}px` },
          minHeight: "100vh",
          minWidth: 0,
          maxWidth: { md: `calc(100vw - ${sidebarWidth}px)` },
        }}
      >
        <Box
          component="header"
          sx={{
            height: { xs: 64, md: 72 },
            px: { xs: 2, sm: 3, lg: 4 },
            bgcolor: "rgba(255,255,255,.92)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 2,
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Brand dark />
          </Box>
          <TextField
            size="small"
            placeholder="Search boards and cards"
            sx={{
              display: { xs: "none", sm: "block" },
              width: 320,
              ml: { md: 0 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate("/?create=workspace")}
            sx={{ display: { xs: "none", md: "inline-flex" } }}
          >
            Create
          </Button>
          <Avatar
            sx={{
              display: { md: "none" },
              width: 36,
              height: 36,
              bgcolor: "#6366f1",
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
        </Box>
        <Box component="main" sx={{ pb: { xs: 9, md: 0 } }}>
          <Outlet />
        </Box>
      </Box>

      <Box
        component="nav"
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          height: 62,
          bgcolor: "#111827",
          borderRadius: 4,
          zIndex: 1300,
          px: 1,
          alignItems: "center",
          justifyContent: "space-around",
          boxShadow: "0 12px 30px rgba(15,23,42,.28)",
        }}
      >
        <MobileNavButton
          label="Home"
          icon={<DashboardRounded />}
          onClick={() => navigate("/")}
        />
        <MobileNavButton
          label="Create"
          icon={<AddRounded />}
          onClick={() => navigate("/?create=workspace")}
          primary
        />
        <MobileNavButton
          label="Logout"
          icon={<LogoutRounded />}
          onClick={signOut}
        />
      </Box>
    </Box>
  );
}

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Stack
      component={Link}
      to="/"
      direction="row"
      alignItems="center"
      spacing={1.2}
      sx={{ color: dark ? "#111827" : "white", textDecoration: "none" }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          bgcolor: "#3b82f6",
          display: "grid",
          placeItems: "center",
          color: "white",
          boxShadow: "0 8px 18px rgba(59,130,246,.3)",
        }}
      >
        <DashboardRounded fontSize="small" />
      </Box>
      <Typography fontSize={19} fontWeight={800} letterSpacing="-.04em">
        TaskFlow
      </Typography>
    </Stack>
  );
}

function MobileNavButton({
  label,
  icon,
  onClick,
  primary = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      sx={{
        minWidth: 76,
        color: primary ? "white" : "#cbd5e1",
        bgcolor: primary ? "#2563eb" : "transparent",
        borderRadius: 2.5,
        flexDirection: "column",
        gap: 0,
        py: 0.5,
        fontSize: 11,
        "&:hover": { bgcolor: primary ? "#1d4ed8" : "rgba(255,255,255,.08)" },
      }}
    >
      {icon}
      {label}
    </Button>
  );
}
