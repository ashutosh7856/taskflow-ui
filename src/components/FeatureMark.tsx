import { Box } from "@mui/material";

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
        border: inverse ? "1px solid #74716a" : "1px solid #a6a197",
        borderRadius: "5px",
        bgcolor: inverse ? "#282826" : "#f8f6ef",
        mt: "1px",
        "&::after": {
          content: '""',
          width: 7,
          height: 2,
          bgcolor: "#ff5c35",
          borderRadius: 2,
        },
      }}
    />
  );
}
