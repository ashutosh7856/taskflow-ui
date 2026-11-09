import AddRounded from "@mui/icons-material/AddRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import { api, errorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/auth";

type Overview = {
  users: number;
  workspaces: number;
  activePlans: Record<string, number>;
  estimatedMrr: number;
  collectedLast30Days: number;
  aiLast30Days: {
    actions: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
};

type Discount = {
  id: string;
  code: string;
  percentOff: number;
  plan: "pro" | "business" | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  active: boolean;
  expiresAt: string | null;
};

export function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState(20);
  const [plan, setPlan] = useState<"all" | "pro" | "business">("all");
  const [maxRedemptions, setMaxRedemptions] = useState(100);

  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => (await api.get<Overview>("/admin/overview")).data,
    enabled: Boolean(user?.isAdmin),
  });
  const discounts = useQuery({
    queryKey: ["admin", "discounts"],
    queryFn: async () => (await api.get<Discount[]>("/admin/discounts")).data,
    enabled: Boolean(user?.isAdmin),
  });
  const create = useMutation({
    mutationFn: () =>
      api.post("/admin/discounts", {
        code,
        percentOff,
        plan: plan === "all" ? null : plan,
        maxRedemptions,
      }),
    onSuccess: () => {
      setCode("");
      client.invalidateQueries({ queryKey: ["admin", "discounts"] });
    },
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/admin/discounts/${id}`, { active }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["admin", "discounts"] }),
  });

  if (!user?.isAdmin) return <Navigate to="/app" replace />;
  const error =
    overview.error || discounts.error || create.error || toggle.error;
  const data = overview.data;
  const grossMargin = data
    ? data.estimatedMrr - data.aiLast30Days.estimatedCostUsd
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
      <Stack direction="row" gap={1.5} alignItems="center">
        <AdminPanelSettingsRounded />
        <Typography className="mono-label" color="text.secondary">
          Danto administration
        </Typography>
      </Stack>
      <Typography variant="h2" sx={{ fontSize: { xs: 40, md: 58 }, mt: 1 }}>
        Revenue and controls.
      </Typography>
      <Typography color="text.secondary" mt={1} mb={4}>
        MRR is estimated from active plans. Collected revenue is populated by
        verified payment webhooks; AI cost uses recorded model token usage.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage(error)}
        </Alert>
      )}
      {overview.isLoading ? (
        <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <Metric
              label="Estimated MRR"
              value={`$${data.estimatedMrr.toFixed(2)}`}
            />
            <Metric
              label="Collected · 30d"
              value={`$${data.collectedLast30Days.toFixed(2)}`}
            />
            <Metric
              label="AI cost · 30d"
              value={`$${data.aiLast30Days.estimatedCostUsd.toFixed(4)}`}
            />
            <Metric label="MRR less AI" value={`$${grossMargin.toFixed(2)}`} />
            <Metric label="Users" value={String(data.users)} />
            <Metric label="Workspaces" value={String(data.workspaces)} />
            <Metric
              label="Pro accounts"
              value={String(data.activePlans.pro || 0)}
            />
            <Metric
              label="Team accounts"
              value={String(data.activePlans.business || 0)}
            />
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2.5,
              border: "1px solid #c9c4b9",
              borderRadius: 2,
              bgcolor: "#fffef9",
            }}
          >
            <Typography fontWeight={850}>AI usage · last 30 days</Typography>
            <Typography color="text.secondary" mt={0.5}>
              {data.aiLast30Days.actions.toLocaleString()} actions ·{" "}
              {data.aiLast30Days.inputTokens.toLocaleString()} input tokens ·{" "}
              {data.aiLast30Days.outputTokens.toLocaleString()} output tokens
            </Typography>
          </Box>
        </>
      ) : null}

      <Box
        sx={{
          mt: 6,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: ".8fr 1.2fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box
          sx={{
            p: 3,
            bgcolor: "#181817",
            color: "#fff",
            borderRadius: 3,
            boxShadow: "6px 6px 0 #ff5c35",
          }}
        >
          <Typography className="mono-label" sx={{ color: "#b9b7af" }}>
            New discount
          </Typography>
          <Typography variant="h4" mt={1}>
            First-payment offer
          </Typography>
          <Stack spacing={2} mt={3}>
            <TextField
              label="Code"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              inputProps={{ maxLength: 30 }}
              sx={{ bgcolor: "#fff" }}
            />
            <TextField
              label="Percent off"
              type="number"
              value={percentOff}
              onChange={(event) => setPercentOff(Number(event.target.value))}
              inputProps={{ min: 5, max: 50 }}
              sx={{ bgcolor: "#fff" }}
            />
            <FormControl sx={{ bgcolor: "#fff" }}>
              <InputLabel>Plan</InputLabel>
              <Select
                label="Plan"
                value={plan}
                onChange={(event) => setPlan(event.target.value as typeof plan)}
              >
                <MenuItem value="all">Pro and Team</MenuItem>
                <MenuItem value="pro">Pro only</MenuItem>
                <MenuItem value="business">Team only</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Maximum redemptions"
              type="number"
              value={maxRedemptions}
              onChange={(event) =>
                setMaxRedemptions(Number(event.target.value))
              }
              inputProps={{ min: 1 }}
              sx={{ bgcolor: "#fff" }}
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              disabled={!code || create.isPending}
              onClick={() => create.mutate()}
            >
              {create.isPending ? "Creating…" : "Create code"}
            </Button>
          </Stack>
          <Typography fontSize={12} sx={{ color: "#aaa8a1", mt: 2 }}>
            Discounts apply to the first subscription payment only. The regular
            monthly price is always shown before checkout approval.
          </Typography>
        </Box>
        <Box>
          <Typography className="mono-label" color="text.secondary">
            Discount codes
          </Typography>
          <Stack spacing={1.5} mt={2}>
            {discounts.data?.map((discount) => (
              <Box
                key={discount.id}
                sx={{
                  p: 2.5,
                  border: "1px solid #c9c4b9",
                  borderRadius: 2,
                  bgcolor: "#fffef9",
                }}
              >
                <Stack direction="row" alignItems="center" gap={2}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography fontWeight={900}>{discount.code}</Typography>
                      <Chip
                        size="small"
                        label={`${discount.percentOff}% off`}
                      />
                    </Stack>
                    <Typography fontSize={13} color="text.secondary" mt={0.5}>
                      {discount.plan
                        ? discount.plan === "business"
                          ? "Team"
                          : "Pro"
                        : "Pro + Team"}{" "}
                      · {discount.redemptionCount}
                      {discount.maxRedemptions
                        ? ` of ${discount.maxRedemptions}`
                        : ""}{" "}
                      redeemed
                    </Typography>
                  </Box>
                  <Typography fontSize={13}>
                    {discount.active ? "Active" : "Paused"}
                  </Typography>
                  <Switch
                    checked={discount.active}
                    disabled={toggle.isPending}
                    onChange={(_, active) =>
                      toggle.mutate({ id: discount.id, active })
                    }
                  />
                </Stack>
              </Box>
            ))}
            {!discounts.isLoading && !discounts.data?.length && (
              <Typography color="text.secondary">
                No discount codes yet.
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 2.5,
        border: "1px solid #c9c4b9",
        borderTop: "4px solid #181817",
        borderRadius: 2,
        bgcolor: "#fffef9",
      }}
    >
      <Typography className="mono-label" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" mt={1}>
        {value}
      </Typography>
    </Box>
  );
}
