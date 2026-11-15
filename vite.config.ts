import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: { port: 5173 },
  build: isSsrBuild
    ? {}
    : {
        rollupOptions: {
          output: {
            manualChunks: {
              react: ["react", "react-dom", "react-router-dom"],
              mui: [
                "@mui/material",
                "@mui/icons-material",
                "@emotion/react",
                "@emotion/styled",
              ],
              data: ["@tanstack/react-query", "axios", "zustand"],
              drag: ["@dnd-kit/core", "@dnd-kit/utilities"],
              motion: ["motion"],
            },
          },
        },
      },
}));
