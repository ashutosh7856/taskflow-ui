import { createTheme } from "@mui/material/styles";

const ink = "#181817";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: ink, contrastText: "#ffffff" },
    secondary: { main: "#d8ff63", contrastText: ink },
    background: { default: "#f2f0e9", paper: "#fffef9" },
    divider: "#d4d0c5",
    text: { primary: ink, secondary: "#67635b" },
    error: { main: "#b42318" },
    success: { main: "#087443" },
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
        root: { borderRadius: 999, minHeight: 44, paddingInline: 20 },
        containedPrimary: {
          boxShadow: "3px 3px 0 #ff5c35",
          "&:hover": {
            backgroundColor: "#2c2c2a",
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
          border: "1px solid #d4d0c5",
          boxShadow: "none",
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          border: "1px solid #d4d0c5",
          boxShadow: "0 24px 70px rgba(24,24,23,.2)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderLeft: "1px solid #d7d7d0" } },
    },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: "#fffef9",
          "& fieldset": { borderColor: "#969187" },
          "&:hover fieldset": { borderColor: ink },
          "&.Mui-focused fieldset": { borderWidth: 2, borderColor: ink },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 999, fontWeight: 700 } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { background: ink, fontSize: 12 } },
    },
  },
});
