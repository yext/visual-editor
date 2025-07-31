import { describe, it, expect } from "vitest";
import { analyzeURL } from "./urlAnalysis.ts";

describe("urlAnalysis", () => {
  it("should export analyzeURL function", () => {
    expect(typeof analyzeURL).toBe("function");
  });

  it("should return error for invalid URL", async () => {
    const result = await analyzeURL("invalid-url");
    expect(result.error).toBeDefined();
    expect(result.matches).toEqual([]);
    expect(result.colors).toEqual({
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
    });
    expect(result.layoutData).toEqual({
      root: {},
      zones: {},
      content: [],
    });
  });

  it("should return error when API key is not configured", async () => {
    const result = await analyzeURL("https://example.com");
    expect(result.error).toBe(
      "Please configure your Google Gemini API key in the code"
    );
  });

  it("should handle empty URL", async () => {
    const result = await analyzeURL("");
    expect(result.error).toBe("Invalid URL provided");
  });
});
