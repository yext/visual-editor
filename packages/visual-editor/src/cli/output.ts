import pc from "picocolors";
import { formatValidationIssue } from "../internal/sectionLibraryValidation/validationError.ts";
import type {
  ValidationResult,
  ValidationStage,
} from "../internal/sectionLibraryValidation/types.ts";

const stages: { stage: ValidationStage; label: string }[] = [
  { stage: "api", label: "Library metadata" },
  { stage: "structure", label: "Repository structure" },
  { stage: "code", label: "Code checks" },
];

export const renderValidationResult = (
  result: ValidationResult,
  colorEnabled: boolean
): string => {
  const colors = pc.createColors(colorEnabled && pc.isColorSupported);
  const lines: string[] = [];

  for (const { stage, label } of stages) {
    if (result.context.skippedStages.has(stage)) {
      lines.push(`${label}: ${colors.yellow("skipped")}`);
      continue;
    }

    const issues = result.issues.filter((issue) => issue.category === stage);

    if (issues.length === 0) {
      lines.push(`${label}: ${colors.green("passed")}`);
      continue;
    }

    lines.push(
      `${label}: ${colors.red(
        `failed (${issues.length} ${issues.length === 1 ? "error" : "errors"})`
      )}`
    );

    lines.push(...issues.map((issue) => `  ${formatValidationIssue(issue)}`));
  }

  lines.push("");
  lines.push(
    result.issues.length === 0
      ? colors.green("Validation passed. 0 errors.")
      : colors.red(
          `Validation failed. ${result.issues.length} ${result.issues.length === 1 ? "error" : "errors"}.`
        )
  );
  return `${lines.join("\n")}\n`;
};
