// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createGenerationRepetitionGuard } from "./generationLimits.ts";

describe("generation limits", () => {
  it("stops a repeated unfinished string across single-character deltas", () => {
    const guard = createGenerationRepetitionGuard();
    guard('{"defaultValue":"');
    expect(() => {
      for (const char of "Fast Food Restaurant abcdef0123456789 ".repeat(300))
        guard(char);
    }).toThrow("repeated text excessively inside a string");
  });
  it("does not mistake repeated JSON structures or escaped quotes for a loop", () => {
    const guard = createGenerationRepetitionGuard();
    const text = JSON.stringify({
      content: Array.from({ length: 1_000 }, () => ({
        text: 'A "quoted" name with a backslash \\ and café',
      })),
    });
    expect(() => {
      for (const char of text) guard(char);
    }).not.toThrow();
  });
  it("allows brief repetition and long varied text", () => {
    const guard = createGenerationRepetitionGuard();
    expect(() =>
      guard(
        JSON.stringify({
          text: Array.from({ length: 2_000 }, (_, i) => `Sentence ${i}.`).join(
            " "
          ),
        })
      )
    ).not.toThrow();
    expect(() =>
      guard(
        JSON.stringify({
          text: "Sample repeated text for a greeting. ".repeat(10),
        })
      )
    ).not.toThrow();
  });
});
