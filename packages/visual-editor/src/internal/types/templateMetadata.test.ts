import { describe, expect, it } from "vitest";
import { generateTemplateMetadata } from "./templateMetadata.ts";

describe("generateTemplateMetadata", () => {
  it("keeps the default local-dev locator fields for non-locator documents", () => {
    const metadata = generateTemplateMetadata();

    expect(Object.keys(metadata.locatorDisplayFields ?? {})).toEqual([
      "name",
      "mainPhone",
    ]);
    expect(metadata.entityTypeDisplayName).toBe("Entity");
  });

  it("adds extended locator display fields for locator documents", () => {
    const metadata = generateTemplateMetadata({
      meta: {
        entityType: {
          id: "locator",
        },
      },
      __: {
        codeTemplate: "locator",
      },
    });

    expect(metadata.entityTypeDisplayName).toBe("Locator");
    expect(metadata.locatorDisplayFields?.slug?.field_type_id).toBe(
      "type.string"
    );
    expect(metadata.locatorDisplayFields?.hours?.field_type_id).toBe(
      "type.hours"
    );
    expect(metadata.locatorDisplayFields?.headshot?.field_type_id).toBe(
      "type.image"
    );
  });

  it("uses themeScopeKey for a shared local-dev theme entity", () => {
    const directoryMetadata = generateTemplateMetadata(undefined, {
      templateId: "directory",
      themeScopeKey: "local-editor",
    });
    const locatorMetadata = generateTemplateMetadata(undefined, {
      templateId: "locator",
      themeScopeKey: "local-editor",
    });

    expect(directoryMetadata.themeEntityId).toBeDefined();
    expect(directoryMetadata.themeEntityId).toBe(locatorMetadata.themeEntityId);
  });
});
