import { describe, expect, it } from "vitest";
import { migrateImageField } from "./migrateImageField.ts";
import { imageFieldMigration } from "../components/migrations/0083_image_field.ts";

describe("image field migration", () => {
  it.each([
    {
      name: "mapped binding",
      value: { field: "photo", constantValue: { url: "/static.jpg" } },
      expected: {
        field: "photo",
        constantValueEnabled: false,
        constantValue: {
          defaultValue: { url: "/static.jpg" },
          hasLocalizedValue: "true",
        },
      },
    },
    {
      name: "static complex image",
      value: {
        field: "photo",
        constantValueEnabled: true,
        constantValue: {
          image: { url: "/static.jpg" },
          description: "Caption",
        },
      },
      expected: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          defaultValue: { url: "/static.jpg" },
          hasLocalizedValue: "true",
        },
      },
    },
    {
      name: "localized static image",
      value: {
        en: { image: { url: "/en.jpg" } },
        fr: { url: "/fr.jpg" },
        hasLocalizedValue: "true",
      },
      expected: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: { url: "/en.jpg" },
          fr: { url: "/fr.jpg" },
          defaultValue: { url: "/en.jpg" },
          hasLocalizedValue: "true",
        },
      },
    },
  ])(
    "when migrating $name then authored mappings and localized images are preserved",
    ({ value, expected }) => {
      const before = structuredClone(value);
      expect(migrateImageField(value, { locale: "en" })).toEqual(expected);
      const action = imageFieldMigration.ImageWrapper;
      if (action.action !== "updated")
        throw new Error("Expected updated migration");
      expect(
        action.propTransformation(
          { id: "image", data: { image: value, link: "#" } },
          { locale: "en" }
        )
      ).toEqual({ id: "image", data: { image: expected, link: "#" } });
      expect(value).toEqual(before);
    }
  );
});
