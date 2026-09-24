import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { api, errorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const token = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const mutation = useMutation({
    mutationFn: async () => {
      const payload =
        mode === "register"
          ? form
          : { email: form.email, password: form.password };
      return (await api.post(`/auth/${mode}`, payload)).data;
    },
    onSuccess: (data) => {
      setSession(data);
      navigate(redirect);
    },
  });

  if (token) return <Navigate to={redirect} replace />;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.05fr .95fr" },
        bgcolor: "white",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          position: "relative",
          overflow: "hidden",
          p: 8,
          color: "#111",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#dff4e8",
          borderRight: "1px solid #b9d8c6",
        }}
      >
        <Brand />
        <Box
          sx={{
            position: "absolute",
            width: 440,
            height: 440,
            borderRadius: "50%",
            border: "80px solid rgba(17,17,17,.06)",
            right: -180,
            top: 80,
          }}
        />
        <Box sx={{ position: "relative", maxWidth: 570 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: "3.7rem",
              lineHeight: 1.06,
              letterSpacing: "-.055em",
              fontWeight: 800,
            }}
          >
            Turn team plans into progress.
          </Typography>
          <Typography
            fontSize={18}
            sx={{ color: "#343430", mt: 3, lineHeight: 1.7 }}
          >
            A focused workspace for boards, assignments, discussions, and every
            detail your team needs to deliver.
          </Typography>
          <Stack spacing={1.5} mt={4}>
            {[
              "Flexible visual boards",
              "Clear ownership and due dates",
              "Updates that keep everyone aligned",
            ].map((item) => (
              <Stack
                key={item}
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <CheckCircleRounded sx={{ color: "#111" }} />
                <Typography>{item}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ color: "#45453f", fontWeight: 700 }}>
          Built for modern, fast-moving teams.
        </Typography>
      </Box>

      <Box
        sx={{ display: "grid", placeItems: "center", p: { xs: 2.5, sm: 5 } }}
      >
          <Box sx={{ width: "100%", maxWidth: 440, borderTop: { xs: "7px solid #bcebd2", lg: 0 }, pt: { xs: 3, lg: 0 } }}>
          <Box sx={{ display: { lg: "none" }, mb: 5 }}>
            <Brand />
          </Box>
          <Typography variant="h4">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </Typography>
          <Typography color="text.secondary" mt={1} mb={3}>
            {mode === "login"
              ? "Sign in to continue to your workspace."
              : "Start organizing your team's work in minutes."}
          </Typography>
          <Tabs
            value={mode}
            onChange={(_, value) => {
              setMode(value);
              mutation.reset();
            }}
            sx={{ mb: 3, minHeight: 42, borderBottom: "1px solid #e5e7eb" }}
          >
            <Tab value="login" label="Sign in" />
            <Tab value="register" label="Create account" />
          </Tabs>
          <Stack component="form" spacing={2.25} onSubmit={submit}>
            {mode === "register" && (
              <TextField
                label="Full name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            )}
            <TextField
              label="Email address"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
            <TextField
              label="Password"
              type="password"
              required
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              helperText={
                mode === "register" ? "Use at least 8 characters" : undefined
              }
              inputProps={{ minLength: 8 }}
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
            {mutation.isError && (
              <Alert severity="error">{errorMessage(mutation.error)}</Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={mutation.isPending}
              sx={{ height: 50 }}
            >
              {mutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            mt={3}
          >
            By continuing, you agree to use TaskFlow responsibly.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Brand() {
  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
      sx={{ color: "#111" }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2.5,
          bgcolor: "#25304f",
          display: "grid",
          placeItems: "center",
          color: "#bcebd2",
        }}
      >
        <DashboardRounded />
      </Box>
      <Typography fontWeight={800} fontSize={21} letterSpacing="-.04em">
        TaskFlow
      </Typography>
    </Stack>
  );
}
