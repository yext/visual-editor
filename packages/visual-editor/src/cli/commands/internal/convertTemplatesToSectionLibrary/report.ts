/** Reports the conversion plan, including layout choices and project setup changes. */
import fs from "node:fs";
import type { Conversion, LegacyTemplate } from "./types.ts";
import type { inspectGeneratedFiles } from "./generatedFiles.ts";
import type { planPackageUpgrades } from "./packageUpgrades.ts";

/** Reports converted layouts, shared sections, conflicts, and cleanup choices. */
export const reportConversion = ({
  apply,
  conversion,
  deleteSource,
  files,
  packagePlan,
  preparedBaseLibrary,
  streamConfigChanged,
  streamConfigPath,
  templates,
  write,
}: {
  apply: boolean;
  conversion: Conversion;
  deleteSource: boolean;
  files: ReturnType<typeof inspectGeneratedFiles>;
  packagePlan: ReturnType<typeof planPackageUpgrades>;
  preparedBaseLibrary: boolean;
  streamConfigChanged: boolean;
  streamConfigPath: string;
  templates: LegacyTemplate[];
  write: (message: string) => void;
}): void => {
  if (preparedBaseLibrary) {
    write(
      "Directory and Locator source will be added to the converted library."
    );
  }
  write(
    apply
      ? "Applying Section Library conversion:"
      : "Dry run: no files changed."
  );
  write(
    `  library: ${conversion.libraryMetadata.id} from ${conversion.templates[0].templateId}`
  );
  write(
    `  Entity layouts: ${conversion.templates.map((template) => template.templateId).join(", ")}`
  );
  write(
    `  shared sections: ${Array.from(conversion.components.keys()).join(", ")}`
  );
  for (const duplicate of conversion.duplicates) {
    write(
      `  duplicate section ${duplicate.componentId}: kept ${duplicate.keptTemplateId}, ignored ${duplicate.ignoredTemplateId}${duplicate.differs ? " (source differs)" : ""}`
    );
  }
  const headerFooterUsage = Object.values(conversion.templateHeaderFooter)
    .map((selection) => selection.component?.type ?? `no ${selection.kind}`)
    .join(" and ");
  write(
    `  Directory layout: ${conversion.directoryLayoutId} (using ${headerFooterUsage})`
  );
  write(
    `  Locator layout: ${conversion.locatorLayoutId} (using ${headerFooterUsage})`
  );
  write(
    deleteSource
      ? "  legacy source: remove after conversion"
      : "  legacy source: keep"
  );
  for (const selection of Object.values(conversion.templateHeaderFooter)) {
    if (selection.component) {
      continue;
    }
    if (selection.matches.length === 0) {
      write(
        `  Warning: ${selection.kind} will not be copied because ${conversion.templates[0].templateId} has no top-level type containing ${selection.kind}`
      );
    } else {
      write(
        `  Warning: ${selection.kind} will not be copied because ${conversion.templates[0].templateId} has multiple top-level matches: ${selection.matches.join(", ")}`
      );
    }
  }
  if (streamConfigChanged) {
    write(
      `  update ${streamConfigPath}: templates/templateId to layouts/layoutId`
    );
  }
  for (const { name, previous, next } of packagePlan.upgrades) {
    write(
      `  dependency (${packagePlan.manager}): ${name} ${previous ?? "(missing)"} -> ${next}`
    );
  }
  write(`  update ${packagePlan.lockPath}`);
  if (fs.existsSync(files.manifestPath)) {
    write(`  remove ${files.manifestPath}`);
  }
  if (deleteSource) {
    for (const filePath of files.templates) write(`  remove ${filePath}`);
    for (const template of templates) write(`  remove ${template.directory}`);
  }
};
