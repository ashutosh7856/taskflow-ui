import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import SettingsBrightnessRounded from "@mui/icons-material/SettingsBrightnessRounded";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useColorScheme,
} from "@mui/material";

const options = [
  { value: "light", label: "Light", icon: <LightModeRounded /> },
  { value: "dark", label: "Dark", icon: <DarkModeRounded /> },
  { value: "system", label: "Auto", icon: <SettingsBrightnessRounded /> },
] as const;

/** Light / Dark / follow-the-OS picker for the account menu. */
export function ThemeModeSwitch() {
  const { mode, setMode } = useColorScheme();
  if (!mode) return null; // Not resolved yet on first render.
  return (
    <Box sx={{ px: 2, py: 1.25 }}>
      <Typography
        className="mono-label"
        sx={{ color: "var(--muted)", fontSize: 11, mb: 0.75 }}
      >
        Appearance
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={mode}
        onChange={(_, value) => value && setMode(value)}
        aria-label="Colour theme"
        sx={{
          "& .MuiToggleButton-root": {
            gap: 0.5,
            py: 0.6,
            fontWeight: 750,
            fontSize: 12.5,
            textTransform: "none",
            color: "var(--muted)",
            borderColor: "var(--line)",
            "& svg": { fontSize: 16 },
            "&:hover": { bgcolor: "var(--hover)", color: "var(--ink)" },
            "&.Mui-selected, &.Mui-selected:hover": {
              bgcolor: "var(--selected-bg)",
              color: "var(--selected-fg)",
            },
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton
            key={option.value}
            value={option.value}
            aria-label={option.label}
          >
            {option.icon}
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
