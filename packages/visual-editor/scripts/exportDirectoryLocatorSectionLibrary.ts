import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { Project } from "ts-morph";
import { defaultLayoutData } from "../src/vite-plugin/defaultLayoutData.ts";

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src"
);
const supportEntryPoint = "@yext/visual-editor/section-library-support";
const supportProject = new Project();
const supportSourceFile = supportProject.addSourceFileAtPath(
  path.join(sourceRoot, "sectionLibrarySupport.ts")
);
const supportExports = new Set(
  supportSourceFile.getExportedDeclarations().keys()
);

const sharedComponentSources: Record<
  string,
  { path: string; exportName: string }
> = {
  BreadcrumbsSlot: {
    path: "components/pageSections/Breadcrumbs.tsx",
    exportName: "BreadcrumbsSection",
  },
  CopyrightMessageSlot: {
    path: "components/footer/CopyrightMessageSlot.tsx",
    exportName: "CopyrightMessageSlot",
  },
  CTASlot: {
    path: "components/contentBlocks/CtaWrapper.tsx",
    exportName: "CTAWrapper",
  },
  DirectoryGrid: {
    path: "components/directory/DirectoryWrapper.tsx",
    exportName: "DirectoryGrid",
  },
  FooterExpandedLinksWrapper: {
    path: "components/footer/FooterExpandedLinksWrapper.tsx",
    exportName: "FooterExpandedLinksWrapper",
  },
  FooterLinksSlot: {
    path: "components/footer/FooterLinksSlot.tsx",
    exportName: "FooterLinksSlot",
  },
  FooterLogoSlot: {
    path: "components/footer/FooterLogoSlot.tsx",
    exportName: "FooterLogoSlot",
  },
  FooterSocialLinksSlot: {
    path: "components/footer/FooterSocialLinksSlot.tsx",
    exportName: "FooterSocialLinksSlot",
  },
  FooterUtilityImagesSlot: {
    path: "components/footer/FooterUtilityImagesSlot.tsx",
    exportName: "FooterUtilityImagesSlot",
  },
  HeaderLinks: {
    path: "components/header/HeaderLinks.tsx",
    exportName: "HeaderLinks",
  },
  HeadingTextSlot: {
    path: "components/contentBlocks/HeadingText.tsx",
    exportName: "HeadingText",
  },
  ImageSlot: {
    path: "components/contentBlocks/image/Image.tsx",
    exportName: "ImageWrapper",
  },
  PrimaryHeaderSlot: {
    path: "components/header/PrimaryHeaderSlot.tsx",
    exportName: "PrimaryHeaderSlot",
  },
  SecondaryFooterSlot: {
    path: "components/footer/SecondaryFooterSlot.tsx",
    exportName: "SecondaryFooterSlot",
  },
  SecondaryHeaderSlot: {
    path: "components/header/SecondaryHeaderSlot.tsx",
    exportName: "SecondaryHeaderSlot",
  },
};

const copiedSourceRoots = [
  "components/directory/Directory.tsx",
  "components/locator/Locator.tsx",
  "components/footer/ExpandedFooter.tsx",
  "components/header/ExpandedHeader.tsx",
  "components/pageSections/Banner.tsx",
  "components/customCode/CustomCodeSection.tsx",
  "components/pageSections/Breadcrumbs.tsx",
  ...Object.values(sharedComponentSources).map((source) => source.path),
];

type Options = {
  targetDirectory: string;
  libraryId: string;
  overwrite: boolean;
};

/**
 * Exports the editable Directory and Locator source closure into one Section
 * Library. It copies supported visual code, rewrites Visual Editor internal
 * imports, writes default Directory and Locator layouts, and records the
 * source version.
 */
export const exportDirectoryLocatorSectionLibrary = (
  options: Options
): void => {
  const libraryDirectory = path.join(options.targetDirectory, "src", "library");
  const sharedDirectory = path.join(libraryDirectory, "shared");
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  if (!options.overwrite && fs.existsSync(sharedDirectory)) {
    throw new Error(
      `Refusing to overwrite existing shared source at ${sharedDirectory}`
    );
  }
  if (
    !options.overwrite &&
    fs.existsSync(path.join(sectionsDirectory, "Directory.tsx"))
  ) {
    throw new Error(
      `Refusing to overwrite existing Directory section at ${sectionsDirectory}`
    );
  }
  if (
    !options.overwrite &&
    fs.existsSync(path.join(sectionsDirectory, "Locator.tsx"))
  ) {
    throw new Error(
      `Refusing to overwrite existing Locator section at ${sectionsDirectory}`
    );
  }

  if (options.overwrite) {
    fs.removeSync(sharedDirectory);
  }
  fs.ensureDirSync(sectionsDirectory);
  const copiedSourcePaths = new Set<string>();
  for (const sourcePath of copiedSourceRoots) {
    copySourceClosure(
      path.join(sourceRoot, sourcePath),
      sharedDirectory,
      copiedSourcePaths
    );
  }
  writeSections(sectionsDirectory);
  writeSectionRegistry(sharedDirectory);
  writeLayouts(libraryDirectory, options.libraryId);
  writeSourceVersion(sharedDirectory);
};

const copySourceClosure = (
  sourcePath: string,
  sharedDirectory: string,
  copiedSourcePaths: Set<string>
): void => {
  if (copiedSourcePaths.has(sourcePath)) {
    return;
  }
  copiedSourcePaths.add(sourcePath);
  const relativePath = path.relative(sourceRoot, sourcePath);
  const destinationPath = path.join(sharedDirectory, relativePath);
  fs.ensureDirSync(path.dirname(destinationPath));
  if (!/\.(ts|tsx|js|jsx)$/.test(sourcePath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    return;
  }
  const source = fs.readFileSync(sourcePath, "utf8");
  const rewritten = source
    .replace(
      /(import\s+["'])(\.[^"']+)(["'];?)/g,
      (match, prefix: string, specifier: string, suffix: string) => {
        const importedPath = resolveSourceImport(sourcePath, specifier);
        if (path.extname(importedPath) !== ".css") {
          throw new Error(
            `Unsupported side-effect import ${specifier} from ${sourcePath}`
          );
        }
        copySourceClosure(importedPath, sharedDirectory, copiedSourcePaths);
        return `${prefix}${specifier}${suffix}`;
      }
    )
    .replace(
      /(from\s+["'])(\.[^"']+)(["'])/g,
      (match, prefix: string, specifier: string, suffix: string) => {
        const importedPath = resolveSourceImport(sourcePath, specifier);
        if (isCopiedSource(importedPath)) {
          copySourceClosure(importedPath, sharedDirectory, copiedSourcePaths);
          return `${prefix}${specifier.replace(/\.(ts|tsx|js|jsx)$/, "")}${suffix}`;
        }
        if (path.extname(importedPath) === ".css") {
          copySourceClosure(importedPath, sharedDirectory, copiedSourcePaths);
          return match;
        }
        return `${prefix}@yext/visual-editor/section-library-support${suffix}`;
      }
    );
  validateSupportImports(sourcePath, rewritten);
  fs.writeFileSync(destinationPath, rewritten);
};

const validateSupportImports = (sourcePath: string, source: string): void => {
  const sourceFile = supportProject.createSourceFile(sourcePath, source, {
    overwrite: true,
  });
  try {
    for (const declaration of sourceFile.getImportDeclarations()) {
      if (declaration.getModuleSpecifierValue() !== supportEntryPoint) {
        continue;
      }
      if (
        declaration.getDefaultImport() ||
        declaration.getNamespaceImport() ||
        declaration
          .getNamedImports()
          .some((imported) => !supportExports.has(imported.getName()))
      ) {
        throw new Error(
          `Unsupported Visual Editor import in ${sourcePath}. Add a stable export to ${supportEntryPoint} before exporting this source.`
        );
      }
    }
  } finally {
    sourceFile.forget();
  }
};

const resolveSourceImport = (sourcePath: string, specifier: string): string => {
  const sourceWithoutExtension = path.resolve(
    path.dirname(sourcePath),
    specifier
  );
  const extensionlessPath = sourceWithoutExtension.replace(/\.[^.]+$/, "");
  const candidates = [
    sourceWithoutExtension,
    ...[".ts", ".tsx", ".js", ".jsx", ".css"].flatMap((extension) => [
      `${sourceWithoutExtension}${extension}`,
      `${extensionlessPath}${extension}`,
    ]),
    ...["index.ts", "index.tsx", "index.js", "index.jsx"].map((fileName) =>
      path.join(sourceWithoutExtension, fileName)
    ),
  ];
  const resolvedPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!resolvedPath) {
    throw new Error(`Could not resolve ${specifier} from ${sourcePath}`);
  }
  return resolvedPath;
};

const isCopiedSource = (sourcePath: string): boolean => {
  const relativePath = path.relative(sourceRoot, sourcePath);
  return (
    [
      "components/contentBlocks/",
      "components/customCode/",
      "components/directory/",
      "components/footer/",
      "components/header/",
      "components/locator/",
    ].some((directory) => relativePath.startsWith(directory)) ||
    [
      "components/pageSections/Banner.tsx",
      "components/pageSections/Breadcrumbs.tsx",
    ].includes(relativePath)
  );
};

const writeSections = (sectionsDirectory: string): void => {
  [
    {
      fileName: "Directory",
      sourceExportName: "Directory",
      importPath: "../shared/components/directory/Directory",
      displayName: "Directory",
      description: "Displays the directory page experience.",
      pageSetTypes: '["DIRECTORY"]',
      category: "Standard Sections",
    },
    {
      fileName: "Locator",
      sourceExportName: "LocatorComponent",
      importPath: "../shared/components/locator/Locator",
      displayName: "Locator",
      description: "Displays the locator page experience.",
      pageSetTypes: '["LOCATOR"]',
      category: "Standard Sections",
    },
    {
      fileName: "BannerSection",
      sourceExportName: "BannerSection",
      importPath: "../shared/components/pageSections/Banner",
      displayName: "Banner",
      description: "Displays a full-width banner.",
      pageSetTypes: '["DIRECTORY", "LOCATOR"]',
      category: "Standard Sections",
    },
    {
      fileName: "ExpandedHeader",
      sourceExportName: "ExpandedHeader",
      importPath: "../shared/components/header/ExpandedHeader",
      displayName: "Expanded Header",
      description: "Displays the site header.",
      pageSetTypes: '["DIRECTORY", "LOCATOR"]',
      category: "Other",
    },
    {
      fileName: "ExpandedFooter",
      sourceExportName: "ExpandedFooter",
      importPath: "../shared/components/footer/ExpandedFooter",
      displayName: "Expanded Footer",
      description: "Displays the site footer.",
      pageSetTypes: '["DIRECTORY", "LOCATOR"]',
      category: "Other",
    },
    {
      fileName: "CustomCodeSection",
      sourceExportName: "CustomCodeSection",
      importPath: "../shared/components/customCode/CustomCodeSection",
      displayName: "Custom Code Section",
      description: "Adds custom HTML, CSS, and JavaScript.",
      pageSetTypes: '["DIRECTORY", "LOCATOR"]',
      category: "Other",
    },
  ].forEach(
    ({
      fileName,
      sourceExportName,
      importPath,
      displayName,
      description,
      pageSetTypes,
      category,
    }) => {
      fs.writeFileSync(
        path.join(sectionsDirectory, `${fileName}.tsx`),
        [
          `import { ${sourceExportName} as SectionComponent } from ${JSON.stringify(importPath)};`,
          'import type { SectionConfig } from "@yext/visual-editor";',
          "",
          `export const ${fileName} = SectionComponent;`,
          "",
          "export const config: SectionConfig = {",
          `  id: ${JSON.stringify(fileName)},`,
          `  displayName: ${JSON.stringify(displayName)},`,
          `  description: ${JSON.stringify(description)},`,
          `  pageSetTypes: ${pageSetTypes},`,
          `  category: ${JSON.stringify(category)},`,
          "};",
          "",
        ].join("\n")
      );
    }
  );
};

const writeSectionRegistry = (sharedDirectory: string): void => {
  const directoryLayout = readDefaultLayout(defaultLayoutData.directory);
  const componentIds = collectComponentIds(directoryLayout).filter(
    (id) =>
      ![
        "Directory",
        "ExpandedHeader",
        "ExpandedFooter",
        "BannerSection",
        "CustomCodeSection",
      ].includes(id)
  );
  const unsupportedId = componentIds.find((id) => !sharedComponentSources[id]);
  if (unsupportedId) {
    throw new Error(
      `Directory default layout references unsupported shared component ${unsupportedId}`
    );
  }
  const sharedComponentIds = [...new Set(componentIds)];
  const imports = sharedComponentIds.map((id, index) => {
    const source = sharedComponentSources[id];
    return `import { ${source.exportName} as SharedComponent${index} } from ${JSON.stringify(`./${source.path.replace(/\.(ts|tsx)$/, "")}`)};`;
  });
  const entries = sharedComponentIds.map((id) => {
    return `  ${JSON.stringify(id)}: SharedComponent${sharedComponentIds.indexOf(id)},`;
  });
  const metadata = sharedComponentIds.map((id) => {
    return `  { id: ${JSON.stringify(id)}, pageSetTypes: ["DIRECTORY"] },`;
  });
  fs.writeFileSync(
    path.join(sharedDirectory, "sectionRegistry.ts"),
    [
      'import type { Config } from "@puckeditor/core";',
      ...imports,
      'import { directoryRootConfig, locatorRootConfig } from "./roots";',
      "",
      "export const sharedSections = [",
      ...metadata,
      "] as const;",
      "",
      'export const sharedComponents: Record<string, Config["components"][string]> = {',
      ...entries,
      "};",
      "",
      'export const sharedRootConfigs: Partial<Record<string, NonNullable<Config["root"]>>> = {',
      "  DIRECTORY: directoryRootConfig,",
      "  LOCATOR: locatorRootConfig,",
      "};",
      "",
      'export const sharedRootPageSetTypes = ["DIRECTORY", "LOCATOR"] as const;',
      "",
      "export const sharedRootAllowedComponentIds: Partial<Record<string, string[]>> = {",
      '  DIRECTORY: ["MainContent", "ExpandedHeader", "ExpandedFooter", "CustomCodeSection"],',
      '  LOCATOR: ["MainContent", "ExpandedHeader", "ExpandedFooter", "CustomCodeSection"],',
      "};",
      "",
    ].join("\n")
  );
  fs.writeFileSync(
    path.join(sharedDirectory, "roots.tsx"),
    [
      'import { DropZone, type Config } from "@puckeditor/core";',
      'import { resolveDirectoryRootProps } from "@yext/visual-editor/section-library-support";',
      "",
      'const rootStyle = { display: "flex", flexDirection: "column", minHeight: "100vh" } as const;',
      "",
      'export const directoryRootConfig: NonNullable<Config["root"]> = {',
      "  resolveData: (data: any, params: any) => ({",
      "    ...data,",
      "    props: resolveDirectoryRootProps(data.props ?? {}, params.metadata?.streamDocument ?? {}),",
      "  }),",
      '  render: () => <DropZone zone="default-zone" style={rootStyle} disallow={[]}/>,',
      "};",
      "",
      'export const locatorRootConfig: NonNullable<Config["root"]> = {',
      '  render: () => <DropZone zone="default-zone" style={rootStyle} disallow={[]}/>,',
      "};",
      "",
    ].join("\n")
  );
};

const writeLayouts = (libraryDirectory: string, libraryId: string): void => {
  const locatorLayout = readDefaultLayout(defaultLayoutData.locator);
  const directoryLayout = readDefaultLayout(defaultLayoutData.directory);
  writeLayout(
    libraryDirectory,
    `${libraryId}-directory`,
    {
      id: `${libraryId}-directory`,
      displayName: "Directory",
      pageSetType: "DIRECTORY",
    },
    directoryLayout
  );
  writeLayout(
    libraryDirectory,
    `${libraryId}-locator`,
    {
      id: `${libraryId}-locator`,
      displayName: "Locator",
      pageSetType: "LOCATOR",
    },
    locatorLayout
  );
};

const writeLayout = (
  libraryDirectory: string,
  name: string,
  metadata: Record<string, string>,
  defaultLayout: Record<string, any>
): void => {
  const layoutDirectory = path.join(libraryDirectory, "layouts", name);
  fs.ensureDirSync(layoutDirectory);
  fs.writeJsonSync(path.join(layoutDirectory, "metadata.json"), metadata, {
    spaces: 2,
  });
  fs.writeJsonSync(
    path.join(layoutDirectory, "defaultLayout.json"),
    defaultLayout,
    {
      spaces: 2,
    }
  );
};

const writeSourceVersion = (sharedDirectory: string): void => {
  const packageJson = fs.readJsonSync(
    path.join(sourceRoot, "..", "package.json")
  ) as { version: string };
  fs.writeJsonSync(
    path.join(sharedDirectory, "sourceVersion.json"),
    {
      visualEditorVersion: packageJson.version,
      sourceRoots: copiedSourceRoots,
    },
    { spaces: 2 }
  );
};

const readDefaultLayout = (layout: string): Record<string, any> => {
  return JSON.parse(layout) as Record<string, any>;
};

const collectComponentIds = (value: unknown): string[] => {
  if (!value || typeof value !== "object") {
    return [];
  }
  const layout = value as Record<string, unknown>;
  return [
    ...collectComponentList(layout.content),
    ...Object.values(layout.zones ?? {}).flatMap(collectComponentList),
  ];
};

const collectComponentList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((value) => {
    if (!value || typeof value !== "object") {
      return [];
    }
    const component = value as Record<string, unknown>;
    if (typeof component.type !== "string" || !component.props) {
      return [];
    }
    const props = component.props as Record<string, unknown>;
    const slots =
      props.slots && typeof props.slots === "object"
        ? Object.values(props.slots).flatMap(collectComponentList)
        : [];
    const mainContent =
      component.type === "MainContent"
        ? collectComponentList(props.content)
        : [];
    return [
      ...(component.type === "MainContent" ? [] : [component.type]),
      ...slots,
      ...mainContent,
    ];
  });
};

const parseOptions = (arguments_: string[]): Options => {
  const targetIndex = arguments_.indexOf("--target");
  const libraryIdIndex = arguments_.indexOf("--library-id");
  if (targetIndex === -1 || libraryIdIndex === -1) {
    throw new Error(
      "Usage: exportDirectoryLocatorSectionLibrary --target <starter path> --library-id <library id> [--overwrite]"
    );
  }
  const targetDirectory = arguments_[targetIndex + 1];
  const libraryId = arguments_[libraryIdIndex + 1];
  if (!targetDirectory || !libraryId) {
    throw new Error(
      "Usage: exportDirectoryLocatorSectionLibrary --target <starter path> --library-id <library id> [--overwrite]"
    );
  }
  return {
    targetDirectory: path.resolve(targetDirectory),
    libraryId,
    overwrite: arguments_.includes("--overwrite"),
  };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  exportDirectoryLocatorSectionLibrary(parseOptions(process.argv.slice(2)));
}
