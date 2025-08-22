// creator/src/main.ts
import { getPageContent } from "./inputHandler";
import { generateLayout } from "./generation";
import { getUniqueDirectoryName, saveFile } from "./fileUtils";
import { createGeminiPrompt } from "./prompt.ts";
import { analyzeHtml } from "./analysis";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function orchestrateLayoutGeneration(url: string) {
  try {
    console.log(`\n\u2139 Fetching page content for: ${url}`);
    const { screenshot, html } = await getPageContent(url);

    console.log("\u2139 Analyzing HTML structure...");
    const promptParts = createGeminiPrompt(screenshot, html);

    const promptString = promptParts
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("\n");

    const date = new Date().toISOString().split("T")[0];
    const sanitizedUrl = url
      .replace(/https?:\/\//, "")
      .replace(/[^a-zA-Z0-9]/g, "-");
    const baseDir = path.join(
      process.cwd(),
      "generated",
      `${sanitizedUrl}_${date}`,
    );
    const outputDir = getUniqueDirectoryName(baseDir);

    saveFile(path.join(outputDir, "prompt.txt"), promptString);
    console.log(
      `\u2705 Prompt logged to: ${path.join(outputDir, "prompt.txt")}`,
    );

    saveFile(
      path.join(outputDir, "screenshot.jpg"),
      Buffer.from(screenshot, "base64"),
    );
    console.log(
      `\u2705 Screenshot saved to: ${path.join(outputDir, "screenshot.jpg")}`,
    );

    const { analysisResult, rawResponse } = await analyzeHtml(promptParts);

    saveFile(path.join(outputDir, "raw-gemini-response.txt"), rawResponse);
    console.log(
      `\u2705 Raw Gemini response logged to: ${path.join(outputDir, "raw-gemini-response.txt")}`,
    );

    if (analysisResult.explanation) {
      // --- New Logic: Log explanation to console ---
      console.warn(`\u26A0 Gemini Explanation: ${analysisResult.explanation}`);
      // --- End New Logic ---
      saveFile(
        path.join(outputDir, "log.txt"),
        `Gemini Explanation: ${analysisResult.explanation}`,
      );
    }

    console.log("\u2139 Generating visual-editor layout...");
    const layoutData = generateLayout(analysisResult.components);

    if (layoutData.content.length > 0) {
      saveFile(
        path.join(outputDir, "layout.json"),
        JSON.stringify(layoutData, null, 2),
      );
      console.log(`\u2705 Layout Generation Complete!`);
      console.log(
        `\u2705 Output saved to: ${path.join(outputDir, "layout.json")}`,
      );
    } else {
      console.log(
        "\u26A0 Layout content was empty. No layout.json file was written.",
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(
      `\n\u274C An error occurred during layout generation:`,
      error,
    );
    process.exit(1);
  }
}

const url = process.argv[2];
if (!url) {
  console.error("\n\u274C Please provide a URL as an argument.");
  process.exit(1);
}

console.log(
  "\u2139 Gemini API Key:",
  process.env.GEMINI_API_KEY ? "\u2705 Loaded" : "\u274C Not Loaded",
);

if (!process.env.GEMINI_API_KEY) {
  console.error("\u274C GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}

orchestrateLayoutGeneration(url);
