import React from "react";
import { describe, it, expect, expectTypeOf, vi } from "vitest";
import { resolveComponentData } from "./resolveComponentData";
import {
  TranslatableRichText,
  TranslatableString,
  YextEntityField,
} from "@yext/visual-editor";

// Mock the MaybeRTF component to inspect its props
vi.mock("@yext/visual-editor", () => ({
  ...vi.importActual("@yext/visual-editor"),
  MaybeRTF: (props: any) => <div data-testid="MaybeRTF" {...props} />,
}));

const mockDocument = {
  name: "Yext",
  c_location: "New York",
  c_description: {
    hasLocalizedValue: "true",
    en: "English Description",
    es: "Descripción en español",
  },
  c_details: {
    hasLocalizedValue: "true",
    en: {
      html: "<strong>English</strong> Details with an [[c_location]]",
    },
    es: {
      html: "<strong>Detalles</strong> en español",
    },
  },
  c_nested: {
    field: "Nested Value",
  },
  c_employees: 500,
  c_isPublic: true,
  c_nullField: null,
  c_complex: {
    address: "123 Main St",
  },
};

describe("resolveComponentData", () => {
  describe("with document", () => {
    describe("with field path", () => {
      it("resolves a simple string field path", () => {
        const field: YextEntityField<string> = {
          constantValue: "",
          field: "name",
        };
        expect(resolveComponentData(field, "en", mockDocument)).toBe("Yext");
      });

      it("resolves a nested field path", () => {
        const field: YextEntityField<string> = {
          constantValue: "",
          field: "c_nested.field",
        };
        expect(resolveComponentData(field, "en", mockDocument)).toBe(
          "Nested Value"
        );
      });

      it("resolves a TranslatableString field path", () => {
        const field: YextEntityField<TranslatableString> = {
          constantValue: "",
          field: "c_description",
        };
        expect(resolveComponentData(field, "es", mockDocument)).toBe(
          "Descripción en español"
        );
      });

      it("resolves a TranslatableRichText field path", () => {
        const field: YextEntityField<TranslatableRichText> = {
          constantValue: "",
          field: "c_details",
        };
        const result = resolveComponentData(field, "es", mockDocument);
        expect(React.isValidElement(result)).toBe(true);
        if (React.isValidElement(result)) {
          const element = result as React.ReactElement<{
            data: TranslatableRichText;
          }>;
          expectTypeOf(element.props.data).not.toBeString();
          if (typeof element.props.data === "object") {
            expect(element.props.data.html).toBe(
              "<strong>Detalles</strong> en español"
            );
          }
        }
      });

      it("returns undefined for a non-existent field path", () => {
        const field: YextEntityField<string> = {
          constantValue: "",
          field: "nonexistent.path",
        };
        expect(resolveComponentData(field, "en", mockDocument)).toBeUndefined();
      });
    });

    describe("with constant values", () => {
      it("resolves a simple string constant value", () => {
        const field: YextEntityField<string> = {
          constantValue: "Constant String",
          constantValueEnabled: true,
          field: "",
        };
        expect(resolveComponentData(field, "en", mockDocument)).toBe(
          "Constant String"
        );
      });

      it("resolves a TranslatableString from a constant value", () => {
        const field: YextEntityField<TranslatableString> = {
          constantValue: {
            hasLocalizedValue: "true",
            en: "Hello",
            fr: "Bonjour",
          },
          constantValueEnabled: true,
          field: "",
        };
        expect(resolveComponentData(field, "fr", mockDocument)).toBe("Bonjour");
      });
      ``;
    });

    describe("with embedded fields", () => {
      it("resolves an embedded field in a constant string", () => {
        const field: YextEntityField<string> = {
          constantValue: "Welcome to [[c_location]]!",
          constantValueEnabled: true,
          field: "",
        };
        expect(resolveComponentData(field, "en", mockDocument)).toBe(
          "Welcome to New York!"
        );
      });

      it("resolves an embedded field in a constant TranslatableString", () => {
        const field: YextEntityField<TranslatableString> = {
          constantValue: {
            hasLocalizedValue: "true",
            en: "The city is [[c_location]].",
          },
          constantValueEnabled: true,
          field: "",
        };
        expect(resolveComponentData(field, "en", mockDocument)).toBe(
          "The city is New York."
        );
      });

      it("resolves an embedded field in a constant TranslatableRichText", () => {
        const field: YextEntityField<TranslatableRichText> = {
          constantValue: {
            hasLocalizedValue: "true",
            en: { html: "Location: <b>[[c_location]]</b>" },
          },
          constantValueEnabled: true,
          field: "",
        };
        const result = resolveComponentData(field, "en", mockDocument);
        expect(React.isValidElement(result)).toBe(true);
        if (React.isValidElement(result)) {
          const element = result as React.ReactElement<{
            data: TranslatableRichText;
          }>;
          expectTypeOf(element.props.data).not.toBeString();
          if (typeof element.props.data === "object") {
            expect(element.props.data.html).toBe("Location: <b>New York</b>");
          }
        }
      });

      it("resolves an embedded field that points to an object, stringifying it", () => {
        const field: YextEntityField<string> = {
          constantValue: "Data: [[c_complex]]",
          constantValueEnabled: true,
          field: "",
        };
        expect(resolveComponentData(field, "en", mockDocument)).toBe(
          'Data: {"address":"123 Main St"}'
        );
      });
    });

    describe("with direct translatable values", () => {
      it("resolves a direct TranslatableString with an embedded field", () => {
        const data: TranslatableString = {
          hasLocalizedValue: "true",
          en: "Direct string with [[name]]",
        };
        expect(resolveComponentData(data, "en", mockDocument)).toBe(
          "Direct string with Yext"
        );
      });

      it("resolves a direct TranslatableRichText with an embedded field", () => {
        const data: TranslatableRichText = {
          hasLocalizedValue: "true",
          en: { html: "Direct RTF with <b>[[name]]</b>" },
        };
        const result = resolveComponentData(data, "en", mockDocument);
        expect(React.isValidElement(result)).toBe(true);
        if (React.isValidElement(result)) {
          const element = result as React.ReactElement<{
            data: TranslatableRichText;
          }>;
          expectTypeOf(element.props.data).not.toBeString();
          if (typeof element.props.data === "object") {
            expect(element.props.data.html).toBe("Direct RTF with <b>Yext</b>");
          }
        }
      });
    });
  });

  describe("without document", () => {
    it("returns constantValue when document is missing", () => {
      const field: YextEntityField<string> = {
        constantValue: "Constant Only",
        constantValueEnabled: true,
        field: "",
      };
      expect(resolveComponentData(field, "en")).toBe("Constant Only");
    });

    it("returns the constant value for a field when document is missing", () => {
      const field: YextEntityField<string> = {
        constantValue: "constant_value",
        field: "name",
      };
      expect(resolveComponentData(field, "en")).toBe("constant_value");
    });

    it("does NOT resolve embedded fields in a constant string when document is missing", () => {
      const field: YextEntityField<string> = {
        constantValue: "Welcome to [[c_location]]!",
        constantValueEnabled: true,
        field: "",
      };
      expect(resolveComponentData(field, "en")).toBe(
        "Welcome to [[c_location]]!"
      );
    });

    it("resolves a direct TranslatableString but does not resolve embedded fields", () => {
      const data: TranslatableString = {
        hasLocalizedValue: "true",
        en: "Direct string with [[name]]",
      };
      expect(resolveComponentData(data, "en")).toBe(
        "Direct string with [[name]]"
      );
    });
  });

  describe("with missing values", () => {
    it("returns an empty string if the locale is missing from a TranslatableString", () => {
      const data: TranslatableString = { hasLocalizedValue: "true", en: "Hi" };
      expect(resolveComponentData(data, "fr", mockDocument)).toBe("");
    });

    it("returns an empty string if the locale is missing from a non-entity TranslatableString", () => {
      const data: TranslatableString = { hasLocalizedValue: "true", en: "Hi" };
      expect(resolveComponentData(data, "fr")).toBe("");
    });

    it("returns an empty string if the locale is missing from a TranslatableRichText", () => {
      const data: TranslatableRichText = {
        hasLocalizedValue: "true",
        en: { html: "Hi" },
      };
      expect(resolveComponentData(data, "fr", mockDocument)).toBe("");
    });

    it("handles a null value from the document gracefully", () => {
      const field: YextEntityField<null> = {
        constantValue: null,
        field: "c_nullField",
      };
      expect(resolveComponentData(field, "en", mockDocument)).toBeNull();
    });
  });

  it("handles a direct string value by returning it", () => {
    // This tests the path where a value is already fully resolved
    const result = (resolveComponentData as any)(
      "Just a string",
      "en",
      mockDocument
    );
    expect(result).toBe("Just a string");
  });
});
