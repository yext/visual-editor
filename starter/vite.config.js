import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import yextSSG from "@yext/pages/vite-plugin";

// Check if we're running in StackBlitz
const isStackBlitz = process.env.STACKBLITZ === "true";

export default defineConfig({
  plugins: [react(), yextSSG()],
  server: {
    // Completely disable HMR in StackBlitz to prevent WebSocket connection errors
    hmr: isStackBlitz ? false : true,
    // Use polling for file watching in StackBlitz if HMR is disabled
    watch: isStackBlitz
      ? {
          usePolling: true,
          interval: 1000, // Slower polling to reduce CPU usage
        }
      : undefined,
    // Reduce memory usage in StackBlitz
    fs: isStackBlitz ? { strict: false } : undefined,
    // Disable middleware that might cause issues in StackBlitz
    middlewareMode: isStackBlitz ? false : undefined,
    // Prevent WebSocket connections in StackBlitz
    ...(isStackBlitz && {
      hmr: {
        port: null,
        clientPort: null,
        host: null,
        protocol: null,
      },
    }),
  },
  // Disable Vite client script injection in StackBlitz
  define: isStackBlitz
    ? {
        __VITE_CLIENT_SCRIPT__: false,
        __VITE_IS_IMPORT__: false,
        __VITE_HMR__: false,
      }
    : undefined,
  // Optimize for StackBlitz environment - reduce memory usage
  build: isStackBlitz
    ? {
        // Faster builds for demo purposes
        minify: false,
        sourcemap: false, // Disable sourcemaps to save memory
        rollupOptions: {
          // Reduce bundle size
          output: {
            manualChunks: undefined,
          },
        },
      }
    : undefined,
  // Disable development-specific features in StackBlitz
  optimizeDeps: isStackBlitz
    ? {
        exclude: ["@vite/client"],
        // Reduce dependency scanning
        include: ["react", "react-dom"],
      }
    : undefined,
  // Reduce memory usage in StackBlitz
  esbuild: isStackBlitz
    ? {
        target: "es2020",
        // Disable source maps in dev
        sourcemap: false,
      }
    : undefined,
  // Disable CSS processing to save memory in StackBlitz
  css: isStackBlitz
    ? {
        devSourcemap: false,
      }
    : undefined,
});
