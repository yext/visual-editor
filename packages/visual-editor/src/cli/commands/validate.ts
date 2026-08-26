import { parseArgs } from "node:util";
import {
  createValidationContext,
  validateSectionLibrary,
} from "../../internal/sectionLibraryValidation/validateSectionLibrary.ts";
import type { ValidationStage } from "../../internal/sectionLibraryValidation/types.ts";
import { renderValidationResult } from "../output.ts";

type ValidateCommandIo = {
  stdout: Pick<NodeJS.WriteStream, "write" | "isTTY">;
};

export const runValidateCommand = (
  args: string[],
  io: ValidateCommandIo,
  rootDir: string
): number => {
  const { values } = parseArgs({
    args,
    strict: true,
    allowPositionals: false,
    options: {
      yextCI: { type: "boolean" },
      "skip-api-check": { type: "boolean" },
      "skip-repo-structure-check": { type: "boolean" },
      "skip-code-check": { type: "boolean" },
    },
  });

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
};
