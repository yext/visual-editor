import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import { editTemplate, mainTemplate } from "./getTemplates.ts";

export const yextVisualEditorPlugin = (): Plugin => {
  let isBuildMode = false;
  const filesToCleanup: string[] = [];

  // files to generate
  const virtualFiles: Record<string, string> = {
    "src/templates/main.tsx": mainTemplate,
    "src/templates/edit.tsx": editTemplate,
  };

  const generateFiles = () => {
    Object.entries(virtualFiles).forEach(([fileName, content]) => {
      const filePath = path.join(process.cwd(), fileName);
      filesToCleanup.push(filePath);
      fs.writeFileSync(filePath, content);
    });
  };

  const cleanupFiles = () => {
    filesToCleanup.forEach((filePath) => {
      fs.rmSync(filePath, { force: true });
    });
  };

  // cleanup on interruption (ctrl + C)
  process.on("SIGINT", () => {
    cleanupFiles();
    setTimeout(() => process.exit(0), 100); // without this cleanup doesn't finish before process.exit
  });

  return {
    name: "vite-plugin-yext-visual-editor",
    apply: "serve",
    configureServer(server) {
      if (isBuildMode) return;
      generateFiles();
      server.httpServer?.on("close", () => {
        cleanupFiles();
      });
    },
    config(_, { command }) {
      isBuildMode = command === "build";
    },
    buildStart() {
      if (!isBuildMode) return;
      generateFiles();
    },
    buildEnd() {
      if (!isBuildMode) return;
      cleanupFiles();
    },
    closeBundle() {
      if (!isBuildMode) return;
      cleanupFiles();
    },
  };
};
