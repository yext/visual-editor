import path from "node:path";
import fs from "fs-extra";
import type { SectionLibraryLayout } from "../../sectionLibrary.ts";
import { readResolvedLayoutConfigs } from "./config.ts";
import { DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH } from "./generatedFiles.ts";
import { inferEntityFields } from "./entityFields.ts";
import { createLocalEditorFixtureDocuments } from "./fixtureData.ts";
import type {
  LocalEditorContext,
  LocalEditorDocumentIndexEntry,
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  ResolvedLocalEditorLayoutConfig,
} from "./types.ts";
import { readJsonFile, toErrorMessage } from "./utils.ts";

/**
 * Builds the manifest payload consumed by the `/local-editor` shell.
 *
 * The manifest exposes the available layouts, their entity options, and the
 * effective default selection from layout defaults and snapshot data.
 */
export const getLocalEditorManifest = async (
  rootDir: string,
  libraryLayouts: SectionLibraryLayout[]
): Promise<LocalEditorManifestResponse> => {
  // Normalize the raw local snapshot state into one manifest payload the shell
  // can use to seed its first layout/entity/locale selection.
  const context = await getLocalEditorContext(rootDir, libraryLayouts);
  const selectedLayoutId = context.defaults.layoutId ?? context.layouts[0];
  const selectedLayoutDefaults = selectedLayoutId
    ? context.layoutDefaults[selectedLayoutId]
    : undefined;
  const selectedLayoutEntities = selectedLayoutId
    ? (context.entitiesByLayout[selectedLayoutId] ?? [])
    : [];

  return {
    layouts: context.layouts,
    pageSetTypeByLayout: context.pageSetTypeByLayout,
    dataSourceByLayout: context.dataSourceByLayout,
    entitiesByLayout: context.entitiesByLayout,
    layoutDefaults: context.layoutDefaults,
    defaults: {
      layoutId: selectedLayoutId,
      entityId:
        selectedLayoutDefaults?.entityId ??
        context.defaults.entityId ??
        selectedLayoutEntities[0]?.entityId,
      locale:
        selectedLayoutDefaults?.locale ??
        context.defaults.locale ??
        selectedLayoutEntities[0]?.locales[0],
    },
    diagnostics: context.diagnostics,
    streamConfigPath: context.streamConfigPath,
    localDataPath: context.localDataPath,
  };
};

export const getLocalEditorDocument = async (
  rootDir: string,
  libraryLayouts: SectionLibraryLayout[],
  layoutId?: string,
  entityId?: string,
  locale?: string,
  directoryChildCount?: number
): Promise<LocalEditorDocumentResponse> => {
  // The document endpoint follows the same fallback order as the manifest so a
  // partially specified request still resolves to a deterministic snapshot.
  const context = await getLocalEditorContext(
    rootDir,
    libraryLayouts,
    directoryChildCount
  );
  const selectedLayoutId =
    layoutId ?? context.defaults.layoutId ?? context.layouts[0];
  const entityOptions = selectedLayoutId
    ? (context.entitiesByLayout[selectedLayoutId] ?? [])
    : [];
  const selectedLayoutDefaults = selectedLayoutId
    ? context.layoutDefaults[selectedLayoutId]
    : undefined;
  const selectedEntityId =
    entityId ??
    selectedLayoutDefaults?.entityId ??
    context.defaults.entityId ??
    entityOptions[0]?.entityId;
  const selectedEntity = entityOptions.find((entityOption) => {
    return entityOption.entityId === selectedEntityId;
  });
  const selectedLocale =
    locale ??
    selectedLayoutDefaults?.locale ??
    context.defaults.locale ??
    selectedEntity?.locales[0];

  const selectedDocumentEntry = context.documents.find((documentEntry) => {
    return (
      documentEntry.layoutId === selectedLayoutId &&
      documentEntry.entityId === selectedEntityId &&
      documentEntry.locale === selectedLocale
    );
  });

  if (!selectedDocumentEntry) {
    return {
      document: null,
      entityFields: {
        fields: [],
        displayNames: {},
      },
      diagnostics: context.diagnostics,
    };
  }

  let streamDocument = readLocalEditorDocument(selectedDocumentEntry);
  if (Object.keys(context.env).length > 0) {
    streamDocument = {
      ...streamDocument,
      _env: {
        ...readDocumentEnvironment(streamDocument),
        ...context.env,
      },
    };
  }
  // Read all of the layout documents to find fields that may be missing in
  // any single entity, but keep going if a sibling snapshot is malformed.
  const layoutDocuments = context.documents
    .filter((documentEntry) => {
      return documentEntry.layoutId === selectedDocumentEntry.layoutId;
    })
    .flatMap((documentEntry) => {
      try {
        return [readLocalEditorDocument(documentEntry)];
      } catch {
        return [];
      }
    });
  const entityFields = inferEntityFields(
    layoutDocuments,
    context.layoutStreams[selectedDocumentEntry.layoutId]
  );

  if (
    libraryLayouts.find((layout) => {
      return layout.metadata.id === selectedDocumentEntry.layoutId;
    })?.metadata.pageSetType === "DIRECTORY" &&
    Array.isArray(streamDocument.dm_directoryChildren)
  ) {
    const directoryChildren = streamDocument.dm_directoryChildren.flatMap(
      (childReference) => {
        if (childReference && typeof childReference === "object") {
          return [childReference];
        }
        if (
          typeof childReference !== "string" &&
          typeof childReference !== "number"
        ) {
          return [];
        }
        const child = layoutDocuments.find((candidate) => {
          return String(candidate.uid) === String(childReference);
        });
        return child ? [child] : [];
      }
    );
    streamDocument = {
      ...streamDocument,
      dm_directoryChildren: directoryChildren,
    };
  }

  return {
    document: streamDocument,
    entityFields,
    diagnostics: context.diagnostics,
  };
};

/**
 * Builds the normalized local-editor context shared by manifest and document
 * responses.
 *
 * This merges Section Library metadata, resolved `stream.config.ts` entries,
 * indexed local snapshot documents, and derived entity/layout defaults into
 * one consistent view of local-editor state.
 */
const getLocalEditorContext = async (
  rootDir: string,
  libraryLayouts: SectionLibraryLayout[],
  directoryChildCount = 4
): Promise<LocalEditorContext> => {
  // Build one cached view of local-editor state so manifest and document
  // responses share the same layout/default/snapshot interpretation.
  const diagnostics: string[] = [];
  const localDataPath = path.join(rootDir, "localData");
  if (libraryLayouts.length === 0) {
    diagnostics.push("Missing src/library/library.json.");
  }
  const resolvedConfig = await readResolvedLayoutConfigs(
    rootDir,
    libraryLayouts,
    diagnostics
  );
  const layoutConfigs = resolvedConfig.layouts;
  const layouts = layoutConfigs.map((layoutConfig) => layoutConfig.layoutId);
  const documents = readLocalEditorDocuments(
    localDataPath,
    layoutConfigs,
    diagnostics,
    directoryChildCount
  );
  const entitiesByLayout = buildEntitiesByLayout(layouts, documents);
  const layoutDefaults = Object.fromEntries(
    layoutConfigs.map((layoutConfig) => {
      return [
        layoutConfig.layoutId,
        {
          entityId: layoutConfig.defaults.entityId,
          locale: layoutConfig.defaults.locale,
          defaultLayoutData: layoutConfig.defaultLayoutData,
        },
      ];
    })
  );
  const layoutStreams = Object.fromEntries(
    layoutConfigs.map((layoutConfig) => {
      return [layoutConfig.layoutId, layoutConfig.stream];
    })
  );
  const defaultLayoutId =
    layoutConfigs.find((layoutConfig) => {
      return layoutConfig.layoutId === resolvedConfig.defaults.layoutId;
    })?.layoutId ?? layoutConfigs[0]?.layoutId;

  return {
    diagnostics,
    streamConfigPath: DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
    localDataPath: "localData",
    layouts,
    defaults: {
      layoutId: defaultLayoutId,
      entityId: resolvedConfig.defaults.entityId,
      locale: resolvedConfig.defaults.locale,
    },
    env: resolvedConfig.env,
    layoutDefaults,
    layoutStreams,
    pageSetTypeByLayout: Object.fromEntries(
      layoutConfigs.map((layoutConfig) => {
        return [layoutConfig.layoutId, layoutConfig.pageSetType];
      })
    ),
    dataSourceByLayout: Object.fromEntries(
      layoutConfigs.map((layoutConfig) => {
        return [layoutConfig.layoutId, layoutConfig.dataSource];
      })
    ),
    entitiesByLayout,
    documents,
  };
};

const readDocumentEnvironment = (
  streamDocument: Record<string, unknown>
): Record<string, unknown> => {
  const environment = streamDocument._env;
  return environment &&
    typeof environment === "object" &&
    !Array.isArray(environment)
    ? (environment as Record<string, unknown>)
    : {};
};

/**
 * Indexes local-editor snapshot documents from `localData/mapping.json`.
 *
 * Each configured layout resolves through its generated data-template key in
 * the mapping file. Referenced snapshot files are validated, parsed, and
 * converted into layout/entity/locale index entries while recoverable issues
 * are added to diagnostics.
 */
const readLocalEditorDocuments = (
  localDataPath: string,
  layoutConfigs: ResolvedLocalEditorLayoutConfig[],
  diagnostics: string[],
  directoryChildCount: number
): LocalEditorDocumentIndexEntry[] => {
  const fixtureDocuments = createLocalEditorFixtureDocuments(
    layoutConfigs,
    directoryChildCount
  ).map(({ layoutId, document }) => ({
    layoutId,
    entityId: getDocumentEntityId(document, "fixture.json"),
    displayName:
      typeof document.name === "string" && document.name.length > 0
        ? document.name
        : getDocumentEntityId(document, "fixture.json"),
    locale: getDocumentLocale(document, "fixture.json"),
    fileName: "built-in fixture",
    document,
  }));
  const streamLayoutConfigs = layoutConfigs.filter((layoutConfig) => {
    return layoutConfig.dataSource === "stream";
  });
  if (streamLayoutConfigs.length === 0) {
    return fixtureDocuments;
  }
  if (!fs.existsSync(localDataPath)) {
    diagnostics.push(
      `Missing localData snapshots at ${path.relative(process.cwd(), localDataPath)}. Run your existing Pages local data generation flow first.`
    );
    return fixtureDocuments;
  }

  const mappingPath = path.join(localDataPath, "mapping.json");
  if (!fs.existsSync(mappingPath)) {
    diagnostics.push(
      `Missing local editor snapshot mapping at ${path.relative(process.cwd(), mappingPath)}. Run yext pages generate-test-data to populate local editor snapshots.`
    );
    return fixtureDocuments;
  }

  let mapping: Record<string, string[]>;
  try {
    mapping = readJsonFile<Record<string, string[]>>(
      mappingPath,
      "local data mapping"
    );
  } catch (error) {
    diagnostics.push(toErrorMessage(error));
    return fixtureDocuments;
  }

  const documents: LocalEditorDocumentIndexEntry[] = [...fixtureDocuments];

  for (const layoutConfig of streamLayoutConfigs) {
    const referencedFileNames = new Set(
      mapping[layoutConfig.dataTemplateName] ?? []
    );
    if (referencedFileNames.size === 0) {
      diagnostics.push(
        `Missing local editor snapshot mapping for layout "${layoutConfig.layoutId}" in ${path.relative(process.cwd(), mappingPath)}. Expected generated mapping key "${layoutConfig.dataTemplateName}". Run yext pages generate-test-data after enabling localEditor.`
      );
      continue;
    }

    Array.from(referencedFileNames)
      .sort((left, right) => left.localeCompare(right))
      .forEach((fileName) => {
        const filePath = path.join(localDataPath, fileName);
        if (!fs.existsSync(filePath)) {
          diagnostics.push(
            `Snapshot file ${path.join("localData", fileName)} is referenced but missing.`
          );
          return;
        }

        try {
          const document = readJsonFile<Record<string, unknown>>(
            filePath,
            `local editor snapshot ${fileName}`
          );
          const locale = getDocumentLocale(document, fileName);
          const entityId = getDocumentEntityId(document, fileName);
          documents.push({
            layoutId: layoutConfig.layoutId,
            entityId,
            displayName:
              typeof document.name === "string" && document.name.length > 0
                ? document.name
                : entityId,
            locale,
            filePath,
            fileName,
          });
        } catch (error) {
          diagnostics.push(toErrorMessage(error));
        }
      });
  }

  return documents;
};

const readLocalEditorDocument = (
  documentEntry: LocalEditorDocumentIndexEntry
): Record<string, unknown> => {
  if (documentEntry.document) {
    return documentEntry.document;
  }
  if (!documentEntry.filePath) {
    throw new Error(`Missing local editor snapshot ${documentEntry.fileName}.`);
  }
  return readJsonFile<Record<string, unknown>>(
    documentEntry.filePath,
    `local editor snapshot ${documentEntry.fileName}`
  );
};

const buildEntitiesByLayout = (
  layoutIds: string[],
  documents: LocalEditorDocumentIndexEntry[]
): Record<string, LocalEditorEntityOption[]> => {
  return Object.fromEntries(
    layoutIds.map((layoutId) => {
      return [layoutId, buildEntityOptionsForLayout(layoutId, documents)];
    })
  );
};

/**
 * Collapses per-locale snapshot entries into the entity options shown in the
 * local-editor shell for one layout.
 *
 * Entities are deduped by id, locale lists are accumulated and sorted, and the
 * final options are sorted by display name for a stable dropdown order.
 */
const buildEntityOptionsForLayout = (
  layoutId: string,
  documents: LocalEditorDocumentIndexEntry[]
): LocalEditorEntityOption[] => {
  const entityMap = new Map<string, LocalEditorEntityOption>();

  for (const document of documents) {
    if (document.layoutId !== layoutId) {
      continue;
    }

    const existingEntity = entityMap.get(document.entityId);
    if (!existingEntity) {
      entityMap.set(document.entityId, {
        entityId: document.entityId,
        displayName: document.displayName,
        locales: [document.locale],
      });
      continue;
    }

    if (!existingEntity.locales.includes(document.locale)) {
      existingEntity.locales.push(document.locale);
      existingEntity.locales.sort((left, right) => left.localeCompare(right));
    }
  }

  return Array.from(entityMap.values()).sort((left, right) => {
    return left.displayName.localeCompare(right.displayName);
  });
};

const getDocumentLocale = (
  document: Record<string, unknown>,
  fileName: string
): string => {
  if (typeof document.locale === "string" && document.locale.length > 0) {
    return document.locale;
  }

  const match = fileName.match(/__(.+?)__[^_]+\.json$/);
  return match?.[1] ?? "en";
};

const getDocumentEntityId = (
  document: Record<string, unknown>,
  fileName: string
): string => {
  if (
    (typeof document.id === "string" || typeof document.id === "number") &&
    String(document.id).length > 0
  ) {
    return String(document.id);
  }

  const match = fileName.match(/__([^_]+)\.json$/);
  return match?.[1] ?? fileName.replace(/\.json$/, "");
};
