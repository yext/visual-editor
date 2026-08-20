import { describe, expect, it } from "vitest";
import {
  testCTAFieldAiSchema,
  testEntityFieldAiSchema,
  testImageFieldAiSchema,
  testRichTextFieldAiSchema,
  yextAiFieldTypes,
} from "./fieldTypes.ts";

describe("yextAiFieldTypes", () => {
  it("registers the spike test field family with schemas and descriptions", () => {
    expect(Object.keys(yextAiFieldTypes)).toEqual([
      "testEntityField",
      "testCTA",
      "testImage",
      "testRichText",
    ]);

    expect(yextAiFieldTypes.testEntityField.schema).toEqual(
      testEntityFieldAiSchema
    );
    expect(yextAiFieldTypes.testCTA.schema).toEqual(testCTAFieldAiSchema);
    expect(yextAiFieldTypes.testImage.schema).toEqual(testImageFieldAiSchema);
    expect(yextAiFieldTypes.testRichText.schema).toEqual(
      testRichTextFieldAiSchema
    );

    expect(yextAiFieldTypes.testEntityField.description).toContain("[[name]]");
    expect(yextAiFieldTypes.testCTA.description).toContain(
      "constantValueEnabled"
    );
    expect(yextAiFieldTypes.testImage.description).toContain("alternateText");
    expect(yextAiFieldTypes.testRichText.description).toContain("rich text");
  });
});
