import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import {
  Box,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";

interface Onboarding {
  createdBoard: boolean;
  hasClientBoard: boolean;
  publishedPortal: boolean;
  requestedApproval: boolean;
  clientResponded: boolean;
}

const KEY = "danto-onboarding-dismissed";

/** First-run checklist that walks a new user to their first client approval. */
export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
  const status = useQuery({
    queryKey: ["onboarding"],
    enabled: !dismissed,
    queryFn: async () => (await api.get<Onboarding>("/me/onboarding")).data,
  });
  if (dismissed || !status.data) return null;
  // Teams using Danto for their own internal work aren't nudged toward
  // client portals: the checklist is for people doing client work.
  if (status.data.createdBoard && !status.data.hasClientBoard) return null;
  const steps = [
    {
      done: status.data.createdBoard,
      title: "Create a client board",
      detail:
        "Use the Client project template, or paste a brief and let AI plan it.",
    },
    {
      done: status.data.publishedPortal,
      title: "Share it with your client",
      detail:
        "Open the board, press “Share with client” and publish the portal.",
    },
    {
      done: status.data.requestedApproval,
      title: "Request your first approval",
      detail: "Open a finished card and press “Request approval”.",
    },
    {
      done: status.data.clientResponded,
      title: "Hear back from your client",
      detail:
        "Approvals, comments and requests land in your inbox and on the board.",
    },
  ];
  const completed = steps.filter((step) => step.done).length;
  if (completed === steps.length) return null;
  return (
    <Box
      sx={{
        p: { xs: 2.25, sm: 3 },
        mb: 4,
        borderRadius: 4,
        bgcolor: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "5px 5px 0 #d8ff63",
      }}
    >
      <Stack direction="row" alignItems="flex-start" gap={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography className="mono-label" color="text.secondary">
            Getting started · {completed} of {steps.length}
          </Typography>
          <Typography variant="h5" mt={0.5}>
            Get your first client approval
          </Typography>
        </Box>
        <IconButton
          aria-label="Hide getting started"
          size="small"
          onClick={() => {
            try {
              localStorage.setItem(KEY, "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(completed / steps.length) * 100}
        sx={{
          my: 2,
          height: 8,
          borderRadius: 99,
          bgcolor: "var(--surface-2)",
          "& .MuiLinearProgress-bar": {
            bgcolor: "var(--ink)",
            borderRadius: 99,
          },
        }}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {steps.map((step) => (
          <Stack
            key={step.title}
            direction="row"
            gap={1.25}
            alignItems="flex-start"
          >
            {step.done ? (
              <CheckCircleRounded
                sx={{ color: "var(--success-ink)", mt: "2px" }}
              />
            ) : (
              <RadioButtonUncheckedRounded
                sx={{ color: "var(--muted-2)", mt: "2px" }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={800}
                sx={{
                  textDecoration: step.done ? "line-through" : "none",
                  color: step.done ? "var(--muted)" : "var(--ink)",
                }}
              >
                {step.title}
              </Typography>
              {!step.done && (
                <Typography variant="body2" color="text.secondary">
                  {step.detail}
                </Typography>
              )}
            </Box>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
