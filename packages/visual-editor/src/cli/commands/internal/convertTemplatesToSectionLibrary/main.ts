/**
 * Coordinates conversion preflight, dry-run reporting, dependency installation,
 * library replacement, and optional legacy source cleanup.
 */
import fs from "node:fs";
import path from "node:path";
import { prepareBaseLibrary, readBaseLibrary } from "./baseLibrary.ts";
import { buildConversion } from "./conversion.ts";
import {
  inspectGeneratedFiles,
  removeGeneratedFiles,
} from "./generatedFiles.ts";
import { readLegacyTemplates } from "./legacyTemplates.ts";
import {
  installPackageUpgrades,
  planPackageUpgrades,
} from "./packageUpgrades.ts";
import { reportConversion } from "./report.ts";
import { convertStreamConfig } from "./streamConfig.ts";
import { deleteLegacyTemplates, replaceLibrary } from "./writeLibrary.ts";

type ConvertOptions = {
  apply: boolean;
  deleteSource: boolean;
  targetDirectory: string;
  write?: (message: string) => void;
  installDependencies?: (manager: "npm" | "pnpm", directory: string) => void;
};

/**
 * Converts all legacy registry templates into one Section Library.
 *
 * 1. Export missing Directory and Locator source, then validate the base
 *    library and every legacy template.
 * 2. Build one Entity layout per template and one section per component ID.
 * 3. Validate project configuration, generated files, and dependencies before writing.
 * 4. Install matching dependencies and replace the library only after the staged copy is complete.
 * 5. Remove stale source after the converted library is in place.
 */
export const convertTemplatesToSectionLibrary = ({
  apply,
  deleteSource,
  targetDirectory,
  write = console.log,
  installDependencies,
}: ConvertOptions): void => {
  const rootDirectory = path.resolve(targetDirectory);
  const libraryDirectory = path.join(rootDirectory, "src", "library");
  const templates = readLegacyTemplates(rootDirectory);
  const preparedBaseLibrary = prepareBaseLibrary(rootDirectory);
  try {
    const baseLibrary = readBaseLibrary(preparedBaseLibrary.directory);
    const conversion = buildConversion(templates, baseLibrary);
    const streamConfigPath = path.join(rootDirectory, "stream.config.ts");
    const streamConfig = fs.existsSync(streamConfigPath)
      ? convertStreamConfig(
          fs.readFileSync(streamConfigPath, "utf8"),
          streamConfigPath,
          conversion
        )
      : undefined;
    const generatedFiles = inspectGeneratedFiles(rootDirectory, deleteSource);
    const packagePlan = planPackageUpgrades(rootDirectory);
    reportConversion({
      apply,
      conversion,
      deleteSource,
      files: generatedFiles,
      packagePlan,
      preparedBaseLibrary: Boolean(preparedBaseLibrary.temporaryDirectory),
      streamConfigChanged:
        streamConfig !== undefined &&
        streamConfig !== fs.readFileSync(streamConfigPath, "utf8"),
      streamConfigPath,
      templates,
      write,
    });
    if (!apply) {
      return;
    }

    const restorePackageFiles = installPackageUpgrades(
      rootDirectory,
      packagePlan,
      installDependencies
    );
    try {
      replaceLibrary(
        libraryDirectory,
        preparedBaseLibrary.directory,
        conversion
      );
    } catch (error) {
      restorePackageFiles();
      throw error;
    }
    if (streamConfig !== undefined)
      fs.writeFileSync(streamConfigPath, streamConfig);
    removeGeneratedFiles(generatedFiles, deleteSource, write);
    if (deleteSource) {
      deleteLegacyTemplates(templates, write);
    }
  } finally {
    if (preparedBaseLibrary.temporaryDirectory) {
      fs.rmSync(preparedBaseLibrary.temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  }
};
