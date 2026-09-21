import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vite serves the web app on :5173. Any request to /api/... is forwarded to the API on :4000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  worker: { format: "es" },
  test: { environment: "node" },
});
