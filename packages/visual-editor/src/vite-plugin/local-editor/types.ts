import type { YextSchemaField } from "../../types/entityFields.ts";
import type { PageSetType } from "../../types/sectionLibrary.ts";

export type LocalEditorOptions = {
  enabled?: boolean;
};

export type LocalEditorDefaults = {
  layoutId?: string;
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
};

export type LocalEditorLayoutConfig = {
  defaults?: Omit<LocalEditorDefaults, "layoutId">;
  stream?: LocalEditorStreamDefinition;
};

export type LocalEditorConfig = {
  defaults?: LocalEditorDefaults;
  /** Environment values injected into every local-editor stream document. */
  env?: Record<string, string>;
  pageSetTypes?: Partial<Record<PageSetType, LocalEditorLayoutConfig>>;
  layouts?: Record<string, LocalEditorLayoutConfig>;
};

export type LocalEditorLayoutDefaults = {
  entityId?: string;
  locale?: string;
  defaultLayoutData?: unknown;
};

export type ResolvedLocalEditorLayoutConfig = {
  layoutId: string;
  dataTemplateName: string;
  pageSetType: PageSetType;
  dataSource: "stream" | "fixture";
  defaults: Omit<LocalEditorDefaults, "layoutId">;
  stream?: LocalEditorStreamDefinition;
  defaultLayoutData?: unknown;
};

export type LocalEditorDocumentIndexEntry = {
  layoutId: string;
  entityId: string;
  displayName: string;
  locale: string;
  filePath?: string;
  fileName: string;
  document?: Record<string, unknown>;
};

export type LocalEditorEntityOption = {
  entityId: string;
  displayName: string;
  locales: string[];
};

export type LocalEditorManifestResponse = {
  layouts: string[];
  pageSetTypeByLayout: Record<string, PageSetType>;
  dataSourceByLayout: Record<string, "stream" | "fixture">;
  entitiesByLayout: Record<string, LocalEditorEntityOption[]>;
  layoutDefaults: Record<string, LocalEditorLayoutDefaults>;
  defaults: LocalEditorDefaults;
  diagnostics: string[];
  streamConfigPath: string;
  localDataPath: string;
};

export type LocalEditorDocumentResponse = {
  document: Record<string, unknown> | null;
  /** Whether a Locator document uses built-in fixture data or real Search. */
  locatorDataSource?: "fixture" | "real";
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
  layouts: string[];
  defaults: LocalEditorDefaults;
  env: Record<string, string>;
  layoutDefaults: Record<string, LocalEditorLayoutDefaults>;
  layoutStreams: Record<string, LocalEditorStreamDefinition | undefined>;
  pageSetTypeByLayout: Record<string, PageSetType>;
  dataSourceByLayout: Record<string, "stream" | "fixture">;
  entitiesByLayout: Record<string, LocalEditorEntityOption[]>;
  documents: LocalEditorDocumentIndexEntry[];
};

export type ResolvedLocalEditorConfig = {
  defaults: LocalEditorDefaults;
  env: Record<string, string>;
  layouts: ResolvedLocalEditorLayoutConfig[];
};
