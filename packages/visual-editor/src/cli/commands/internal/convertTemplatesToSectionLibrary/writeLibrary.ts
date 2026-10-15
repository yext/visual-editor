import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildEntityLayoutMetadata } from "./conversion.ts";
import {
  REQUIRED_BASE_SECTIONS,
  formatJson,
  isRecord,
  readJson,
  validateDefaultLayout,
} from "./shared.ts";
import type {
  BaseLayout,
  Conversion,
  CopiedComponent,
  LegacyTemplate,
  TemplateHeaderFooter,
} from "./types.ts";

export const replaceLibrary = (
  libraryDirectory: string,
  baseLibraryDirectory: string,
  conversion: Conversion
): void => {
  const parentDirectory = path.dirname(libraryDirectory);
  const stagedDirectory = fs.mkdtempSync(
    path.join(parentDirectory, ".section-library-conversion-")
  );
  const backupDirectory = path.join(
    parentDirectory,
    `.section-library-backup-${process.pid}-${Date.now()}`
  );
  const hasExistingLibrary = fs.existsSync(libraryDirectory);
  try {
    fs.cpSync(baseLibraryDirectory, stagedDirectory, { recursive: true });
    writeConvertedLibrary(stagedDirectory, conversion);
    if (hasExistingLibrary) {
      fs.renameSync(libraryDirectory, backupDirectory);
    }
    try {
      fs.renameSync(stagedDirectory, libraryDirectory);
    } catch (error) {
      if (hasExistingLibrary) {
        fs.renameSync(backupDirectory, libraryDirectory);
      }
      throw error;
    }
    if (hasExistingLibrary) {
      fs.rmSync(backupDirectory, { recursive: true, force: true });
    }
  } catch (error) {
    fs.rmSync(stagedDirectory, { recursive: true, force: true });
    if (fs.existsSync(backupDirectory) && !fs.existsSync(libraryDirectory)) {
      fs.renameSync(backupDirectory, libraryDirectory);
    }
    throw error;
  }
};

const writeConvertedLibrary = (
  libraryDirectory: string,
  conversion: Conversion
): void => {
  fs.rmSync(path.join(libraryDirectory, ".generated"), {
    recursive: true,
    force: true,
  });
  fs.writeFileSync(
    path.join(libraryDirectory, "library.json"),
    formatJson(conversion.libraryMetadata)
  );
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  for (const layout of conversion.baseLibrary.layouts) {
    if (layout.metadata.pageSetType === "ENTITY") {
      fs.rmSync(path.join(layoutsDirectory, path.basename(layout.directory)), {
        recursive: true,
        force: true,
      });
    }
  }
  renameBaseLayout(
    libraryDirectory,
    conversion.baseLibrary.directory,
    conversion.directoryLayoutId,
    conversion.templateHeaderFooter
  );
  renameBaseLayout(
    libraryDirectory,
    conversion.baseLibrary.locator,
    conversion.locatorLayoutId,
    conversion.templateHeaderFooter
  );
  for (const template of conversion.templates) {
    const layoutDirectory = path.join(layoutsDirectory, template.templateId);
    fs.mkdirSync(layoutDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(layoutDirectory, "metadata.json"),
      formatJson(buildEntityLayoutMetadata(template))
    );
    fs.writeFileSync(
      path.join(layoutDirectory, "defaultLayout.json"),
      formatJson(template.defaultLayout)
    );
  }
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  for (const entry of fs.readdirSync(sectionsDirectory, {
    withFileTypes: true,
  })) {
    if (
      entry.isFile() &&
      [".tsx", ".jsx"].includes(path.extname(entry.name)) &&
      !REQUIRED_BASE_SECTIONS.has(
        path.basename(entry.name, path.extname(entry.name))
      )
    ) {
      fs.rmSync(path.join(sectionsDirectory, entry.name));
    }
  }
  for (const component of conversion.components.values()) {
    fs.writeFileSync(
      path.join(sectionsDirectory, `${component.id}.tsx`),
      buildSectionSource(component, conversion.templateHeaderFooter)
    );
  }
};

const renameBaseLayout = (
  libraryDirectory: string,
  layout: BaseLayout,
  layoutId: string,
  templateHeaderFooter: TemplateHeaderFooter
): void => {
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  const currentDirectory = path.join(
    layoutsDirectory,
    path.basename(layout.directory)
  );
  const nextDirectory = path.join(layoutsDirectory, layoutId);
  if (currentDirectory !== nextDirectory) {
    fs.rmSync(nextDirectory, { recursive: true, force: true });
    fs.renameSync(currentDirectory, nextDirectory);
  }
  const metadata = readJson(
    path.join(nextDirectory, "metadata.json"),
    `layout metadata for ${layoutId}`
  );
  if (!isRecord(metadata)) {
    throw new Error(`Layout metadata is not valid: ${layoutId}`);
  }
  fs.writeFileSync(
    path.join(nextDirectory, "metadata.json"),
    formatJson({ ...metadata, id: layoutId })
  );
  const defaultLayoutPath = path.join(nextDirectory, "defaultLayout.json");
  const defaultLayout = readJson(
    defaultLayoutPath,
    `default layout for ${layoutId}`
  );
  validateDefaultLayout(defaultLayout, defaultLayoutPath, "Base");
  fs.writeFileSync(
    defaultLayoutPath,
    formatJson({
      ...defaultLayout,
      content: [
        ...(templateHeaderFooter.header.component
          ? [templateHeaderFooter.header.component]
          : []),
        ...defaultLayout.content,
        ...(templateHeaderFooter.footer.component
          ? [templateHeaderFooter.footer.component]
          : []),
      ],
    })
  );
};

const buildSectionSource = (
  component: CopiedComponent,
  templateHeaderFooter: TemplateHeaderFooter
): string => {
  const supportsAllPageSetTypes = Object.values(templateHeaderFooter).some(
    (selection) => selection.component?.type === component.id
  );

  return [
    'import type { SectionConfig } from "@yext/visual-editor";',
    "",
    component.content.trimEnd(),
    "",
    "export const config: SectionConfig = {",
    `  id: ${JSON.stringify(component.id)},`,
    `  displayName: ${JSON.stringify(component.displayName)},`,
    // The description should default to the display name until a human updates it manually.
    `  description: ${JSON.stringify(component.displayName)},`,
    `  pageSetTypes: ${supportsAllPageSetTypes ? '["ENTITY", "DIRECTORY", "LOCATOR"]' : '["ENTITY"]'},`,
    "};",
    "",
  ].join("\n");
};

export const deleteLegacyTemplates = (
  templates: LegacyTemplate[],
  write: (message: string) => void
): void => {
  for (const template of templates) {
    fs.rmSync(template.directory, { recursive: true });
    write(`Removed ${template.directory}`);
  }
};
