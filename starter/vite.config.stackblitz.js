import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import yextSSG from "@yext/pages/vite-plugin";

export default defineConfig({
  plugins: [react(), yextSSG()],
  server: {
    // Completely disable HMR in StackBlitz to prevent WebSocket connection errors
    hmr: false,
    // Use polling instead of WebSocket for file watching (if needed)
    watch: {
      usePolling: true,
    },
  },
  // Optimize for StackBlitz environment
  build: {
    // Faster builds for demo purposes
    minify: false,
    sourcemap: true,
  },
});
