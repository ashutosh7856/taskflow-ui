import BlockRounded from "@mui/icons-material/BlockRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import {
  Box,
  Button,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { daysLate } from "../lib/cardStatus";
import type { BlockedOn, Card } from "../types";

const waitingOn: Record<BlockedOn, { label: string; note: string }> = {
  client: {
    label: "Client",
    note: "Your client sees this in their portal and gets an email asking for it.",
  },
  team: {
    label: "Our team",
    note: "Only your team sees this. The workspace owner is emailed.",
  },
  other: {
    label: "Someone else",
    note: "Only your team sees this. The workspace owner is emailed.",
  },
};

/** Blocked / late status for a card, with the reason people need to see. */
export function CardStatusPanel({
  card,
  busy,
  onSave,
}: {
  card: Card;
  busy?: boolean;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const blocked = !!card.blockedReason;
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState(card.blockedReason || "");
  const [on, setOn] = useState<BlockedOn>(card.blockedOn || "team");
  const [delay, setDelay] = useState(card.delayReason || "");
  useEffect(() => {
    setReason(card.blockedReason || "");
    setOn(card.blockedOn || "team");
    setDelay(card.delayReason || "");
    setEditing(false);
  }, [card.id, card.blockedReason, card.blockedOn, card.delayReason]);

  if (card.isCompleted) return null;
  const late = daysLate(card.dueDate);
  const showForm = blocked || editing;

  return (
    <Stack gap={1.5}>
      {late > 0 && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "var(--tint-warn)",
            border: "1px solid color-mix(in srgb, var(--warn-ink) 25%, transparent)",
          }}
        >
          <Stack direction="row" gap={1} alignItems="center" mb={1.25}>
            <ScheduleRounded sx={{ color: "var(--warn-ink)" }} fontSize="small" />
            <Typography fontWeight={800}>
              {late === 1 ? "1 day late" : `${late} days late`}
            </Typography>
          </Stack>
          <TextField
            label="Why is it late?"
            placeholder="e.g. Waiting on final photos from the shoot"
            size="small"
            fullWidth
            multiline
            maxRows={4}
            value={delay}
            inputProps={{ maxLength: 400 }}
            onChange={(event) => setDelay(event.target.value)}
            onBlur={() => {
              if (delay.trim() !== (card.delayReason || ""))
                onSave({ delayReason: delay.trim() || null });
            }}
            helperText="Your client sees this in the portal and the Friday update. Setting a new due date clears it."
          />
        </Box>
      )}

      {showForm ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "var(--tint-danger)",
            border: "1px solid var(--tint-danger-line)",
          }}
        >
          <Stack direction="row" gap={1} alignItems="center" mb={1.5}>
            <BlockRounded sx={{ color: "var(--danger-ink)" }} fontSize="small" />
            <Typography fontWeight={800} sx={{ flex: 1 }}>
              {blocked ? "Blocked" : "Mark as blocked"}
            </Typography>
            {blocked && card.blockedAt && (
              <Typography variant="body2" color="text.secondary">
                since {new Date(card.blockedAt).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
          <Typography variant="body2" fontWeight={700} mb={0.75}>
            Waiting on
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={on}
            onChange={(_, value: BlockedOn | null) => {
              if (!value) return;
              setOn(value);
              if (blocked) onSave({ blockedOn: value });
            }}
            sx={{ mb: 1.5, flexWrap: "wrap" }}
          >
            {(Object.keys(waitingOn) as BlockedOn[]).map((key) => (
              <ToggleButton key={key} value={key} sx={{ px: 1.75 }}>
                {waitingOn[key].label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <TextField
            label={on === "client" ? "What do you need from them?" : "What's blocking it?"}
            placeholder={
              on === "client"
                ? "e.g. Send the new menu photos"
                : "e.g. Booking plugin licence hasn't arrived"
            }
            size="small"
            fullWidth
            multiline
            maxRows={4}
            autoFocus={editing && !blocked}
            value={reason}
            inputProps={{ maxLength: 400 }}
            onChange={(event) => setReason(event.target.value)}
            onBlur={() => {
              if (blocked && reason.trim() && reason.trim() !== card.blockedReason)
                onSave({ blockedReason: reason.trim() });
            }}
            helperText={waitingOn[on].note}
          />
          <Stack direction="row" gap={1} mt={1.5}>
            {blocked ? (
              <Button
                variant="outlined"
                disabled={busy}
                onClick={() => onSave({ blockedReason: null })}
              >
                Unblock
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  disabled={busy || !reason.trim()}
                  onClick={() => onSave({ blockedReason: reason.trim(), blockedOn: on })}
                >
                  Mark as blocked
                </Button>
                <Button onClick={() => setEditing(false)}>Cancel</Button>
              </>
            )}
          </Stack>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<BlockRounded />}
          onClick={() => setEditing(true)}
          sx={{ alignSelf: "flex-start", borderColor: "var(--line-strong)", color: "var(--ink-soft)" }}
        >
          Mark as blocked
        </Button>
      )}
    </Stack>
  );
}
