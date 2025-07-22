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
      interval: 1000, // Slower polling to reduce CPU usage
    },
    // Reduce memory usage
    fs: {
      strict: false,
    },
    // Disable middleware that might cause issues
    middlewareMode: false,
  },
  // Disable Vite client script injection in StackBlitz
  define: {
    __VITE_CLIENT_SCRIPT__: false,
  },
  // Optimize for StackBlitz environment - reduce memory usage
  build: {
    // Faster builds for demo purposes
    minify: false,
    sourcemap: false, // Disable sourcemaps to save memory
    rollupOptions: {
      // Reduce bundle size
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Disable development-specific features
  optimizeDeps: {
    exclude: ["@vite/client"],
    // Reduce dependency scanning
    include: ["react", "react-dom"],
  },
  // Reduce memory usage
  esbuild: {
    target: "es2020",
    // Disable source maps in dev
    sourcemap: false,
  },
  // Disable CSS processing to save memory
  css: {
    devSourcemap: false,
  },
});
