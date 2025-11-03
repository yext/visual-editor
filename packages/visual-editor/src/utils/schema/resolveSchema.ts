import { StreamDocument } from "../applyTheme";
import { embeddedFieldRegex, findField } from "../resolveYextEntityField";

const stringifyResolvedField = (fieldValue: any): string => {
  if (fieldValue === undefined || fieldValue === null) {
    return "";
  }

  let stringToEmbed: string;
  if (typeof fieldValue === "string") {
    // If the value is already a string, that's what we want to embed.
    stringToEmbed = fieldValue;
  } else {
    // For non-string types (objects, arrays, numbers, booleans, null),
    // we first convert them to their standard JSON string representation.
    stringToEmbed = JSON.stringify(fieldValue);
  }

  // Now, take the string we want to embed and prepare it to be a value
  // in a JSON string. This requires escaping its special characters (like " and \).
  // JSON.stringify() on a string does exactly this, and wraps the result in quotes.
  const jsonStringLiteral = JSON.stringify(stringToEmbed);

  // We return the content *inside* the quotes, which is the properly escaped string.
  return jsonStringLiteral.slice(1, -1);
};

export const resolveSchemaJson = (
  streamDocument: StreamDocument,
  schema: string
): string => {
  return schema.replace(embeddedFieldRegex, (_, fieldName) => {
    const resolvedValue = findField(streamDocument, fieldName);

    if (resolvedValue === undefined || resolvedValue === null) {
      return "";
    }

    return stringifyResolvedField(resolvedValue);
  });
};
