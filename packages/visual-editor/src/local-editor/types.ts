import type { Config } from "@puckeditor/core";
import type { TailwindConfig, ThemeConfig } from "../utils/themeResolver.ts";
import type {
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  LocalEditorLayoutDefaults,
} from "../vite-plugin/local-editor/types.ts";

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
};

export type LocalEditorMode = "layout" | "theme";

export type BuildEditorLocalDevOptionsArgs = {
  selectedLayoutId: string;
  selectedEntity?: LocalEditorEntityOption;
  selectedLocale: string;
  selectedLayoutDefaults?: LocalEditorLayoutDefaults;
};
