import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendUrl = process.env.VITE_BACKEND_URL || "http://localhost:5180";
const serverPort = process.env.VITE_SERVER_PORT || 5178;

export default defineConfig({
  plugins: [react()],
  server: {
    port: serverPort,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {});
          proxy.on("proxyReq", (proxyReq, req, _res) => {});
          proxy.on("proxyRes", (proxyRes, req, _res) => {});
        },
      },
    },
  },
});
