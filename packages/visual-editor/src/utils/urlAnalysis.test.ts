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
  });

  it("should return error when no API key is provided", async () => {
    // Mock prompt to return null (user cancels)
    const originalPrompt = global.prompt;
    global.prompt = () => null;

    const result = await analyzeURL("https://example.com");
    expect(result.error).toBe("Google Gemini API key is required");

    // Restore original prompt
    global.prompt = originalPrompt;
  });

  it("should handle empty URL", async () => {
    const result = await analyzeURL("");
    expect(result.error).toBe("Invalid URL provided");
  });
});
