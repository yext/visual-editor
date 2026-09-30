import path from "node:path";
import fs from "fs-extra";
import type { LibraryMetadata } from "../../../../types/sectionLibrary.ts";
import type { ValidationIssue } from "../../types.ts";

const safeIdPattern = /^[A-Za-z0-9_-]{1,64}$/;
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
  if (id && !safeIdPattern.test(id)) {
    addIssue(
      "field/id/safe",
      "id must be at most 64 characters and may contain only letters, numbers, underscores, and hyphens."
    );
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
