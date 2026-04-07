import type { YextSchemaField } from "../../types/entityFields.ts";

export type LocalEditorOptions = {
  enabled?: boolean;
};

export type LocalEditorDefaults = {
  templateId?: string;
  locale?: string;
  entityId?: string;
};

export type LocalEditorStreamField =
  | string
  | {
      name: string;
      fullObject?: boolean;
    };

export type LocalEditorStreamDefinition = {
  fields?: LocalEditorStreamField[];
} & Record<string, unknown>;

export type LocalEditorPagesStream = {
  $id?: string;
  fields: string[];
  filter?: {
    entityIds?: string[];
    entityTypes?: string[];
    savedFilterIds?: string[];
  };
  localization?: {
    locales?: string[];
    primary?: true;
  };
  transform?: {
    expandOptionFields?: string[];
    replaceOptionValuesWithDisplayNames?: string[];
  };
  includeCertifiedFacts?: boolean;
};

export type LocalEditorTemplateConfig = {
  defaults?: Omit<LocalEditorDefaults, "templateId">;
  stream?: LocalEditorStreamDefinition;
};

export type LocalEditorConfig = {
  defaults?: LocalEditorDefaults;
  templates?: Record<string, LocalEditorTemplateConfig>;
};

export type TemplateManifestEntry = {
  name: string;
  defaultLayoutData?: unknown;
};

export type TemplateManifestFile = {
  templates?: TemplateManifestEntry[];
};

export type LocalEditorTemplateDefaults = {
  entityId?: string;
  locale?: string;
  defaultLayoutData?: unknown;
};

export type ResolvedLocalEditorTemplateConfig = {
  templateId: string;
  dataTemplateName: string;
  defaults: Omit<LocalEditorDefaults, "templateId">;
  stream?: LocalEditorStreamDefinition;
  defaultLayoutData?: unknown;
};

export type LocalEditorDocumentIndexEntry = {
  templateId: string;
  entityId: string;
  displayName: string;
  locale: string;
  filePath: string;
  fileName: string;
};

export type LocalEditorEntityOption = {
  entityId: string;
  displayName: string;
  locales: string[];
};

export type LocalEditorManifestResponse = {
  templates: string[];
  entitiesByTemplate: Record<string, LocalEditorEntityOption[]>;
  templateDefaults: Record<string, LocalEditorTemplateDefaults>;
  defaults: {
    templateId?: string;
    entityId?: string;
    locale?: string;
  };
  diagnostics: string[];
  streamConfigPath: string;
  localDataPath: string;
};

export type LocalEditorDocumentResponse = {
  document: Record<string, unknown> | null;
  entityFields: {
    fields: YextSchemaField[];
    displayNames: Record<string, string>;
  };
  diagnostics: string[];
};

export type LocalEditorContext = {
  diagnostics: string[];
  streamConfigPath: string;
  localDataPath: string;
  templates: string[];
  defaults: LocalEditorDefaults;
  templateDefaults: Record<string, LocalEditorTemplateDefaults>;
  templateStreams: Record<string, LocalEditorStreamDefinition | undefined>;
  entitiesByTemplate: Record<string, LocalEditorEntityOption[]>;
  documents: LocalEditorDocumentIndexEntry[];
};

export type ResolvedLocalEditorConfig = {
  defaults: LocalEditorDefaults;
  templates: ResolvedLocalEditorTemplateConfig[];
};
