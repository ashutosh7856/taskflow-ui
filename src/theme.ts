import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb", dark: "#1d4ed8", light: "#60a5fa" },
    secondary: { main: "#7c3aed" },
    background: { default: "#f7f8fc", paper: "#ffffff" },
    divider: "#e6e9f0",
    text: { primary: "#172033", secondary: "#667085" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 750, letterSpacing: "-.035em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 650 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 11, minHeight: 40, paddingInline: 16 },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 40, minHeight: 40 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e7e9f0",
          boxShadow: "0 8px 24px rgba(15,23,42,.06)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { backgroundImage: "none" } },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
  },
});
