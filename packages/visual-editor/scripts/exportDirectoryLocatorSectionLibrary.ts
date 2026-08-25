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
  AddressSlot: {
    path: "components/contentBlocks/Address.tsx",
    exportName: "Address",
  },
  BreadcrumbsSlot: {
    path: "components/pageSections/Breadcrumbs.tsx",
    exportName: "BreadcrumbsSection",
  },
  DirectoryGrid: {
    path: "components/directory/DirectoryWrapper.tsx",
    exportName: "DirectoryGrid",
  },
  DirectoryCard: {
    path: "components/directory/DirectoryCard.tsx",
    exportName: "DirectoryCard",
  },
  HeadingTextSlot: {
    path: "components/contentBlocks/HeadingText.tsx",
    exportName: "HeadingText",
  },
  HoursStatusSlot: {
    path: "components/contentBlocks/HoursStatus.tsx",
    exportName: "HoursStatus",
  },
  ImageSlot: {
    path: "components/contentBlocks/image/Image.tsx",
    exportName: "ImageWrapper",
  },
  PhoneSlot: {
    path: "components/contentBlocks/Phone.tsx",
    exportName: "Phone",
  },
};

const copiedSourceRoots = [
  "components/directory/Directory.tsx",
  "components/locator/Locator.tsx",
  ...Object.values(sharedComponentSources).map((source) => source.path),
];

// DirectoryGrid creates DirectoryCard instances dynamically. Their nested
// slots are likewise absent from the default layout data used for discovery.
const alwaysRegisteredSharedComponentIds = [
  "DirectoryCard",
  "AddressSlot",
  "HoursStatusSlot",
  "PhoneSlot",
];

type Options = {
  targetDirectory: string;
  libraryId: string;
  overwrite: boolean;
};

/**
 * Exports the Directory and Locator sections to a starter repository
 * configured with the new Section Library structure.
 *
 * Run the following from `packages/visual-editor`:
 *
 * ```
 * pnpm run export-section-library-directory-locator -- \
 *   --target <starter-path> \
 *   --library-id <library-id>
 * ```
 *
 * `--target` is the starter repository root.
 * `--library-id` is the prefix for the generated layout IDs.
 * For example, `--library-id my-library` creates
 * `my-library-directory` and `my-library-locator`.
 *
 * By default, the command stops if the target already has shared source or a
 * Directory or Locator section. Use `--overwrite` only after you review the
 * new output. This option replaces the shared source and the Directory and
 * Locator sections and layouts.
 *
 * The export process has these steps:
 *
 * 1. Copy the Directory and Locator source and its supported local imports.
 * 2. Replace other Visual Editor imports with the public section library
 *    support entry point.
 * 3. Write the public sections, internal component registry, default layouts,
 *    and Visual Editor source version.
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
  const directoryLayout = readDefaultLayout(defaultLayoutData.directory);
  directoryLayout.content = directoryLayout.content.filter(
    (component: { type?: unknown }) =>
      component.type !== "ExpandedHeader" && component.type !== "ExpandedFooter"
  );
  writeSections(sectionsDirectory);
  writeComponentRegistry(sharedDirectory, directoryLayout);
  writeLayouts(libraryDirectory, options.libraryId, directoryLayout);
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
      "components/directory/",
      "components/locator/",
    ].some((directory) => relativePath.startsWith(directory)) ||
    relativePath === "components/pageSections/Breadcrumbs.tsx"
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

/**
 * Writes the hidden component registry and root configurations for the
 * exported Directory and Locator layouts.
 *
 * 1. Find the hidden component IDs stored in the Directory default layout.
 * 2. Map each ID to its copied Puck config.
 * 3. Write the component registry and both layout root configurations.
 */
const writeComponentRegistry = (
  sharedDirectory: string,
  directoryLayout: Record<string, any>
): void => {
  const componentIds = [
    ...collectComponentIds(directoryLayout),
    ...alwaysRegisteredSharedComponentIds,
  ].filter(
    // Directory is a visible section. Its config comes from sections/Directory.tsx.
    (id) => id !== "Directory"
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
    path.join(sharedDirectory, "componentRegistry.ts"),
    [
      'import type { Config } from "@puckeditor/core";',
      ...imports,
      'import { directoryRootConfig, locatorRootConfig } from "./roots";',
      "",
      "/** Hidden internal Puck components referenced by saved Directory layout data. */",
      "export const sharedComponentMetadata = [",
      ...metadata,
      "] as const;",
      "",
      "/** Puck configs for the hidden internal components. */",
      'export const sharedComponentConfigs: Record<string, Config["components"][string]> = {',
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
      '  DIRECTORY: ["MainContent", "CustomCodeSection"],',
      '  LOCATOR: ["MainContent", "CustomCodeSection"],',
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

const writeLayouts = (
  libraryDirectory: string,
  libraryId: string,
  directoryLayout: Record<string, any>
): void => {
  const locatorLayout = readDefaultLayout(defaultLayoutData.locator);
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

const parseOptions = (args: string[]): Options => {
  const targetIndex = args.indexOf("--target");
  const libraryIdIndex = args.indexOf("--library-id");
  if (targetIndex === -1 || libraryIdIndex === -1) {
    throw new Error(
      "Usage: exportDirectoryLocatorSectionLibrary --target <starter path> --library-id <library id> [--overwrite]"
    );
  }
  const targetDirectory = args[targetIndex + 1];
  const libraryId = args[libraryIdIndex + 1];
  if (!targetDirectory || !libraryId) {
    throw new Error(
      "Usage: exportDirectoryLocatorSectionLibrary --target <starter path> --library-id <library id> [--overwrite]"
    );
  }
  return {
    targetDirectory: path.resolve(targetDirectory),
    libraryId,
    overwrite: args.includes("--overwrite"),
  };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  exportDirectoryLocatorSectionLibrary(parseOptions(process.argv.slice(2)));
}
