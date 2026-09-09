import pc from "picocolors";
import { formatValidationIssue } from "../internal/sectionLibraryValidation/validationError.ts";
import type {
  ValidationResult,
  ValidationStage,
} from "../internal/sectionLibraryValidation/types.ts";

const stages: { stage: ValidationStage; label: string }[] = [
  { stage: "api", label: "API checks" },
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
    const errors = issues.filter((issue) => issue.severity !== "warning");
    const warnings = issues.filter((issue) => issue.severity === "warning");

    if (errors.length === 0) {
      lines.push(
        `${label}: ${colors.green(
          warnings.length === 0
            ? "passed"
            : `passed (${warnings.length} ${warnings.length === 1 ? "warning" : "warnings"})`
        )}`
      );
      lines.push(
        ...warnings.map((issue) => `  ${formatValidationIssue(issue)}`)
      );
      continue;
    }

    lines.push(
      `${label}: ${colors.red(
        `failed (${errors.length} ${errors.length === 1 ? "error" : "errors"})`
      )}`
    );

    lines.push(...issues.map((issue) => `  ${formatValidationIssue(issue)}`));
  }

  lines.push("");
  const errorCount = result.issues.filter(
    (issue) => issue.severity !== "warning"
  ).length;
  const warningCount = result.issues.length - errorCount;
  lines.push(
    errorCount === 0
      ? colors.green(
          warningCount === 0
            ? "Validation passed. 0 errors."
            : `Validation passed. 0 errors, ${warningCount} ${warningCount === 1 ? "warning" : "warnings"}.`
        )
      : colors.red(
          `Validation failed. ${errorCount} ${errorCount === 1 ? "error" : "errors"}${warningCount === 0 ? "." : `, ${warningCount} ${warningCount === 1 ? "warning" : "warnings"}.`}`
        )
  );
  return `${lines.join("\n")}\n`;
};
