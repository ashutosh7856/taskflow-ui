import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { api, errorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import type { User } from "../../types";
import { OtpInput } from "./ForgotPasswordPage";

/**
 * Admin sign-in uses only a one-time code. There is no email field: the
 * server always sends the code to the configured admin address.
 */
export function AdminLoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [resendIn, setResendIn] = useState(0);
  const code = digits.join("");

  useEffect(() => {
    document.title = "Admin sign-in · Danto";
  }, []);
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const send = useMutation({
    mutationFn: async () =>
      (await api.post<{ challengeId: string }>("/auth/admin/code")).data,
    onSuccess: (data) => {
      setChallengeId(data.challengeId);
      setDigits(Array(6).fill(""));
      setResendIn(60);
    },
  });
  const verify = useMutation({
    mutationFn: async (value: string) =>
      (
        await api.post<{
          user: User;
          accessToken: string;
          refreshToken: string;
        }>("/auth/admin/verify", { challengeId, code: value })
      ).data,
    onSuccess: ({ user, accessToken, refreshToken }) => {
      setSession({ user, accessToken, refreshToken });
      navigate("/admin", { replace: true });
    },
    onError: () => setDigits(Array(6).fill("")),
  });

  // Submit automatically once all six digits are in (typed or pasted).
  const lastTried = useRef("");
  useEffect(() => {
    if (!challengeId || code.length !== 6 || verify.isPending) return;
    if (lastTried.current === `${challengeId}:${code}`) return;
    lastTried.current = `${challengeId}:${code}`;
    verify.mutate(code);
  }, [challengeId, code, verify]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!challengeId) send.mutate();
    else if (code.length === 6) verify.mutate(code);
  };
  const error = send.error || verify.error;
  const pending = send.isPending || verify.isPending;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: { xs: 2, sm: 4 },
        bgcolor: "#181817",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        <Box mb={3}>
          <Brand linked light />
        </Box>
        <Box
          component="form"
          onSubmit={submit}
          sx={{
            bgcolor: "#fffef9",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: "8px 8px 0 #d8ff63",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "#181817",
              color: "#d8ff63",
              display: "grid",
              placeItems: "center",
              mb: 2.5,
            }}
          >
            <AdminPanelSettingsRounded />
          </Box>
          <Typography variant="h4" sx={{ fontSize: 28 }}>
            {challengeId ? "Enter your code" : "Admin sign-in"}
          </Typography>
          <Typography color="text.secondary" mt={1} mb={3}>
            {challengeId
              ? "We sent a 6-digit code to the admin inbox. It works once and expires in 10 minutes."
              : "Admin access needs a one-time code sent to the admin inbox. Passwords don't work here."}
          </Typography>
          <Stack spacing={2.25}>
            {challengeId && (
              <OtpInput
                digits={digits}
                onChange={setDigits}
                onComplete={() => {}}
              />
            )}
            {error && <Alert severity="error">{errorMessage(error)}</Alert>}
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ height: 50 }}
              disabled={pending || (Boolean(challengeId) && code.length !== 6)}
            >
              {pending ? (
                <CircularProgress size={22} color="inherit" />
              ) : challengeId ? (
                "Sign in to admin"
              ) : (
                "Send code"
              )}
            </Button>
            {challengeId && (
              <Button
                size="small"
                disabled={resendIn > 0 || pending}
                onClick={() => send.mutate()}
              >
                {resendIn > 0
                  ? `Send a new code in ${resendIn}s`
                  : "Send a new code"}
              </Button>
            )}
          </Stack>
        </Box>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackRounded />}
          sx={{ mt: 2, color: "#dcdad3" }}
        >
          Back to Danto
        </Button>
      </Box>
    </Box>
  );
}
