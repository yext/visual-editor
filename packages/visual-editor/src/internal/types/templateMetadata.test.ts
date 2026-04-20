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

  it("preserves linked entity schemas when provided", () => {
    const metadata = {
      ...generateTemplateMetadata(),
      linkedEntitySchemas: {
        c_linkedLocation: {
          displayName: "Linked Location",
          fields: [
            {
              name: "name",
              displayName: "Name",
              definition: {
                name: "name",
                typeName: "type.string",
                type: {},
              },
            },
          ],
        },
      },
    };

    expect(metadata.linkedEntitySchemas?.c_linkedLocation.displayName).toBe(
      "Linked Location"
    );
    expect(metadata.linkedEntitySchemas?.c_linkedLocation.fields[0]?.name).toBe(
      "name"
    );
  });
});
