import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import { getEditTemplate, getMainTemplate } from "./getTemplates.ts";

export const yextVisualEditorPlugin = (): Plugin => {
  if (!process.env.PLUGIN) {
    return {
      name: "vite-plugin-yext-visual-editor",
    };
  }

  const filesToCleanup: string[] = [];

  // files to generate
  const virtualFiles: Record<string, string> = {
    "src/templates/main.tsx": getMainTemplate(),
    "src/templates/edit.tsx": getEditTemplate(),
  };

  return {
    name: "vite-plugin-yext-visual-editor",
    buildStart() {
      console.log("\nGenerating visual editor files...");
      Object.entries(virtualFiles).forEach(([fileName, content]) => {
        const filePath = path.join(process.cwd(), fileName);
        filesToCleanup.push(filePath);
        fs.ensureFileSync(filePath);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created: ${filePath}`);
      });
    },
    buildEnd() {
      console.log("Cleaning up generated files...");
      filesToCleanup.forEach((filePath) => {
        fs.rmSync(filePath, { force: true });
        console.log(`🗑️ Removed: ${filePath}`);
      });
    },
  };
};
