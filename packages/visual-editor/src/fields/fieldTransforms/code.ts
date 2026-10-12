import Handlebars from "handlebars";
import type { CodeField } from "../CodeField.tsx";
import { processHandlebarsTemplate } from "../../utils/customCodeHandlebars.ts";
import { resolveEmbeddedFieldsInString } from "../../utils/resolveYextEntityField.ts";
import type { FieldTransformContext } from "./resolveValue.ts";

/** Resolves HTML templates and embedded fields in authored code. */
export function resolveCode(
  field: CodeField,
  value: string | undefined,
  context: FieldTransformContext
): string {
  const isHtml = field.codeLanguage === "html";
  return resolveEmbeddedFieldsInString(
    isHtml
      ? processHandlebarsTemplate(value ?? "", context.streamDocument)
      : (value ?? ""),
    context.streamDocument,
    context.locale,
    isHtml ? Handlebars.escapeExpression : undefined
  );
}
