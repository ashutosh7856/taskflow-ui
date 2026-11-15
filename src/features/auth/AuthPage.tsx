import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
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
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { signupSource } from "../../lib/attribution";

import { api, errorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { Brand } from "../../components/Brand";
import { AnimatedContent } from "../../components/bits/AnimatedContent";

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const token = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const redirect = searchParams.get("redirect") || "/app";
  const mutation = useMutation({
    mutationFn: async () => {
      const payload =
        mode === "register"
          ? { ...form, source: signupSource() }
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
        bgcolor: "#f2f0e9",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          position: "relative",
          overflow: "hidden",
          p: 7,
          color: "#fff",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#181817",
          borderRight: "1px solid #181817",
        }}
      >
        <Brand light />
        <Box
          sx={{
            position: "absolute",
            width: 440,
            height: 440,
            borderRadius: "50%",
            border: "1px solid rgba(216,255,99,.45)",
            right: -180,
            top: 80,
          }}
        />
        <AnimatedContent>
          <Box sx={{ position: "relative", maxWidth: 620 }}>
            <Typography className="mono-label" sx={{ color: "#d8ff63", mb: 2 }}>
              Client portals for freelancers
            </Typography>
            <Typography
              component="h1"
              className="display-type"
              sx={{
                fontSize: "clamp(3.5rem, 5vw, 5.5rem)",
                lineHeight: 0.94,
              }}
            >
              Your clients,{" "}
              <Box component="span" sx={{ color: "#d8ff63" }}>
                always
              </Box>{" "}
              in the loop.
            </Typography>
            <Typography
              fontSize={18}
              sx={{ color: "#b9b7af", mt: 3, lineHeight: 1.7, maxWidth: 520 }}
            >
              Share live progress, collect approvals in one click and send
              polished weekly updates, all from the board you already work in.
            </Typography>
            <Stack spacing={1.5} mt={4}>
              {[
                "A branded portal for every client",
                "One-click approvals with a paper trail",
                "AI-written weekly status updates",
              ].map((item) => (
                <Stack
                  key={item}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <CheckCircleRounded sx={{ color: "#ff5c35" }} />
                  <Typography>{item}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </AnimatedContent>
        <Typography className="mono-label" sx={{ color: "#8f8e88" }}>
          danto.app
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          p: { xs: 2.5, sm: 5 },
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
            bgcolor: "#fffef9",
            border: "1px solid #d4d0c5",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: "8px 8px 0 #181817",
          }}
        >
          <Box sx={{ display: { lg: "none" }, mb: 5 }}>
            <Brand />
          </Box>
          <Typography className="mono-label" color="text.secondary" mb={1}>
            {mode === "login" ? "Sign in" : "Free forever plan"}
          </Typography>
          <Typography variant="h4" sx={{ fontSize: 34 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </Typography>
          <Typography color="text.secondary" mt={1} mb={3}>
            {mode === "login"
              ? "Pick up where you left off."
              : "Set up your first client portal in about two minutes. No card needed."}
          </Typography>
          <Tabs
            value={mode}
            onChange={(_, value) => {
              setMode(value);
              mutation.reset();
            }}
            sx={{
              mb: 3,
              minHeight: 42,
              borderBottom: "1px solid #d4d0c5",
              "& .MuiTabs-indicator": { bgcolor: "#ff5c35", height: 3 },
            }}
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
            {mode === "login" && (
              <Typography
                component={Link}
                to={`/forgot-password${form.email ? `?email=${encodeURIComponent(form.email)}` : ""}`}
                variant="body2"
                sx={{
                  alignSelf: "flex-end",
                  mt: "-8px !important",
                  color: "#56534d",
                  fontWeight: 700,
                }}
              >
                Forgot password?
              </Typography>
            )}
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
            By continuing you agree to our{" "}
            <Link to="/terms" style={{ color: "inherit" }}>
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" style={{ color: "inherit" }}>
              Privacy Policy
            </Link>
            .
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
