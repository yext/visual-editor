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
    '    "hours",',
    '    "dineInHours",',
    '    "driveThroughHours",',
    '    "address",',
    '    "yextDisplayCoordinate",',
    '    // "c_productSection.sectionTitle",',
    '    // "c_hero",',
    '    // "dm_directoryParents_defaultdirectory.slug",',
    '    // "dm_directoryParents_defaultdirectory.name",',
    '    "additionalHoursText",',
    '    "mainPhone",',
    '    "emails",',
    '    "services",',
    '    // "c_deliveryPromo",',
    '    "ref_listings",',
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

export const buildLocalEditorThemeScaffoldSource = (): string => {
  return `${[
    "const localEditorTheme = {",
    '  "--colors-palette-primary": "#CF0A2C",',
    '  "--colors-palette-secondary": "#737B82",',
    '  "--colors-palette-tertiary": "#FF7E7E",',
    '  "--colors-palette-quaternary": "#000000",',
    `  "--fontFamily-h1-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-h1-fontSize": "48px",',
    '  "--fontWeight-h1-fontWeight": "700",',
    '  "--textTransform-h1-textTransform": "none",',
    `  "--fontFamily-h2-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-h2-fontSize": "40px",',
    '  "--fontWeight-h2-fontWeight": "700",',
    '  "--textTransform-h2-textTransform": "none",',
    `  "--fontFamily-h3-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-h3-fontSize": "32px",',
    '  "--fontWeight-h3-fontWeight": "700",',
    '  "--textTransform-h3-textTransform": "none",',
    `  "--fontFamily-h4-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-h4-fontSize": "24px",',
    '  "--fontWeight-h4-fontWeight": "700",',
    '  "--textTransform-h4-textTransform": "none",',
    `  "--fontFamily-h5-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-h5-fontSize": "20px",',
    '  "--fontWeight-h5-fontWeight": "700",',
    '  "--textTransform-h5-textTransform": "none",',
    `  "--fontFamily-h6-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-h6-fontSize": "18px",',
    '  "--fontWeight-h6-fontWeight": "700",',
    '  "--textTransform-h6-textTransform": "none",',
    `  "--fontFamily-body-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-body-fontSize": "16px",',
    '  "--fontWeight-body-fontWeight": "400",',
    '  "--textTransform-body-textTransform": "none",',
    '  "--maxWidth-pageSection-contentWidth": "1024px",',
    '  "--padding-pageSection-verticalPadding": "32px",',
    `  "--fontFamily-button-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-button-fontSize": "16px",',
    '  "--fontWeight-button-fontWeight": "400",',
    '  "--borderRadius-button-borderRadius": "4px",',
    '  "--textTransform-button-textTransform": "none",',
    '  "--letterSpacing-button-letterSpacing": "0em",',
    `  "--fontFamily-link-fontFamily": "'Open Sans', 'Open Sans Fallback', sans-serif",`,
    '  "--fontSize-link-fontSize": "16px",',
    '  "--fontWeight-link-fontWeight": "400",',
    '  "--textTransform-link-textTransform": "none",',
    '  "--letterSpacing-link-letterSpacing": "0em",',
    '  "--display-link-caret": "block",',
    '  "--borderRadius-image-borderRadius": "0px",',
    "};",
    "",
    "export default localEditorTheme;",
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
