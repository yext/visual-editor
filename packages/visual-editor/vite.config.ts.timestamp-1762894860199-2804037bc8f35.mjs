// vite.config.ts
import react from "file:///Users/cdemetriou/visual-editor/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.19_@types+node@20.19.11_/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///Users/cdemetriou/visual-editor/node_modules/.pnpm/vite@5.4.19_@types+node@20.19.11/node_modules/vite/dist/node/index.js";
import path2 from "node:path";
import { exec } from "node:child_process";

// src/components/testing/compareScreenshot.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "file:///Users/cdemetriou/visual-editor/node_modules/.pnpm/pixelmatch@7.1.0/node_modules/pixelmatch/index.js";
import { PNG } from "file:///Users/cdemetriou/visual-editor/node_modules/.pnpm/pngjs@7.0.0/node_modules/pngjs/lib/png.js";
var compareScreenshot = (
  _,
  screenshotName,
  updatedScreenshotData,
  customThreshold,
  ignoreExact
) => {
  const filePath = path.join(
    process.cwd(),
    `src/components/testing/screenshots/${screenshotName}.png`
  );
  const updatedScreenshotBuffer = Buffer.from(updatedScreenshotData, "base64");
  const updatedImg = PNG.sync.read(updatedScreenshotBuffer);
  let baselineBuffer, baselineImg;
  try {
    baselineBuffer = readFileSync(filePath);
    baselineImg = PNG.sync.read(baselineBuffer);
  } catch (_2) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, PNG.sync.write(updatedImg));
    return {
      pass: false,
      message: () => `Baseline screenshot created for ${filePath}`,
    };
  }
  const { width, height } = baselineImg;
  const diff = new PNG({ width, height });
  if (height !== updatedImg.height) {
    console.warn(
      `Screenshot heights did not match (existing ${height}, updated ${height})`
    );
    writeFileSync(filePath, PNG.sync.write(updatedImg));
    return Math.abs(updatedImg.height - height) * width;
  }
  const numDiffPixels = pixelmatch(
    baselineImg.data,
    updatedImg.data,
    diff.data,
    width,
    height,
    { threshold: 0.3 }
    // the per-pixel color difference threshold
  );
  if ((ignoreExact ?? []).includes(numDiffPixels)) {
    return { passes: true, numDiffPixels };
  }
  if (numDiffPixels > (customThreshold ?? 0)) {
    writeFileSync(filePath, PNG.sync.write(updatedImg));
    return { passes: false, numDiffPixels };
  }
  return { passes: true, numDiffPixels };
};

// vite.config.ts
var __vite_injected_original_dirname =
  "/Users/cdemetriou/visual-editor/packages/visual-editor";
var vite_config_default = defineConfig(() => ({
  define: {
    __VISUAL_EDITOR_TEST__: JSON.stringify(!!process.env.VITEST),
  },
  plugins: [react(), ...(process.env.VITEST ? [cssStubPlugin] : [dts()])],
  resolve: {
    alias: {
      "@yext/visual-editor": path2.resolve(
        __vite_injected_original_dirname,
        "src"
      ),
    },
  },
  build: {
    cssCodeSplit: true,
    lib: {
      entry: path2.resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "visual-editor",
      formats: ["es", "cjs"],
      // typescript is unhappy without this forced type definition
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@measured/puck",
        "uuid",
        "@yext/pages-components",
        "mapbox-gl",
        "@yext/search-headless-react",
        "@yext/search-ui-react",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      input: {
        editor: path2.resolve(__vite_injected_original_dirname, "src/index.ts"),
        style: path2.resolve(
          __vite_injected_original_dirname,
          "src/components/styles.css"
        ),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    env: {
      COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY:
        process.env.COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
      COMPONENT_TESTS_MAPBOX_API_KEY: "dummy",
      COMPONENT_TESTS_SEARCH_API_KEY:
        process.env.COMPONENT_TESTS_SEARCH_API_KEY,
      COMPONENT_TESTS_REVIEWS_APP_API_KEY:
        process.env.COMPONENT_TESTS_REVIEWS_APP_API_KEY,
      COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY:
        process.env.COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY,
    },
    setupFiles: ["./src/editor/editorTests.setup.ts"],
    css: true,
    browser: {
      enabled: true,
      instances: [{ browser: "chromium" }],
      provider: "playwright",
      headless: true,
      screenshotFailures: false,
      commands: {
        compareScreenshot,
      },
    },
  },
}));
var dts = () => ({
  name: "dts",
  buildEnd: (error) => {
    if (error) {
      return;
    }
    exec("tsup src/index.ts --format esm,cjs --dts-only", (err) => {
      if (err) {
        throw new Error("Failed to generate declaration files");
      }
    });
  },
});
var cssStubPlugin = {
  name: "css-stub",
  enforce: "pre",
  resolveId(id) {
    if (
      (id.endsWith(".css") || id.endsWith(".scss")) &&
      !id.endsWith("componentTests.css") &&
      !id.endsWith("style.css")
    ) {
      return id;
    }
  },
  load(id) {
    if (
      (id.endsWith(".css") || id.endsWith(".scss")) &&
      !id.endsWith("componentTests.css") &&
      !id.endsWith("style.css")
    ) {
      return "export default {}";
    }
  },
};
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL2NvbXBvbmVudHMvdGVzdGluZy9jb21wYXJlU2NyZWVuc2hvdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9jZGVtZXRyaW91L3Zpc3VhbC1lZGl0b3IvcGFja2FnZXMvdmlzdWFsLWVkaXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2NkZW1ldHJpb3UvdmlzdWFsLWVkaXRvci9wYWNrYWdlcy92aXN1YWwtZWRpdG9yL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9jZGVtZXRyaW91L3Zpc3VhbC1lZGl0b3IvcGFja2FnZXMvdmlzdWFsLWVkaXRvci92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IExpYnJhcnlGb3JtYXRzLCBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IGNvbXBhcmVTY3JlZW5zaG90IH0gZnJvbSBcIi4vc3JjL2NvbXBvbmVudHMvdGVzdGluZy9jb21wYXJlU2NyZWVuc2hvdC50c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKCkgPT4gKHtcbiAgZGVmaW5lOiB7XG4gICAgX19WSVNVQUxfRURJVE9SX1RFU1RfXzogSlNPTi5zdHJpbmdpZnkoISFwcm9jZXNzLmVudi5WSVRFU1QpLFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgLi4uKHByb2Nlc3MuZW52LlZJVEVTVCA/IFtjc3NTdHViUGx1Z2luXSA6IFtkdHMoKV0pXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkB5ZXh0L3Zpc3VhbC1lZGl0b3JcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICBuYW1lOiBcInZpc3VhbC1lZGl0b3JcIixcbiAgICAgIGZvcm1hdHM6IFtcImVzXCIsIFwiY2pzXCJdIGFzIExpYnJhcnlGb3JtYXRzW10sIC8vIHR5cGVzY3JpcHQgaXMgdW5oYXBweSB3aXRob3V0IHRoaXMgZm9yY2VkIHR5cGUgZGVmaW5pdGlvblxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgICBcIkBtZWFzdXJlZC9wdWNrXCIsXG4gICAgICAgIFwidXVpZFwiLFxuICAgICAgICBcIkB5ZXh0L3BhZ2VzLWNvbXBvbmVudHNcIixcbiAgICAgICAgXCJtYXBib3gtZ2xcIixcbiAgICAgICAgXCJAeWV4dC9zZWFyY2gtaGVhZGxlc3MtcmVhY3RcIixcbiAgICAgICAgXCJAeWV4dC9zZWFyY2gtdWktcmVhY3RcIixcbiAgICAgIF0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHJlYWN0OiBcIlJlYWN0XCIsXG4gICAgICAgICAgXCJyZWFjdC1kb21cIjogXCJSZWFjdERPTVwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIGVkaXRvcjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICAgIHN0eWxlOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9jb21wb25lbnRzL3N0eWxlcy5jc3NcIiksXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgZW52OiB7XG4gICAgICBDT01QT05FTlRfVEVTVFNfVklTVUFMX0VESVRPUl9BUFBfQVBJX0tFWTpcbiAgICAgICAgcHJvY2Vzcy5lbnYuQ09NUE9ORU5UX1RFU1RTX1ZJU1VBTF9FRElUT1JfQVBQX0FQSV9LRVksXG4gICAgICBDT01QT05FTlRfVEVTVFNfTUFQQk9YX0FQSV9LRVk6IFwiZHVtbXlcIixcbiAgICAgIENPTVBPTkVOVF9URVNUU19TRUFSQ0hfQVBJX0tFWTpcbiAgICAgICAgcHJvY2Vzcy5lbnYuQ09NUE9ORU5UX1RFU1RTX1NFQVJDSF9BUElfS0VZLFxuICAgICAgQ09NUE9ORU5UX1RFU1RTX1JFVklFV1NfQVBQX0FQSV9LRVk6XG4gICAgICAgIHByb2Nlc3MuZW52LkNPTVBPTkVOVF9URVNUU19SRVZJRVdTX0FQUF9BUElfS0VZLFxuICAgICAgQ09NUE9ORU5UX1RFU1RTX01BUEJPWF9TVEFUSUNfTUFQX0tFWTpcbiAgICAgICAgcHJvY2Vzcy5lbnYuQ09NUE9ORU5UX1RFU1RTX01BUEJPWF9TVEFUSUNfTUFQX0tFWSxcbiAgICB9LFxuICAgIHNldHVwRmlsZXM6IFtcIi4vc3JjL2VkaXRvci9lZGl0b3JUZXN0cy5zZXR1cC50c1wiXSxcbiAgICBjc3M6IHRydWUsXG4gICAgYnJvd3Nlcjoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGluc3RhbmNlczogW3sgYnJvd3NlcjogXCJjaHJvbWl1bVwiIH1dLFxuICAgICAgcHJvdmlkZXI6IFwicGxheXdyaWdodFwiLFxuICAgICAgaGVhZGxlc3M6IHRydWUsXG4gICAgICBzY3JlZW5zaG90RmFpbHVyZXM6IGZhbHNlLFxuICAgICAgY29tbWFuZHM6IHtcbiAgICAgICAgY29tcGFyZVNjcmVlbnNob3QsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7XG5cbi8qKiBBIGN1c3RvbSBwbHVnaW4gdG8gZ2VuZXJhdGUgVFMgdHlwZXMgdXNpbmcgdHN1cCAqL1xuY29uc3QgZHRzID0gKCk6IFBsdWdpbiA9PiAoe1xuICBuYW1lOiBcImR0c1wiLFxuICBidWlsZEVuZDogKGVycm9yKSA9PiB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXhlYyhcInRzdXAgc3JjL2luZGV4LnRzIC0tZm9ybWF0IGVzbSxjanMgLS1kdHMtb25seVwiLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBnZW5lcmF0ZSBkZWNsYXJhdGlvbiBmaWxlc1wiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbn0pO1xuXG4vKipcbiAqIEEgY3VzdG9tIHBsdWdpbiB0byBzdHViIG91dCBDU1MvU0NTUyBpbXBvcnRzIGR1cmluZyBWaXRlc3QgcnVucyxcbiAqIGV4Y2VwdCBmb3IgY29tcG9uZW50VGVzdHMuY3NzIGFuZCBzdHlsZS5jc3MuIFRoaXMgZW5zdXJlcyB0aGF0XG4gKiB0aGUgY3NzIGFwcGxpZWQgZHVyaW5nIHRlc3RzIGlzIHRoZSBzYW1lIGNzcyBhcHBsaWVkIHRoZSBwYWdlIHRlbXBsYXRlcy5cbiAqL1xuY29uc3QgY3NzU3R1YlBsdWdpbjogUGx1Z2luID0ge1xuICBuYW1lOiBcImNzcy1zdHViXCIsXG4gIGVuZm9yY2U6IFwicHJlXCIsXG4gIHJlc29sdmVJZChpZDogc3RyaW5nKSB7XG4gICAgaWYgKFxuICAgICAgKGlkLmVuZHNXaXRoKFwiLmNzc1wiKSB8fCBpZC5lbmRzV2l0aChcIi5zY3NzXCIpKSAmJlxuICAgICAgIWlkLmVuZHNXaXRoKFwiY29tcG9uZW50VGVzdHMuY3NzXCIpICYmXG4gICAgICAhaWQuZW5kc1dpdGgoXCJzdHlsZS5jc3NcIilcbiAgICApIHtcbiAgICAgIHJldHVybiBpZDtcbiAgICB9XG4gIH0sXG4gIGxvYWQoaWQ6IHN0cmluZykge1xuICAgIGlmIChcbiAgICAgIChpZC5lbmRzV2l0aChcIi5jc3NcIikgfHwgaWQuZW5kc1dpdGgoXCIuc2Nzc1wiKSkgJiZcbiAgICAgICFpZC5lbmRzV2l0aChcImNvbXBvbmVudFRlc3RzLmNzc1wiKSAmJlxuICAgICAgIWlkLmVuZHNXaXRoKFwic3R5bGUuY3NzXCIpXG4gICAgKSB7XG4gICAgICByZXR1cm4gXCJleHBvcnQgZGVmYXVsdCB7fVwiO1xuICAgIH1cbiAgfSxcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9jZGVtZXRyaW91L3Zpc3VhbC1lZGl0b3IvcGFja2FnZXMvdmlzdWFsLWVkaXRvci9zcmMvY29tcG9uZW50cy90ZXN0aW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvY2RlbWV0cmlvdS92aXN1YWwtZWRpdG9yL3BhY2thZ2VzL3Zpc3VhbC1lZGl0b3Ivc3JjL2NvbXBvbmVudHMvdGVzdGluZy9jb21wYXJlU2NyZWVuc2hvdC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvY2RlbWV0cmlvdS92aXN1YWwtZWRpdG9yL3BhY2thZ2VzL3Zpc3VhbC1lZGl0b3Ivc3JjL2NvbXBvbmVudHMvdGVzdGluZy9jb21wYXJlU2NyZWVuc2hvdC50c1wiO2ltcG9ydCB7IG1rZGlyU3luYywgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcbmltcG9ydCBwaXhlbG1hdGNoIGZyb20gXCJwaXhlbG1hdGNoXCI7XG5pbXBvcnQgeyBQTkcgfSBmcm9tIFwicG5nanNcIjtcbmltcG9ydCB0eXBlIHsgQnJvd3NlckNvbW1hbmQgfSBmcm9tIFwidml0ZXN0L25vZGVcIjtcblxuZXhwb3J0IGNvbnN0IGNvbXBhcmVTY3JlZW5zaG90OiBCcm93c2VyQ29tbWFuZDxcbiAgW1xuICAgIHNjcmVlbnNob3ROYW1lOiBzdHJpbmcsXG4gICAgdXBkYXRlZFNjcmVlbnNob3REYXRhOiBzdHJpbmcsXG4gICAgY3VzdG9tVGhyZXNob2xkOiBudW1iZXIgfCB1bmRlZmluZWQsXG4gICAgaWdub3JlRXhhY3Q6IG51bWJlcltdIHwgdW5kZWZpbmVkLFxuICBdXG4+ID0gKFxuICBfLFxuICBzY3JlZW5zaG90TmFtZSxcbiAgdXBkYXRlZFNjcmVlbnNob3REYXRhLFxuICBjdXN0b21UaHJlc2hvbGQsXG4gIGlnbm9yZUV4YWN0XG4pID0+IHtcbiAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oXG4gICAgcHJvY2Vzcy5jd2QoKSxcbiAgICBgc3JjL2NvbXBvbmVudHMvdGVzdGluZy9zY3JlZW5zaG90cy8ke3NjcmVlbnNob3ROYW1lfS5wbmdgXG4gICk7XG5cbiAgY29uc3QgdXBkYXRlZFNjcmVlbnNob3RCdWZmZXIgPSBCdWZmZXIuZnJvbSh1cGRhdGVkU2NyZWVuc2hvdERhdGEsIFwiYmFzZTY0XCIpO1xuICBjb25zdCB1cGRhdGVkSW1nID0gUE5HLnN5bmMucmVhZCh1cGRhdGVkU2NyZWVuc2hvdEJ1ZmZlcik7XG5cbiAgbGV0IGJhc2VsaW5lQnVmZmVyLCBiYXNlbGluZUltZztcbiAgdHJ5IHtcbiAgICBiYXNlbGluZUJ1ZmZlciA9IHJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XG4gICAgYmFzZWxpbmVJbWcgPSBQTkcuc3luYy5yZWFkKGJhc2VsaW5lQnVmZmVyKTtcbiAgfSBjYXRjaCAoXykge1xuICAgIC8vIElmIGJhc2VsaW5lIGRvZXNuJ3QgZXhpc3QsIHNhdmUgbmV3IHNjcmVlbnNob3QgYXMgYmFzZWxpbmVcbiAgICBta2RpclN5bmMocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgd3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgUE5HLnN5bmMud3JpdGUodXBkYXRlZEltZykpO1xuICAgIHJldHVybiB7XG4gICAgICBwYXNzOiBmYWxzZSxcbiAgICAgIG1lc3NhZ2U6ICgpID0+IGBCYXNlbGluZSBzY3JlZW5zaG90IGNyZWF0ZWQgZm9yICR7ZmlsZVBhdGh9YCxcbiAgICB9O1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBkaWZmIGltYWdlXG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gYmFzZWxpbmVJbWc7XG4gIGNvbnN0IGRpZmYgPSBuZXcgUE5HKHsgd2lkdGgsIGhlaWdodCB9KTtcblxuICBpZiAoaGVpZ2h0ICE9PSB1cGRhdGVkSW1nLmhlaWdodCkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGBTY3JlZW5zaG90IGhlaWdodHMgZGlkIG5vdCBtYXRjaCAoZXhpc3RpbmcgJHtoZWlnaHR9LCB1cGRhdGVkICR7aGVpZ2h0fSlgXG4gICAgKTtcbiAgICB3cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBQTkcuc3luYy53cml0ZSh1cGRhdGVkSW1nKSk7XG4gICAgcmV0dXJuIE1hdGguYWJzKHVwZGF0ZWRJbWcuaGVpZ2h0IC0gaGVpZ2h0KSAqIHdpZHRoO1xuICB9XG5cbiAgY29uc3QgbnVtRGlmZlBpeGVscyA9IHBpeGVsbWF0Y2goXG4gICAgYmFzZWxpbmVJbWcuZGF0YSxcbiAgICB1cGRhdGVkSW1nLmRhdGEsXG4gICAgZGlmZi5kYXRhLFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICB7IHRocmVzaG9sZDogMC4zIH0gLy8gdGhlIHBlci1waXhlbCBjb2xvciBkaWZmZXJlbmNlIHRocmVzaG9sZFxuICApO1xuXG4gIGlmICgoaWdub3JlRXhhY3QgPz8gW10pLmluY2x1ZGVzKG51bURpZmZQaXhlbHMpKSB7XG4gICAgcmV0dXJuIHsgcGFzc2VzOiB0cnVlLCBudW1EaWZmUGl4ZWxzIH07XG4gIH1cblxuICBpZiAobnVtRGlmZlBpeGVscyA+IChjdXN0b21UaHJlc2hvbGQgPz8gMCkpIHtcbiAgICAvLyBzYXZlIHRoZSB1cGRhdGVkIHNjcmVlbnNob3RcbiAgICB3cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBQTkcuc3luYy53cml0ZSh1cGRhdGVkSW1nKSk7XG4gICAgcmV0dXJuIHsgcGFzc2VzOiBmYWxzZSwgbnVtRGlmZlBpeGVscyB9O1xuICB9XG5cbiAgcmV0dXJuIHsgcGFzc2VzOiB0cnVlLCBudW1EaWZmUGl4ZWxzIH07XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixPQUFPLFdBQVc7QUFDdFcsU0FBeUIsb0JBQW9CO0FBQzdDLE9BQU9BLFdBQVU7QUFFakIsU0FBUyxZQUFZOzs7QUNKZ1osU0FBUyxXQUFXLGNBQWMscUJBQXFCO0FBQzVkLE9BQU8sVUFBVTtBQUNqQixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLFdBQVc7QUFHYixJQUFNLG9CQU9ULENBQ0YsR0FDQSxnQkFDQSx1QkFDQSxpQkFDQSxnQkFDRztBQUNILFFBQU0sV0FBVyxLQUFLO0FBQUEsSUFDcEIsUUFBUSxJQUFJO0FBQUEsSUFDWixzQ0FBc0MsY0FBYztBQUFBLEVBQ3REO0FBRUEsUUFBTSwwQkFBMEIsT0FBTyxLQUFLLHVCQUF1QixRQUFRO0FBQzNFLFFBQU0sYUFBYSxJQUFJLEtBQUssS0FBSyx1QkFBdUI7QUFFeEQsTUFBSSxnQkFBZ0I7QUFDcEIsTUFBSTtBQUNGLHFCQUFpQixhQUFhLFFBQVE7QUFDdEMsa0JBQWMsSUFBSSxLQUFLLEtBQUssY0FBYztBQUFBLEVBQzVDLFNBQVNDLElBQUc7QUFFVixjQUFVLEtBQUssUUFBUSxRQUFRLEdBQUcsRUFBRSxXQUFXLEtBQUssQ0FBQztBQUNyRCxrQkFBYyxVQUFVLElBQUksS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUNsRCxXQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixTQUFTLE1BQU0sbUNBQW1DLFFBQVE7QUFBQSxJQUM1RDtBQUFBLEVBQ0Y7QUFHQSxR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
