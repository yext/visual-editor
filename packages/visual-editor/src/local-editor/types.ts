import type { Config } from "@puckeditor/core";
import type { TailwindConfig, ThemeConfig } from "../utils/themeResolver.ts";
import type {
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  LocalEditorTemplateDefaults,
} from "../vite-plugin/local-editor/types.ts";

export type {
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  LocalEditorTemplateDefaults,
};

export type LocalEditorShellProps = {
  apiBasePath: string;
  routePath: string;
  componentRegistry: Record<string, Config<any>>;
  tailwindConfig: TailwindConfig;
  themeConfig?: ThemeConfig;
};

export type BuildEditorLocalDevOptionsArgs = {
  selectedTemplateId: string;
  selectedEntity?: LocalEditorEntityOption;
  selectedLocale: string;
  selectedTemplateDefaults?: LocalEditorTemplateDefaults;
};
