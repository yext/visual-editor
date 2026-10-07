import path from "node:path";
import fs from "fs-extra";
import type { LibraryMetadata } from "../../../../types/sectionLibrary.ts";
import type { ValidationIssue } from "../../types.ts";

// Require the actual end of input; JavaScript $ also matches before a trailing newline.
const safeIdPattern = /^[a-z][a-z0-9-]{0,61}[a-z0-9](?![\s\S])/;
const descriptionMaxLength = 1024;

/** validateLibraryMetadata validates that the library.json has the required fields. */
export const validateLibraryMetadata = (
  rootDir: string
): { issues: ValidationIssue[]; metadata?: LibraryMetadata } => {
  const filePath = path.join(rootDir, "src", "library", "library.json");
  const relativePath = path.relative(rootDir, filePath);

  const issues: ValidationIssue[] = [];
  const addIssue = (rule: string, message: string): void => {
    issues.push({ category: "api", filePath: relativePath, message, rule });
  };

  if (!fs.existsSync(filePath)) {
    addIssue("file/missing", "Library metadata file does not exist.");
    return { issues };
  }

  let metadataFile: unknown;
  try {
    metadataFile = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    addIssue(
      "json/invalid",
      `Library metadata is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
    return { issues };
  }

  if (
    !metadataFile ||
    typeof metadataFile !== "object" ||
    Array.isArray(metadataFile)
  ) {
    addIssue("json/object", "Library metadata must be a JSON object.");
    return { issues };
  }

  const metadataJson = metadataFile as Record<string, unknown>;
  // If we mutate the metadata schema in the future, we will introduce a new version
  // so that existing files continue to be validated against the version 1 schema.
  if (metadataJson.schemaVersion !== 1) {
    addIssue("schema/version", "schemaVersion must equal 1.");
  }

  const libraryMetadataValues = new Map<string, string>();
  // Confirm presence of required fields
  for (const field of ["id", "displayName"] as const) {
    const fieldValue = metadataJson[field];
    if (typeof fieldValue !== "string") {
      addIssue(`field/${field}/type`, `${field} must be a string.`);
    } else if (!fieldValue.trim()) {
      addIssue(`field/${field}/empty`, `${field} must not be empty.`);
    } else {
      libraryMetadataValues.set(field, fieldValue);
    }
  }

  const description = metadataJson.description;
  if (description === undefined) {
    libraryMetadataValues.set("description", "");
  } else if (typeof description !== "string") {
    addIssue("field/description/type", "description must be a string.");
  } else if (Array.from(description).length > descriptionMaxLength) {
    addIssue(
      "field/description/length",
      `description must be at most ${descriptionMaxLength} characters.`
    );
  } else {
    libraryMetadataValues.set("description", description);
  }

  // Validate id
  const id = libraryMetadataValues.get("id");
  if (id) {
    const unprefixedId = id.startsWith("yext_") ? id.slice(5) : id;
    if (id.length > 63 || !safeIdPattern.test(unprefixedId)) {
      addIssue(
        "field/id/safe",
        'id must be 2–63 characters, contain only lowercase letters, numbers, and hyphens, start with a lowercase letter, and end with a letter or number. Built-in library ids must also use the reserved "yext_" prefix, included in the length limit.'
      );
    }
  }

  if (issues.length > 0) {
    return { issues };
  }

  return {
    issues,
    metadata: {
      schemaVersion: 1,
      id: libraryMetadataValues.get("id")!,
      displayName: libraryMetadataValues.get("displayName")!,
      description: libraryMetadataValues.get("description")!,
    },
  };
};
