import type { Config } from "@puckeditor/core";
import type { TailwindConfig, ThemeConfig } from "../utils/themeResolver.ts";
import type { LocalDevOptions } from "../editor/types.ts";
import type {
  LocalEditorDocumentResponse,
  LocalEditorEntityOption,
  LocalEditorManifestResponse,
  LocalEditorTemplateDefaults,
} from "../vite-plugin/local-editor/types.ts";

export type { LocalEditorDocumentResponse, LocalEditorManifestResponse };

export type LocalEditorEntity = LocalEditorEntityOption;

export type LocalEditorSelection = {
  supportedTemplateIds: string[];
  activeEntities: LocalEditorEntity[];
  selectedTemplateId: string;
  selectedTemplateDefaults?: LocalEditorTemplateDefaults;
  selectedEntity?: LocalEditorEntity;
  selectedLocale: string;
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
  selectedEntity?: LocalEditorEntity;
  selectedLocale: string;
  selectedTemplateDefaults?: LocalEditorTemplateDefaults;
};

export type BuildEditorLocalDevOptions = (
  args: BuildEditorLocalDevOptionsArgs
) => LocalDevOptions | undefined;
