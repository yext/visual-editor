import type { Config, Data } from "@puckeditor/core";
import type { TailwindConfig, ThemeConfig } from "../utils/themeResolver.ts";
import type { MigrationRegistry } from "../utils/migrate.ts";
import type {
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  LocalEditorLayoutDefaults,
} from "../vite-plugin/local-editor/types.ts";
import type { SectionLibraryTranslationLoaders } from "../utils/i18n/translationResources.ts";

export type {
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  LocalEditorLayoutDefaults,
};

export type LocalEditorShellProps = {
  apiBasePath: string;
  routePath: string;
  componentRegistry: Record<string, Config<any>>;
  tailwindConfig: TailwindConfig;
  themeConfig?: ThemeConfig;
  sectionLibraryMigrationRegistry?: MigrationRegistry;
  translationLoaders?: SectionLibraryTranslationLoaders;
  chatEnabled?: boolean;
};

export type LocalEditorMode = "layout" | "theme";

export type BuildEditorLocalDevOptionsArgs = {
  selectedLayoutId: string;
  selectedEntity?: LocalEditorEntityOption;
  selectedLocale: string;
  selectedLayoutDefaults?: LocalEditorLayoutDefaults;
};

export type GenerationTokenUsage = {
  cachedInput: number;
  uncachedInput: number;
  output: number;
};

/** The model authors only the editor’s component content. */
export type GeneratedContent = Pick<Data, "content">;
