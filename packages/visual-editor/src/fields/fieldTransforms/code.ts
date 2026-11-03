import type { CodeField } from "../CodeField.tsx";
import { processHandlebarsTemplate } from "../../utils/customCodeHandlebars.ts";
import { resolveEmbeddedFieldsInString } from "../../utils/resolveYextEntityField.ts";
import type { FieldTransformContext } from "./resolveValue.ts";

/** Processes HTML templates and JavaScript embedded fields for rendering. */
export function resolveCode(
  field: CodeField,
  value: string | undefined,
  context: FieldTransformContext
): string {
  if (field.codeLanguage === "html") {
    return processHandlebarsTemplate(value ?? "", context.streamDocument);
  }
  if (field.codeLanguage === "javascript") {
    return resolveEmbeddedFieldsInString(
      value ?? "",
      context.streamDocument,
      context.streamDocument.locale
    );
  }
  return value ?? "";
}
