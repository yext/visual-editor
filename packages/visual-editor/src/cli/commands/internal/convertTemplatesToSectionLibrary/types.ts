/**
 * Defines the legacy template, base library, and conversion data shared by
 * the migration stages.
 */
import type {
  EntityLayoutMetadata,
  LibraryMetadata,
  PageSetType,
} from "../../../../types/sectionLibrary.ts";

export type JsonRecord = Record<string, any>;

type LegacyComponent = {
  displayName: string;
  id: string;
  content: string;
};

export type LegacyTemplate = {
  templateId: string;
  directory: string;
  metadata: JsonRecord;
  defaultLayout: JsonRecord;
  components: LegacyComponent[];
};

export type BaseLayout = {
  directory: string;
  metadata: { id: string; pageSetType: PageSetType; [key: string]: any };
};

export type BaseLibrary = {
  directory: BaseLayout;
  locator: BaseLayout;
  layouts: BaseLayout[];
};

export type PreparedBaseLibrary = {
  directory: string;
  temporaryDirectory?: string;
};

export type CopiedComponent = LegacyComponent & { templateId: string };

export type TemplateHeaderFooterSelection = {
  kind: "header" | "footer";
  matches: string[];
  component?: JsonRecord & { type: string };
};

export type TemplateHeaderFooter = {
  header: TemplateHeaderFooterSelection;
  footer: TemplateHeaderFooterSelection;
};

export type Conversion = {
  baseLibrary: BaseLibrary;
  templateHeaderFooter: TemplateHeaderFooter;
  components: Map<string, CopiedComponent>;
  directoryLayoutId: string;
  duplicates: {
    componentId: string;
    keptTemplateId: string;
    ignoredTemplateId: string;
    differs: boolean;
  }[];
  entityLayoutMetadata: Map<string, EntityLayoutMetadata>;
  libraryMetadata: LibraryMetadata;
  locatorLayoutId: string;
  templates: LegacyTemplate[];
};
