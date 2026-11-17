import { Box } from "@mui/material";

/** "Included" tick for plan feature lists. */
export function FeatureMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 18,
        height: 18,
        flex: "0 0 18px",
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        bgcolor: inverse ? "rgba(216,255,99,.16)" : "var(--tint-lime)",
        border: inverse
          ? "1px solid rgba(216,255,99,.35)"
          : "1px solid var(--tint-lime-line)",
        mt: "1px",
        // Checkmark drawn with two borders, rotated.
        "&::after": {
          content: '""',
          width: 4,
          height: 8,
          mt: "-2px",
          borderRight: "2px solid",
          borderBottom: "2px solid",
          borderColor: inverse ? "#d8ff63" : "var(--success-ink)",
          transform: "rotate(45deg)",
        },
      }}
    />
  );
}
