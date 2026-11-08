import { Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function Brand({
  linked = false,
  light = false,
  to = "/",
}: {
  linked?: boolean;
  light?: boolean;
  to?: string;
}) {
  return (
    <Stack
      component={linked ? Link : "div"}
      to={linked ? to : undefined}
      direction="row"
      alignItems="center"
      spacing={0.9}
      sx={{
        color: light ? "#f7f6f1" : "#181817",
        textDecoration: "none",
        width: "fit-content",
      }}
      aria-label={linked ? "Danto home" : undefined}
    >
      <Box
        component="img"
        src="/assets/danto-mark.png"
        alt=""
        aria-hidden="true"
        sx={{
          width: 32,
          height: 32,
          objectFit: "contain",
        }}
      />
      <Typography fontSize={20} fontWeight={850} letterSpacing="-.055em">
        danto
      </Typography>
    </Stack>
  );
}
