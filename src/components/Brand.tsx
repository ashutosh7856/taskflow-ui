import { Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function Brand({
  linked = false,
  light = false,
}: {
  linked?: boolean;
  light?: boolean;
}) {
  return (
    <Stack
      component={linked ? Link : "div"}
      to={linked ? "/" : undefined}
      direction="row"
      alignItems="center"
      spacing={0.9}
      sx={{
        color: light ? "#f7f6f1" : "#181817",
        textDecoration: "none",
        width: "fit-content",
      }}
      aria-label={linked ? "TaskFlow home" : undefined}
    >
      <Box
        aria-hidden
        sx={{
          width: 11,
          height: 11,
          bgcolor: "#ff5c35",
          borderRadius: "3px 7px 3px 7px",
          transform: "rotate(12deg)",
          boxShadow: "4px 4px 0 #d8ff63",
        }}
      />
      <Typography fontSize={20} fontWeight={850} letterSpacing="-.055em">
        taskflow
      </Typography>
    </Stack>
  );
}
