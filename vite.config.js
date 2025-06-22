import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allow all ngrok hosts
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      // Add your specific ngrok host if needed
      'ec2b-110-226-178-139.ngrok-free.app'
    ],
    // Optional: Configure CORS if needed
    cors: true,
    // Optional: Enable HTTPS
    
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      cesium: 'cesium/Source',
    },
  },
});
