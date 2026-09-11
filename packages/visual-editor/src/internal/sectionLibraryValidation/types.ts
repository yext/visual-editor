import type {
  LibraryMetadata,
  PageSetType,
  SectionConfig,
  SectionLibraryLayout,
  SharedHiddenPuckComponent,
} from "../../types/sectionLibrary.ts";

/** The stages of validation. Each can be run or skipped independently. */
export type ValidationStage = "api" | "structure" | "code";

/** A problem found while validating a Section Library. */
export type ValidationIssue = {
  category: ValidationStage;
  severity?: "warning";
  filePath: string;
  line?: number;
  column?: number;
  message: string;
  rule: string;
};

/**
 * The Section Library-defined translations.
 * Merged with visual-editor translations, with section library values taking precedence.
 */
export type SectionLibraryTranslationResources = {
  platform: Record<string, string>;
  page: Record<string, string>;
};

/** The configuration for a Section Library validation run. */
export type ValidationContext = {
  rootDir: string;
  yextCI: boolean;
  skippedStages: ReadonlySet<ValidationStage>;
};

/** A section config augmented with its resolved component name and source path. */
export type ResolvedSection = SectionConfig & {
  componentName: string;
  sourcePath: string;
};

/** The resolved sections, shared components, and layouts in a Section Library. */
export type ResolvedSectionLibraryStructure = {
  sections: ResolvedSection[];
  sharedComponents: SharedHiddenPuckComponent[];
  sharedRootPageSetTypes: PageSetType[];
  layouts: SectionLibraryLayout[];
  migrationIds: string[];
  translationResources: SectionLibraryTranslationResources;
};

/** The result of a Section Library validation run. */
export type ValidationResult = {
  context: ValidationContext;
  issues: ValidationIssue[];
  metadata?: LibraryMetadata;
  structure?: ResolvedSectionLibraryStructure;
};
