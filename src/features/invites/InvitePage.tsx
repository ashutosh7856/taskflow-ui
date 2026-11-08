import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api, errorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { Brand } from "../../components/Brand";

export function InvitePage() {
  const { token = "" } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const accept = useMutation({
    mutationFn: () => api.post(`/invites/${token}/accept`),
    onSuccess: () => navigate("/app"),
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        bgcolor: "#181817",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          border: "1px solid rgba(216,255,99,.4)",
          top: -260,
          right: -120,
        }}
      />
      <Card
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          borderRadius: 3,
          bgcolor: "#fffef9",
          boxShadow: "8px 8px 0 #ff5c35",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Brand />
          <Typography
            className="mono-label"
            color="text.secondary"
            sx={{ pt: 2 }}
          >
            A seat is waiting
          </Typography>
          <Typography variant="h4" sx={{ fontSize: 36 }}>
            Join the work.
          </Typography>
          <Typography color="text.secondary">
            Accept this invitation to join your team in Danto.
          </Typography>
          {accept.isError && (
            <Alert severity="error">{errorMessage(accept.error)}</Alert>
          )}
          {accessToken ? (
            <Button
              variant="contained"
              size="large"
              disabled={accept.isPending}
              onClick={() => accept.mutate()}
            >
              {accept.isPending ? (
                <CircularProgress size={24} />
              ) : (
                "Accept invitation"
              )}
            </Button>
          ) : (
            <Button
              component={Link}
              to={`/login?redirect=/invites/${token}`}
              variant="contained"
              size="large"
            >
              Sign in to accept
            </Button>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
