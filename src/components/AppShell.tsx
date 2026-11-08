import {
  Avatar,
  Box,
  ButtonBase,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { type MouseEvent, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { Brand } from "./Brand";

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const openAccount = (event: MouseEvent<HTMLElement>) =>
    setAccountAnchor(event.currentTarget);
  const signOut = () => {
    setAccountAnchor(null);
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f2f0e9" }}>
      <Box
        component="header"
        sx={{
          height: { xs: 68, md: 78 },
          px: { xs: 2, md: 4 },
          bgcolor: "rgba(242,240,233,.88)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid #d4d0c5",
          display: "flex",
          alignItems: "center",
          gap: 3,
          position: "sticky",
          top: 0,
          zIndex: 1200,
        }}
      >
        <Brand linked />
        <Box sx={{ flex: 1 }} />
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
              bgcolor: "#181817",
              color: "#d8ff63",
              border: "2px solid #fffef9",
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
                border: "1px solid #deded8",
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
            onClick={signOut}
            sx={{ mx: 1, my: 0.75, borderRadius: 1.5, fontWeight: 700 }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Box>
      <Box component="main">
        <Outlet />
      </Box>
      <Box
        component="footer"
        sx={{ borderTop: "1px solid #d4d0c5", px: { xs: 2, md: 4 }, py: 2.5 }}
      >
        <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            © {new Date().getFullYear()} TaskFlow
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
