import { createTheme } from "@mui/material/styles";

const ink = "#181817";

/**
 * Light + dark schemes. MUI writes data-theme="light|dark" on <html>; our own
 * colour tokens in styles.css key off the same attribute, so MUI components
 * and hand-styled ones switch together. Overrides below use var(--…) tokens
 * rather than hex values for the same reason.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data-theme" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: ink, contrastText: "#ffffff" },
        secondary: { main: "#d8ff63", contrastText: ink },
        background: { default: "#f2f0e9", paper: "#fffef9" },
        divider: "#d4d0c5",
        text: { primary: ink, secondary: "#67635b" },
        error: { main: "#b42318" },
        success: { main: "#087443" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#f2f0e9", contrastText: ink },
        secondary: { main: "#d8ff63", contrastText: ink },
        background: { default: "#121211", paper: "#1c1b19" },
        divider: "#36352f",
        text: { primary: "#f2f0e9", secondary: "#b5b2a8" },
        error: { main: "#ff8a7a" },
        success: { main: "#6fdc9a" },
        warning: { main: "#ffc46b" },
        info: { main: "#8ab4ff" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Manrope, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    h2: { fontWeight: 800, letterSpacing: "-.055em" },
    h4: { fontWeight: 800, letterSpacing: "-.04em" },
    h5: { fontWeight: 800, letterSpacing: "-.025em" },
    h6: { fontWeight: 750, letterSpacing: "-.015em" },
    body1: { lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 750, letterSpacing: "-.01em" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 44,
          paddingInline: 20,
          "@media (max-width:600px)": { paddingInline: 14 },
        },
        containedPrimary: {
          boxShadow: "3px 3px 0 #ff5c35",
          "&:hover": {
            backgroundColor: "var(--primary-hover)",
            transform: "translate(-1px,-1px)",
            boxShadow: "5px 5px 0 #ff5c35",
          },
        },
        outlined: { borderWidth: 1.5, "&:hover": { borderWidth: 1.5 } },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid var(--line)",
          boxShadow: "none",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      // Dark mode would otherwise add a white overlay to elevated paper.
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          border: "1px solid var(--line)",
          boxShadow: "0 24px 70px rgba(0,0,0,.25)",
          "@media (max-width:600px)": {
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            maxHeight: "100%",
            margin: 0,
            borderRadius: 0,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderLeft: "1px solid var(--line)" } },
    },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: "var(--surface)",
          "& fieldset": { borderColor: "var(--field-line)" },
          "&:hover fieldset": { borderColor: "var(--ink)" },
          "&.Mui-focused fieldset": {
            borderWidth: 2,
            borderColor: "var(--ink)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 999, fontWeight: 700 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "var(--panel)",
          border: "1px solid var(--panel-line)",
          color: "#fff",
          fontSize: 12,
        },
      },
    },
  },
});
