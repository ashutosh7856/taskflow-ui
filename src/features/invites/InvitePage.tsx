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

export function InvitePage() {
  const { token = "" } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const accept = useMutation({
    mutationFn: () => api.post(`/invites/${token}/accept`),
    onSuccess: () => navigate("/"),
  });

  return (
    <Box
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Card sx={{ width: "100%", maxWidth: 460, p: 5, textAlign: "center" }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h4">TaskFlow invitation</Typography>
          <Typography color="text.secondary">
            Accept this invitation to join your team in TaskFlow.
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
