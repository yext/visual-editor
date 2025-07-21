import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import yextSSG from "@yext/pages/vite-plugin";

// Check if we're running in StackBlitz
const isStackBlitz =
  process.env.STACKBLITZ === "true" ||
  (process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    window.location?.hostname?.includes("webcontainer.io"));

export default defineConfig({
  plugins: [react(), yextSSG()],
  server: {
    // Disable HMR in StackBlitz to prevent WebSocket connection errors
    hmr: isStackBlitz ? false : true,
    // Use polling for file watching in StackBlitz if HMR is disabled
    watch: isStackBlitz
      ? {
          usePolling: true,
        }
      : undefined,
  },
});
