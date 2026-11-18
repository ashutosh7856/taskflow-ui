import { InputAdornment, TextField, type SxProps } from "@mui/material";
import { useEffect, useState } from "react";

/** Minutes → "1.5" style hours text (blank when empty). */
export function minutesToHoursText(minutes?: number | null) {
  if (minutes == null) return "";
  return String(Math.round((minutes / 60) * 100) / 100);
}

/**
 * Reads what people naturally type: "2", "1.5", "1,5", "1:30", "90m",
 * "2h", "1h 30m". Returns minutes, null for blank, or undefined if invalid.
 */
export function parseHours(text: string): number | null | undefined {
  const value = text.trim().toLowerCase().replace(",", ".");
  if (!value) return null;
  let minutes: number;
  const clock = value.match(/^(\d+):([0-5]?\d)$/);
  const parts = value.match(
    /^(?:(\d+(?:\.\d+)?)\s*h(?:rs?|ours?)?)?\s*(?:(\d+)\s*m(?:in(?:s|utes?)?)?)?$/,
  );
  if (clock) minutes = Number(clock[1]) * 60 + Number(clock[2]);
  else if (/^\d*\.?\d+$/.test(value)) minutes = Number(value) * 60;
  else if (parts && (parts[1] || parts[2]))
    minutes = Number(parts[1] || 0) * 60 + Number(parts[2] || 0);
  else return undefined;
  minutes = Math.round(minutes);
  return minutes >= 0 && minutes <= 100000 ? minutes : undefined;
}

/** Hours estimate input. Typed text, saved as whole minutes. */
export function EstimateHoursField({
  minutes,
  onCommit,
  onTextChange,
  size,
  sx,
}: {
  minutes?: number | null;
  /** Called on blur/Enter with the parsed minutes when the value changed. */
  onCommit?: (minutes: number | null) => void;
  /** Called on every keystroke (forms that submit later). */
  onTextChange?: (minutes: number | null | undefined) => void;
  size?: "small" | "medium";
  sx?: SxProps;
}) {
  const [text, setText] = useState(minutesToHoursText(minutes));
  useEffect(() => setText(minutesToHoursText(minutes)), [minutes]);
  const parsed = parseHours(text);
  const invalid = parsed === undefined;

  const commit = () => {
    if (invalid || !onCommit) return;
    if (parsed !== (minutes ?? null)) onCommit(parsed);
    setText(minutesToHoursText(parsed));
  };

  return (
    <TextField
      label="Estimate"
      size={size}
      sx={sx}
      value={text}
      placeholder="e.g. 1.5"
      error={invalid}
      helperText={invalid ? "Try 2, 1.5 or 1:30" : undefined}
      onChange={(event) => {
        setText(event.target.value);
        onTextChange?.(parseHours(event.target.value));
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") (event.target as HTMLInputElement).blur();
      }}
      slotProps={{
        htmlInput: { inputMode: "decimal", autoComplete: "off" },
        input: {
          endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
        },
      }}
    />
  );
}
