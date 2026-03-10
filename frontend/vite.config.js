import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5178,
    proxy: {
      "/api": {
        target: "http://localhost:5180", // Updated to backend port
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
          });
        },
      },
    },
  },
});
