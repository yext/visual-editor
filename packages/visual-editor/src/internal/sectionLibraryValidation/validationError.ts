import type { ValidationIssue } from "./types.ts";

export const formatValidationIssue = (issue: ValidationIssue): string => {
  const position = issue.line
    ? `:${issue.line}${issue.column ? `:${issue.column}` : ""}`
    : "";
  return `${issue.filePath}${position}: ${issue.message}`;
};

export class SectionLibraryValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(
      `Section Library validation failed with ${issues.length} ${issues.length === 1 ? "error" : "errors"}:\n${issues.map(formatValidationIssue).join("\n")}`
    );
    this.name = "SectionLibraryValidationError";
  }
}
