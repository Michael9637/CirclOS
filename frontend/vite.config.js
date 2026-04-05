import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const rawApiUrl = env.VITE_API_URL || "http://localhost:8000";
  const apiUrl = (/^https?:\/\//i.test(rawApiUrl)
    ? rawApiUrl
    : `https://${rawApiUrl}`).replace(/\/+$/, "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/listings": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        "/companies": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
