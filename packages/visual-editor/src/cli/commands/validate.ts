import {
  createValidationContext,
  validateSectionLibrary,
} from "../../internal/sectionLibraryValidation/validateSectionLibrary.ts";
import type { ValidationStage } from "../../internal/sectionLibraryValidation/types.ts";
import { defineYextveCommand } from "../command.ts";
import { renderValidationResult } from "../output.ts";

const usage = `Usage:
  yextve validate [--skip-api-check] [--skip-repo-structure-check] [--skip-code-check]

Validate the Section Library in the current working directory.

Options:
  --skip-api-check                 Skip library.json metadata validation.
  --skip-repo-structure-check      Skip repository structure validation.
  --skip-code-check                Skip import and code-safety validation.
  -h, --help                       Show this help.

Example:
  npx --package=@yext/visual-editor@latest yextve validate
`;

export const validateCmd = defineYextveCommand({
  usage,
  parseArgsConfig: {
    strict: true,
    allowPositionals: false,
    options: {
      help: { type: "boolean", short: "h" },
      yextCI: { type: "boolean" },
      "skip-api-check": { type: "boolean" },
      "skip-repo-structure-check": { type: "boolean" },
      "skip-code-check": { type: "boolean" },
    },
  },
  run: (values, _positionals, io, rootDir) => {
    try {
      const skippedStages = new Set<ValidationStage>();
      if (values["skip-api-check"]) {
        skippedStages.add("api");
      }
      if (values["skip-repo-structure-check"]) {
        skippedStages.add("structure");
      }
      if (values["skip-code-check"]) {
        skippedStages.add("code");
      }

      const context = createValidationContext(rootDir, {
        yextCI: values.yextCI,
        skippedStages,
      });

      const result = validateSectionLibrary(context);

      io.stdout.write(
        renderValidationResult(result, !!io.stdout.isTTY && !context.yextCI)
      );

      return result.issues.length === 0 ? 0 : 1;
    } catch (error) {
      io.stderr.write(
        `Validation could not be completed: ${error instanceof Error ? error.message : String(error)}\n`
      );
      return 2;
    }
  },
});
