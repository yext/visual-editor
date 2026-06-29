import fs from "fs-extra";

const cleanupFilePaths = new Set<string>();
let cleanupSignalHandlersRegistered = false;

const registerCleanupSignalHandlers = () => {
  if (cleanupSignalHandlersRegistered) {
    return;
  }

  const cleanupGeneratedFiles = () => {
    for (const filePath of cleanupFilePaths) {
      fs.rmSync(filePath, { force: true });
    }
    cleanupFilePaths.clear();
  };

  process.on("SIGINT", () => {
    cleanupGeneratedFiles();
    process.nextTick(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    cleanupGeneratedFiles();
    process.nextTick(() => process.exit(0));
  });

  cleanupSignalHandlersRegistered = true;
};

export const createGeneratedFileCleanupTracker = () => {
  registerCleanupSignalHandlers();

  const filesToCleanup = new Set<string>();

  return {
    track(filePath: string) {
      filesToCleanup.add(filePath);
      cleanupFilePaths.add(filePath);
    },
    cleanup() {
      for (const filePath of filesToCleanup) {
        fs.rmSync(filePath, { force: true });
        cleanupFilePaths.delete(filePath);
      }
      filesToCleanup.clear();
    },
  };
};
