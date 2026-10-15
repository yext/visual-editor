// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  createGenerationRepetitionGuard,
  generationTokenBudget,
  FRESH_PAGE_OUTPUT_TOKEN_BUDGET,
  EDIT_PAGE_OUTPUT_TOKEN_BUDGET,
} from "./generationLimits.ts";

describe("generation limits", () => {
  it("budgets full page generations at 131,072 and edits at 65,536", () => {
    expect(generationTokenBudget()).toBe(FRESH_PAGE_OUTPUT_TOKEN_BUDGET);
    expect(generationTokenBudget({ content: [] })).toBe(
      FRESH_PAGE_OUTPUT_TOKEN_BUDGET
    );
    const scaffold = {
      content: [{ type: "MainContent", props: { id: "main", content: [] } }],
    };
    expect(generationTokenBudget(scaffold, { isBlankPage: true })).toBe(
      FRESH_PAGE_OUTPUT_TOKEN_BUDGET
    );
    expect(
      generationTokenBudget(
        {
          content: [
            { type: "Text", props: { id: "text", text: "Small edit" } },
          ],
        },
        { isBlankPage: false }
      )
    ).toBe(EDIT_PAGE_OUTPUT_TOKEN_BUDGET);
  });
  it("scales for larger UTF-8 content", () => {
    const content = {
      content: [
        { type: "Text", props: { id: "text", text: "😀".repeat(10_000) } },
      ],
    };
    expect(generationTokenBudget(content)).toBe(
      Math.ceil(Buffer.byteLength(JSON.stringify(content)) / 3) * 2 + 4_096
    );
  });
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
