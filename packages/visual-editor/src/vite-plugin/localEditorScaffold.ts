import path from "node:path";
import fs from "fs-extra";

const DIRECTORY_TEMPLATE_ID = "directory";
const LOCATOR_TEMPLATE_ID = "locator";

type TemplateManifestFile = {
  templates?: Array<{
    name?: string;
  }>;
};

export const buildLocalEditorScaffoldSource = (rootDir: string): string => {
  const discoveredTemplateIds = readScaffoldTemplateIds(rootDir);
  const templateIds = orderScaffoldTemplateIds(discoveredTemplateIds);
  const defaultTemplateId = templateIds.includes(DIRECTORY_TEMPLATE_ID)
    ? DIRECTORY_TEMPLATE_ID
    : (templateIds[0] ?? DIRECTORY_TEMPLATE_ID);
  const templateBlocks = templateIds
    .map((templateId) => {
      if (templateId === DIRECTORY_TEMPLATE_ID) {
        return buildDirectoryTemplateBlock();
      }

      if (templateId === LOCATOR_TEMPLATE_ID) {
        return buildLocatorTemplateBlock();
      }

      return buildGenericTemplateBlock(templateId);
    })
    .join("\n");

  return `${[
    'import type { LocalEditorConfig } from "@yext/visual-editor/plugin";',
    "",
    "const baseLocationStream = {",
    '  filter: { entityTypes: ["location"] },',
    "  fields: [",
    '    "id",',
    '    "uid",',
    '    "meta",',
    '    "slug",',
    '    "name",',
    '    "address",',
    '    "hours",',
    '    "mainPhone",',
    '    "timezone",',
    "  ],",
    "  localization: {",
    '    locales: ["en"],',
    "  },",
    "};",
    "",
    "const config = {",
    "  defaults: {",
    `    templateId: ${JSON.stringify(defaultTemplateId)},`,
    '    locale: "en",',
    "  },",
    "  templates: {",
    templateBlocks,
    "  },",
    "} satisfies LocalEditorConfig;",
    "",
    "export default config;",
    "",
  ].join("\n")}`;
};

const readScaffoldTemplateIds = (rootDir: string): string[] => {
  const manifestPath = path.join(rootDir, ".template-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return [DIRECTORY_TEMPLATE_ID, LOCATOR_TEMPLATE_ID];
  }

  try {
    const manifest = JSON.parse(
      fs.readFileSync(manifestPath, "utf8")
    ) as TemplateManifestFile;
    const templateIds = (manifest.templates ?? [])
      .map((templateEntry) => {
        return typeof templateEntry.name === "string" ? templateEntry.name : "";
      })
      .filter((templateId) => {
        return templateId.length > 0;
      });

    return templateIds.length
      ? dedupeTemplateIds(templateIds)
      : [DIRECTORY_TEMPLATE_ID, LOCATOR_TEMPLATE_ID];
  } catch {
    return [DIRECTORY_TEMPLATE_ID, LOCATOR_TEMPLATE_ID];
  }
};

const dedupeTemplateIds = (templateIds: string[]): string[] => {
  return templateIds.filter((templateId, index, values) => {
    return values.indexOf(templateId) === index;
  });
};

const orderScaffoldTemplateIds = (templateIds: string[]): string[] => {
  return [
    ...[DIRECTORY_TEMPLATE_ID, LOCATOR_TEMPLATE_ID].filter((templateId) => {
      return templateIds.includes(templateId);
    }),
    ...templateIds.filter((templateId) => {
      return ![DIRECTORY_TEMPLATE_ID, LOCATOR_TEMPLATE_ID].includes(templateId);
    }),
  ];
};

const buildDirectoryTemplateBlock = (): string => {
  return [
    '    "directory": {',
    "      // stream: {",
    '      //   filter: { entityTypes: ["ce_city", "ce_region", "ce_state", "ce_root"] },',
    '      //   $id: "local-editor-directory-stream",',
    "      //   fields: [",
    '      //     "dm_directoryParents.name",',
    '      //     "dm_directoryParents.slug",',
    '      //     "dm_directoryChildren.name",',
    '      //     "dm_directoryChildren.address",',
    '      //     "dm_directoryChildren.slug",',
    "      //   ],",
    "      // },",
    "    },",
  ].join("\n");
};

const buildLocatorTemplateBlock = (): string => {
  return [
    '    "locator": {',
    "      // stream: {",
    '      //   filter: { entityTypes: ["locator"] },',
    '      //   $id: "local-editor-locator-stream",',
    "      //   fields: [],",
    "      // },",
    "    },",
  ].join("\n");
};

const buildGenericTemplateBlock = (templateId: string): string => {
  return [
    `    ${JSON.stringify(templateId)}: {`,
    "      stream: {",
    "        ...baseLocationStream,",
    `        $id: ${JSON.stringify(buildTemplateStreamId(templateId))},`,
    "      },",
    "    },",
  ].join("\n");
};

const buildTemplateStreamId = (templateId: string): string => {
  return `local-editor-${templateId
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()}-stream`;
};
