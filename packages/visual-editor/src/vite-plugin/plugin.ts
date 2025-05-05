import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import mainTemplate from "./templates/main.tsx?raw";
import editTemplate from "./templates/edit.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import { execSync } from "node:child_process";

// files to generate
const virtualFiles: Record<string, string> = {
  "src/templates/main.tsx": mainTemplate,
  "src/templates/edit.tsx": editTemplate,
  "src/templates/directory.tsx": directoryTemplate,
};

export const yextVisualEditorPlugin = (): Plugin => {
  let isBuildMode = false;
  const filesToCleanup: string[] = [];

  const generateFiles = () => {
    let newFilesWritten = false;

    Object.entries(virtualFiles).forEach(([fileName, content]) => {
      const filePath = path.join(process.cwd(), fileName);
      filesToCleanup.push(filePath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      if (fs.existsSync(filePath)) {
        return;
      }
      fs.writeFileSync(filePath, content);
      newFilesWritten = true;
    });

    if (newFilesWritten) {
      execSync("npx pages generate templates");
    }
  };

  const cleanupFiles = () => {
    filesToCleanup.forEach((filePath) => {
      fs.rmSync(filePath, { force: true });
    });
  };

  // cleanup on interruption (ctrl + C)
  process.on("SIGINT", () => {
    cleanupFiles();
    process.nextTick(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    cleanupFiles();
    process.nextTick(() => process.exit(0));
  });

  return {
    name: "vite-plugin-yext-visual-editor",
    config(_, { command }) {
      isBuildMode = command === "build";
    },
    configureServer(server) {
      if (isBuildMode) {
        return;
      }
      generateFiles();
      server.httpServer?.on("close", () => {
        cleanupFiles();
      });
    },
    buildStart() {
      if (!isBuildMode) {
        return;
      }
      generateFiles();
    },
    buildEnd() {
      if (!isBuildMode) {
        return;
      }
      cleanupFiles();
    },
    closeBundle() {
      if (!isBuildMode) {
        return;
      }
      cleanupFiles();
    },
  };
};
