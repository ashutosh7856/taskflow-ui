import { Avatar, Box, ButtonBase, Divider, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { type MouseEvent, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const openAccount = (event: MouseEvent<HTMLElement>) => setAccountAnchor(event.currentTarget);
  const signOut = () => { setAccountAnchor(null); logout(); navigate("/login"); };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f6f3" }}>
      <Box component="header" sx={{ height: { xs: 64, md: 72 }, px: { xs: 2, md: 4 }, bgcolor: "rgba(255,255,255,.94)", backdropFilter: "blur(12px)", borderBottom: "1px solid #deded8", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 1200 }}>
        <Stack component={Link} to="/" direction="row" alignItems="center" spacing={1.25} sx={{ color: "#111", textDecoration: "none" }} aria-label="TaskFlow home">
          <Box aria-hidden sx={{ width: 38, height: 38, bgcolor: "#25304f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", transform: "rotate(-8deg)" }}>
            <Box sx={{ width: 5, height: 15, borderRadius: 3, bgcolor: "#bcebd2" }} />
            <Box sx={{ width: 5, height: 22, borderRadius: 3, bgcolor: "#fff" }} />
            <Box sx={{ width: 5, height: 11, borderRadius: 3, bgcolor: "#bcebd2" }} />
          </Box>
          <Typography fontSize={20} fontWeight={850} letterSpacing="-.05em">taskflow</Typography>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <ButtonBase aria-label="Open account menu" aria-controls={accountAnchor ? "account-menu" : undefined} aria-haspopup="true" aria-expanded={accountAnchor ? "true" : undefined} onClick={openAccount} sx={{ borderRadius: "50%" }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: "#25304f", color: "#fff", border: "3px solid #bcebd2", fontSize: 17, fontWeight: 850 }}>{user?.name?.[0]?.toUpperCase()}</Avatar>
        </ButtonBase>
        <Menu id="account-menu" anchorEl={accountAnchor} open={!!accountAnchor} onClose={() => setAccountAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }} slotProps={{ paper: { sx: { mt: 1, minWidth: 240, border: "1px solid #deded8", borderRadius: 2, boxShadow: "0 16px 40px rgba(0,0,0,.14)" } } }}>
          <Box sx={{ px: 2, py: 1.25 }}><Typography fontWeight={800}>{user?.name}</Typography><Typography variant="body2" color="text.secondary">{user?.email}</Typography></Box>
          <Divider />
          <MenuItem onClick={signOut} sx={{ mx: 1, my: .75, borderRadius: 1.5, fontWeight: 700 }}>Sign out</MenuItem>
        </Menu>
      </Box>
      <Box component="main"><Outlet /></Box>
    </Box>
  );
}
