import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Browser verification for streaming creation, independent of Docker screenshots. */
export default defineConfig({
  define: { __VISUAL_EDITOR_TEST__: "true" },
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: { target: "es2022" },
    entries: [
      "src/internal/layoutGeneration/workflows/fullPageGeneration/creationFlow.test.tsx",
      "src/internal/layoutGeneration/chat/preservePreviewScroll.test.ts",
    ],
  },
  test: {
    include: [
      "src/internal/layoutGeneration/workflows/fullPageGeneration/creationFlow.test.tsx",
      "src/internal/layoutGeneration/chat/preservePreviewScroll.test.ts",
    ],
    setupFiles: ["./src/editor/editorTests.setup.ts"],
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
      headless: true,
      screenshotFailures: false,
    },
  },
});
