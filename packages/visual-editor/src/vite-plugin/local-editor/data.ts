import path from "node:path";
import fs from "fs-extra";
import { readResolvedTemplateConfigs } from "./config.ts";
import { DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH } from "./generatedFiles.ts";
import { inferEntityFields } from "./entityFields.ts";
import type {
  LocalEditorContext,
  LocalEditorDocumentIndexEntry,
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  ResolvedLocalEditorTemplateConfig,
  TemplateManifestEntry,
  TemplateManifestFile,
} from "./types.ts";
import { readJsonFile, toErrorMessage } from "./utils.ts";

export const getLocalEditorManifest = async (
  rootDir: string,
  streamConfigPath = DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
): Promise<LocalEditorManifestResponse> => {
  const context = await getLocalEditorContext(rootDir, streamConfigPath);
  const selectedTemplateId =
    context.defaults.templateId ?? context.templates[0];
  const selectedTemplateDefaults = selectedTemplateId
    ? context.templateDefaults[selectedTemplateId]
    : undefined;
  const selectedTemplateEntities = selectedTemplateId
    ? (context.entitiesByTemplate[selectedTemplateId] ?? [])
    : [];

  return {
    templates: context.templates,
    entitiesByTemplate: context.entitiesByTemplate,
    templateDefaults: context.templateDefaults,
    defaults: {
      templateId: selectedTemplateId,
      entityId:
        selectedTemplateDefaults?.entityId ??
        context.defaults.entityId ??
        selectedTemplateEntities[0]?.entityId,
      locale:
        selectedTemplateDefaults?.locale ??
        context.defaults.locale ??
        selectedTemplateEntities[0]?.locales[0],
    },
    diagnostics: context.diagnostics,
    streamConfigPath: context.streamConfigPath,
    localDataPath: context.localDataPath,
  };
};

export const getLocalEditorDocument = async (
  rootDir: string,
  streamConfigPath: string,
  templateId?: string,
  entityId?: string,
  locale?: string
): Promise<LocalEditorDocumentResponse> => {
  const context = await getLocalEditorContext(rootDir, streamConfigPath);
  const selectedTemplateId =
    templateId ?? context.defaults.templateId ?? context.templates[0];
  const entityOptions = selectedTemplateId
    ? (context.entitiesByTemplate[selectedTemplateId] ?? [])
    : [];
  const selectedTemplateDefaults = selectedTemplateId
    ? context.templateDefaults[selectedTemplateId]
    : undefined;
  const selectedEntityId =
    entityId ??
    selectedTemplateDefaults?.entityId ??
    context.defaults.entityId ??
    entityOptions[0]?.entityId;
  const selectedEntity = entityOptions.find((entityOption) => {
    return entityOption.entityId === selectedEntityId;
  });
  const selectedLocale =
    locale ??
    selectedTemplateDefaults?.locale ??
    context.defaults.locale ??
    selectedEntity?.locales[0];

  const selectedDocumentEntry = context.documents.find((documentEntry) => {
    return (
      documentEntry.templateId === selectedTemplateId &&
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

  const document = readJsonFile<Record<string, unknown>>(
    selectedDocumentEntry.filePath,
    `local editor snapshot ${selectedDocumentEntry.fileName}`
  );
  const entityFields = inferEntityFields(
    document,
    context.templateStreams[selectedDocumentEntry.templateId]
  );

  return {
    document,
    entityFields,
    diagnostics: context.diagnostics,
  };
};

const getLocalEditorContext = async (
  rootDir: string,
  streamConfigPath = DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
): Promise<LocalEditorContext> => {
  const diagnostics: string[] = [];
  const localDataPath = path.join(rootDir, "localData");
  const templateManifestEntries = readTemplateManifestEntries(
    rootDir,
    diagnostics
  );
  const resolvedConfig = await readResolvedTemplateConfigs(
    rootDir,
    streamConfigPath,
    templateManifestEntries,
    diagnostics
  );
  const templateConfigs = resolvedConfig.templates;
  const templates = templateConfigs.map(
    (templateConfig) => templateConfig.templateId
  );
  const documents = readLocalEditorDocuments(
    localDataPath,
    templateConfigs,
    diagnostics
  );
  const entitiesByTemplate = buildEntitiesByTemplate(templates, documents);
  const templateDefaults = Object.fromEntries(
    templateConfigs.map((templateConfig) => {
      return [
        templateConfig.templateId,
        {
          entityId: templateConfig.defaults.entityId,
          locale: templateConfig.defaults.locale,
          defaultLayoutData: templateConfig.defaultLayoutData,
        },
      ];
    })
  );
  const templateStreams = Object.fromEntries(
    templateConfigs.map((templateConfig) => {
      return [templateConfig.templateId, templateConfig.stream];
    })
  );
  const defaultTemplateId =
    templateConfigs.find((templateConfig) => {
      return templateConfig.templateId === resolvedConfig.defaults.templateId;
    })?.templateId ?? templateConfigs[0]?.templateId;

  return {
    diagnostics,
    streamConfigPath,
    localDataPath: "localData",
    templates,
    defaults: {
      templateId: defaultTemplateId,
      entityId: resolvedConfig.defaults.entityId,
      locale: resolvedConfig.defaults.locale,
    },
    templateDefaults,
    templateStreams,
    entitiesByTemplate,
    documents,
  };
};

const readTemplateManifestEntries = (
  rootDir: string,
  diagnostics: string[]
): TemplateManifestEntry[] => {
  const manifestPath = path.join(rootDir, ".template-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    diagnostics.push(
      "Missing .template-manifest.json. Start the Vite dev server with the Visual Editor plugin enabled to generate template metadata."
    );
    return [];
  }

  const manifest = readJsonFile<TemplateManifestFile>(
    manifestPath,
    "template manifest"
  );
  return (manifest.templates ?? []).map((templateEntry) => {
    return {
      name: templateEntry.name,
      defaultLayoutData: templateEntry.defaultLayoutData,
    };
  });
};

const readLocalEditorDocuments = (
  localDataPath: string,
  templateConfigs: ResolvedLocalEditorTemplateConfig[],
  diagnostics: string[]
): LocalEditorDocumentIndexEntry[] => {
  if (!fs.existsSync(localDataPath)) {
    diagnostics.push(
      `Missing localData snapshots at ${path.relative(process.cwd(), localDataPath)}. Run your existing Pages local data generation flow first.`
    );
    return [];
  }

  const mappingPath = path.join(localDataPath, "mapping.json");
  if (!fs.existsSync(mappingPath)) {
    diagnostics.push(
      `Missing local editor snapshot mapping at ${path.relative(process.cwd(), mappingPath)}. Run yext pages generate-test-data to populate local editor snapshots.`
    );
    return [];
  }

  let mapping: Record<string, string[]>;
  try {
    mapping = readJsonFile<Record<string, string[]>>(
      mappingPath,
      "local data mapping"
    );
  } catch (error) {
    diagnostics.push(toErrorMessage(error));
    return [];
  }

  const documents: LocalEditorDocumentIndexEntry[] = [];

  for (const templateConfig of templateConfigs) {
    const referencedFileNames = new Set(
      mapping[templateConfig.dataTemplateName] ?? []
    );
    if (referencedFileNames.size === 0) {
      diagnostics.push(
        `Missing local editor snapshot mapping for template "${templateConfig.templateId}" in ${path.relative(process.cwd(), mappingPath)}. Expected generated mapping key "${templateConfig.dataTemplateName}". Run yext pages generate-test-data after enabling localEditor.`
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
            templateId: templateConfig.templateId,
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

const buildEntitiesByTemplate = (
  templateIds: string[],
  documents: LocalEditorDocumentIndexEntry[]
): Record<string, LocalEditorEntityOption[]> => {
  return Object.fromEntries(
    templateIds.map((templateId) => {
      return [templateId, buildEntityOptionsForTemplate(templateId, documents)];
    })
  );
};

const buildEntityOptionsForTemplate = (
  templateId: string,
  documents: LocalEditorDocumentIndexEntry[]
): LocalEditorEntityOption[] => {
  const entityMap = new Map<string, LocalEditorEntityOption>();

  for (const document of documents) {
    if (document.templateId !== templateId) {
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
