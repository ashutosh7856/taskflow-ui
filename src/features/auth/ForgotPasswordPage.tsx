import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import LockResetRounded from "@mui/icons-material/LockResetRounded";
import MarkEmailReadRounded from "@mui/icons-material/MarkEmailReadRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { api, errorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";

type Step = "email" | "code" | "password";

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [step, setStep] = useState<Step>(
    searchParams.get("email") ? "code" : "email",
  );
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const code = digits.join("");

  useEffect(() => {
    document.title = "Reset your password · Danto";
  }, []);
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const request = useMutation({
    mutationFn: () =>
      api.post("/auth/password/forgot", { email: email.trim() }),
    onSuccess: () => {
      setStep("code");
      setResendIn(45);
    },
  });
  // Admin reset emails link here with send=1: send a fresh code right away
  // (an emailed code would often have expired by the time it's opened).
  const autoSent = useRef(false);
  useEffect(() => {
    if (autoSent.current || searchParams.get("send") !== "1" || !email) return;
    autoSent.current = true;
    request.mutate();
    navigate(`/forgot-password?email=${encodeURIComponent(email)}`, {
      replace: true,
    });
  }, [email, navigate, request, searchParams]);
  const verify = useMutation({
    mutationFn: () =>
      api.post("/auth/password/verify", { email: email.trim(), code }),
    onSuccess: () => setStep("password"),
  });
  const reset = useMutation({
    mutationFn: async () =>
      (
        await api.post("/auth/password/reset", {
          email: email.trim(),
          code,
          password,
        })
      ).data,
    onSuccess: (data) => {
      setSession(data);
      navigate("/app", { replace: true });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step === "email") request.mutate();
    if (step === "code" && code.length === 6) verify.mutate();
    if (step === "password" && password.length >= 8 && password === confirm)
      reset.mutate();
  };

  const error = request.error || verify.error || reset.error;
  const copy = {
    email: {
      icon: <LockResetRounded />,
      title: "Forgot your password?",
      text: "Enter the email you signed up with and we'll send you a 6-digit code.",
    },
    code: {
      icon: <MarkEmailReadRounded />,
      title: "Check your inbox",
      text: `If an account exists for ${email || "that email"}, we sent a 6-digit code. It expires in 15 minutes.`,
    },
    password: {
      icon: <LockResetRounded />,
      title: "Choose a new password",
      text: "Use at least 8 characters. You'll be signed in right after, and other devices will be signed out.",
    },
  }[step];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: { xs: 2, sm: 4 },
        bgcolor: "#f2f0e9",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Box mb={3}>
          <Brand linked />
        </Box>
        <Box
          component="form"
          onSubmit={submit}
          sx={{
            bgcolor: "#fffef9",
            border: "1px solid #d4d0c5",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow: "8px 8px 0 #181817",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: "#d8ff63",
              display: "grid",
              placeItems: "center",
              mb: 2.5,
            }}
          >
            {copy.icon}
          </Box>
          <Typography variant="h4" sx={{ fontSize: 30 }}>
            {copy.title}
          </Typography>
          <Typography color="text.secondary" mt={1} mb={3}>
            {copy.text}
          </Typography>

          <Stack spacing={2.25}>
            {step === "email" && (
              <TextField
                label="Email address"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
            {step === "code" && (
              <OtpInput
                digits={digits}
                onChange={setDigits}
                onComplete={() => verify.mutate()}
              />
            )}
            {step === "password" && (
              <>
                <TextField
                  label="New password"
                  type="password"
                  required
                  autoFocus
                  autoComplete="new-password"
                  inputProps={{ minLength: 8 }}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  error={Boolean(confirm) && confirm !== password}
                  helperText={
                    confirm && confirm !== password
                      ? "Passwords don't match"
                      : " "
                  }
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </>
            )}
            {error && <Alert severity="error">{errorMessage(error)}</Alert>}
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ height: 50 }}
              disabled={
                request.isPending ||
                verify.isPending ||
                reset.isPending ||
                (step === "code" && code.length !== 6) ||
                (step === "password" &&
                  (password.length < 8 || password !== confirm))
              }
            >
              {request.isPending || verify.isPending || reset.isPending ? (
                <CircularProgress size={22} color="inherit" />
              ) : step === "email" ? (
                "Send code"
              ) : step === "code" ? (
                "Verify code"
              ) : (
                "Save password and sign in"
              )}
            </Button>
            {step === "code" && (
              <Stack direction="row" justifyContent="space-between">
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setStep("email");
                    setDigits(Array(6).fill(""));
                  }}
                >
                  Use another email
                </Button>
                <Button
                  size="small"
                  disabled={resendIn > 0 || request.isPending || !email}
                  onClick={() => request.mutate()}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
        <Button
          component={Link}
          to="/login"
          startIcon={<ArrowBackRounded />}
          color="inherit"
          sx={{ mt: 2 }}
        >
          Back to sign in
        </Button>
      </Box>
    </Box>
  );
}

export function OtpInput({
  digits,
  onChange,
  onComplete,
}: {
  digits: string[];
  onChange: (digits: string[]) => void;
  onComplete: () => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  useEffect(() => refs.current[0]?.focus(), []);

  const set = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    onChange(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
    if (next.every(Boolean)) setTimeout(onComplete, 0);
  };
  const keyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0)
      refs.current[index - 1]?.focus();
  };
  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted.length < 2) return;
    event.preventDefault();
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    if (next.every(Boolean)) setTimeout(onComplete, 0);
  };

  return (
    <Stack direction="row" gap={1} justifyContent="space-between">
      {digits.map((digit, index) => (
        <Box
          key={index}
          component="input"
          ref={(node: HTMLInputElement | null) => {
            refs.current[index] = node;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          maxLength={1}
          onPaste={paste}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) =>
            keyDown(index, event)
          }
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            set(index, event.target.value.replace(/\D/g, "").slice(-1))
          }
          sx={{
            width: "100%",
            minWidth: 0,
            height: 58,
            textAlign: "center",
            fontSize: 26,
            fontWeight: 800,
            fontFamily: "DM Mono, monospace",
            borderRadius: 2,
            border: "1.5px solid #c9c5ba",
            bgcolor: "#fff",
            outline: "none",
            "&:focus": {
              borderColor: "#181817",
              boxShadow: "3px 3px 0 #d8ff63",
            },
          }}
        />
      ))}
    </Stack>
  );
}
