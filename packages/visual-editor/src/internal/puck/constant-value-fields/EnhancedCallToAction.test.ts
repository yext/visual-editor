import { describe, it, expect } from "vitest";
import { getCTAType, ctaTypeToEntityFieldType } from "./EnhancedCallToAction";
import { YextEntityField } from "@yext/visual-editor";

describe("getCTAType", () => {
  describe("with constantValueEnabled", () => {
    it("returns ctaType from constantValue when constantValueEnabled is true", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {
          ctaType: "getDirections",
          label: "Get Directions",
        },
        constantValueEnabled: true,
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "getDirections",
      });
    });

    it("returns textAndLink ctaType from constantValue", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {
          ctaType: "textAndLink",
          label: "Learn More",
          link: "https://example.com",
        },
        constantValueEnabled: true,
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "textAndLink",
      });
    });

    it("returns presetImage ctaType from constantValue", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {
          ctaType: "presetImage",
          presetImageType: "app-store",
        },
        constantValueEnabled: true,
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "presetImage",
      });
    });
  });

  describe("with field selection", () => {
    it("returns ctaType from selectedType when constantValueEnabled is false", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {
          ctaType: "textAndLink",
        },
        constantValueEnabled: false,
        selectedType: "getDirections",
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "getDirections",
      });
    });

    it("returns textAndLink from selectedType", () => {
      const entityField: YextEntityField<any> = {
        field: "c_primaryCta",
        constantValue: {},
        selectedType: "textAndLink",
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "textAndLink",
      });
    });

    it("returns presetImage from selectedType", () => {
      const entityField: YextEntityField<any> = {
        field: "c_appStoreCta",
        constantValue: {},
        selectedType: "presetImage",
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "presetImage",
      });
    });
  });

  describe("edge cases", () => {
    it("returns undefined when ctaType is not set in constantValue", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {},
        constantValueEnabled: true,
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: undefined,
      });
    });

    it("returns undefined when selectedType is not set", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {},
        constantValueEnabled: false,
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: undefined,
      });
    });

    it("handles missing constantValueEnabled property", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {
          ctaType: "getDirections",
        },
        selectedType: "textAndLink",
      };

      const result = getCTAType(entityField);

      // When constantValueEnabled is undefined/falsy, should use selectedType
      expect(result).toEqual({
        ctaType: "textAndLink",
      });
    });
  });

  describe("no longer returns coordinate", () => {
    it("does not include coordinate in return value", () => {
      const entityField: YextEntityField<any> = {
        field: "c_cta",
        constantValue: {
          ctaType: "getDirections",
          coordinate: { latitude: 40.7128, longitude: -74.0060 },
        },
        constantValueEnabled: true,
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "getDirections",
      });
      expect(result).not.toHaveProperty("coordinate");
    });

    it("ignores coordinate data in CTA object", () => {
      const entityField: YextEntityField<any> = {
        field: "yextDisplayCoordinate",
        constantValue: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
        selectedType: "getDirections",
      };

      const result = getCTAType(entityField);

      expect(result).toEqual({
        ctaType: "getDirections",
      });
      expect(result).not.toHaveProperty("coordinate");
    });
  });
});

describe("ctaTypeToEntityFieldType", () => {
  it("maps textAndLink to type.cta", () => {
    expect(ctaTypeToEntityFieldType.textAndLink).toBe("type.cta");
  });

  it("maps presetImage to type.cta", () => {
    expect(ctaTypeToEntityFieldType.presetImage).toBe("type.cta");
  });

  it("does not include getDirections mapping", () => {
    expect(ctaTypeToEntityFieldType).not.toHaveProperty("getDirections");
  });

  it("only has two mappings", () => {
    expect(Object.keys(ctaTypeToEntityFieldType)).toHaveLength(2);
  });
});