import { createTheme } from "@mui/material/styles";

const ink = "#25304f";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: ink, contrastText: "#ffffff" },
    secondary: { main: "#bcebd2", contrastText: ink },
    background: { default: "#f4f4f0", paper: "#ffffff" },
    divider: "#d7d7d0",
    text: { primary: ink, secondary: "#565650" },
    error: { main: "#b42318" },
    success: { main: "#087443" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
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
        root: { borderRadius: 7, minHeight: 44, paddingInline: 18 },
        containedPrimary: { "&:hover": { backgroundColor: "#343434" } },
        outlined: { borderWidth: 1.5, "&:hover": { borderWidth: 1.5 } },
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiCard: { styleOverrides: { root: { border: "1px solid #d7d7d0", boxShadow: "none" } } },
    MuiDialog: { styleOverrides: { paper: { backgroundImage: "none", border: "1px solid #d7d7d0", boxShadow: "0 24px 70px rgba(37,48,79,.18)" } } },
    MuiDrawer: { styleOverrides: { paper: { borderLeft: "1px solid #d7d7d0" } } },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiOutlinedInput: { styleOverrides: { root: { background: "#fff", "& fieldset": { borderColor: "#8a8a82" }, "&:hover fieldset": { borderColor: ink }, "&.Mui-focused fieldset": { borderWidth: 2, borderColor: ink } } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 5, fontWeight: 700 } } },
    MuiTooltip: { styleOverrides: { tooltip: { background: ink, fontSize: 12 } } },
  },
});
