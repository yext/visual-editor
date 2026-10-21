// @vitest-environment node
import { describe, expect, it } from "vitest";
import { slottedFixture } from "./slottedGenerationTestUtils.ts";
import { compileGenerationPreparation } from "./generationPreparation.ts";

describe("page generation preparation", () => {
  it("carries card counts for collections, without generating section or card content", () => {
    const fixture = slottedFixture();
    const compiled = compileGenerationPreparation(fixture.catalog, [
      "en",
      "es",
    ]);
    expect(compiled.context.cardSources).toEqual([
      { componentType: "Section", cardType: "FAQCard" },
    ]);
    const preparation = {
      question: null,
      translationMode: "translate",
      cardCounts: [{ componentType: "Section", instanceIndex: null, count: 3 }],
    };
    expect(compiled.parseResponse(JSON.stringify(preparation))).toEqual({
      preparation,
    });
    const perInstance = {
      ...preparation,
      cardCounts: [
        { componentType: "Section", instanceIndex: 0, count: 3 },
        { componentType: "Section", instanceIndex: 1, count: 5 },
      ],
    };
    expect(compiled.parseResponse(JSON.stringify(perInstance))).toEqual({
      preparation: perInstance,
    });
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...perInstance,
          cardCounts: [...perInstance.cardCounts, perInstance.cardCounts[0]],
        })
      )
    ).toThrow("duplicate");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...preparation, question: "Translate?" })
      )
    ).toThrow("either ask a question");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...preparation, translationMode: null })
      )
    ).toThrow("either ask a question");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...preparation,
          cardCounts: [...preparation.cardCounts, ...preparation.cardCounts],
        })
      )
    ).toThrow("duplicate");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...preparation,
          cardCounts: [
            { componentType: "FAQCard", instanceIndex: null, count: 3 },
          ],
        })
      )
    ).toThrow();
  });
});
