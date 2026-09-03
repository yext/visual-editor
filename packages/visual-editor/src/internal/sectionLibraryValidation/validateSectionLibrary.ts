import { validateApi } from "./stages/api/api.ts";
import { validateCode } from "./stages/code/validateCode.ts";
import { validateSectionLibraryStructure } from "./stages/structure/structure.ts";
import type {
  ValidationContext,
  ValidationIssue,
  ValidationResult,
  ValidationStage,
} from "./types.ts";

const stagesSkippedInYextCI: Set<ValidationStage> = new Set(["api"]);
const categoryOrder: ValidationStage[] = ["api", "structure", "code"];

export const createValidationContext = (
  rootDir: string,
  options: {
    yextCI?: boolean;
    skippedStages?: Iterable<ValidationStage>;
  } = {}
): ValidationContext => {
  const yextCI = options.yextCI ?? false;
  const skippedStages = new Set(options.skippedStages ?? []);
  if (yextCI) {
    for (const stage of stagesSkippedInYextCI) {
      skippedStages.add(stage);
    }
  }
  return { rootDir, yextCI, skippedStages };
};

export const validateSectionLibrary = (
  context: ValidationContext
): ValidationResult => {
  const apiResult = context.skippedStages.has("api")
    ? { issues: [], metadata: undefined }
    : validateApi(context.rootDir);

  const structureResult = context.skippedStages.has("structure")
    ? { issues: [], structure: undefined }
    : validateSectionLibraryStructure(context.rootDir);

  const codeIssues = context.skippedStages.has("code")
    ? []
    : validateCode(context.rootDir);

  const issues = sortValidationIssues([
    ...apiResult.issues,
    ...structureResult.issues,
    ...codeIssues,
  ]);

  return {
    context,
    issues,
    metadata: apiResult.metadata,
    structure: structureResult.structure,
  };
};

export const sortValidationIssues = (
  issues: ValidationIssue[]
): ValidationIssue[] =>
  [...issues].sort((left, right) => {
    return (
      categoryOrder.indexOf(left.category) -
        categoryOrder.indexOf(right.category) ||
      compareStrings(left.filePath, right.filePath) ||
      (left.line ?? 0) - (right.line ?? 0) ||
      (left.column ?? 0) - (right.column ?? 0) ||
      compareStrings(left.rule, right.rule)
    );
  });

const compareStrings = (left: string, right: string): number =>
  left === right ? 0 : left < right ? -1 : 1;
