// creator/src/analysis.ts
import {
  GoogleGenerativeAI,
  Part,
  GoogleGenerativeAIFetchError,
} from "@google/generative-ai";

/**
 * A generic, structured representation of a website section.
 */
export interface AnalyzedComponent {
  type: string;
  data: any;
  styles: any;
}

/**
 * The full response object from Gemini, including components and an explanation.
 */
interface AnalyzedLayout {
  components: any[];
  explanation: string | null;
}

/**
 * The response object returned by analyzeHtml, including the raw response text.
 */
interface GeminiResponse {
  analysisResult: AnalyzedLayout;
  rawResponse: string;
}

/**
 * Sanitizes a Gemini response string to extract only the JSON content.
 * @param responseText The raw response text from the Gemini API.
 * @returns The sanitized JSON string.
 */
function sanitizeGeminiResponse(responseText: string): string {
  const firstCurly = responseText.indexOf("{");
  const firstBracket = responseText.indexOf("[");
  let startIndex = -1;

  if (firstCurly !== -1 && firstBracket !== -1) {
    startIndex = Math.min(firstCurly, firstBracket);
  } else if (firstCurly !== -1) {
    startIndex = firstCurly;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
  }

  if (startIndex === -1) {
    return "";
  }

  const lastCurly = responseText.lastIndexOf("}");
  const lastBracket = responseText.lastIndexOf("]");
  let endIndex = -1;

  if (lastCurly !== -1 && lastBracket !== -1) {
    endIndex = Math.max(lastCurly, lastBracket);
  } else if (lastCurly !== -1) {
    endIndex = lastCurly;
  } else if (lastBracket !== -1) {
    endIndex = lastBracket;
  }

  if (endIndex === -1 || endIndex < startIndex) {
    return "";
  }

  return responseText.substring(startIndex, endIndex + 1);
}

/**
 * A helper function to call a specific Gemini model and handle errors.
 * @param modelName The name of the model to use.
 * @param promptParts The prompt to send to the API.
 * @returns The parsed AnalyzedLayout object or null on failure.
 */
async function analyzeWithModel(
  modelName: string,
  promptParts: Part[],
): Promise<GeminiResponse> {
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = gemini.getGenerativeModel({ model: modelName });

  console.log(
    `\u23F3 Sending prompt to Gemini API (${modelName}). This may take up to 5 minutes...`,
  );

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("Gemini API call timed out after 5 minutes.")),
      5 * 60000,
    ),
  );

  const resultPromise = model.generateContent({
    contents: [{ role: "user", parts: promptParts }],
  });

  try {
    const result = await Promise.race([resultPromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text();

    let resultObject: AnalyzedLayout | null = null;
    let sanitizedText = "";

    try {
      sanitizedText = sanitizeGeminiResponse(text);
      resultObject = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error(`\u274C Failed to parse Gemini's response as JSON.`);
      console.error(parseError.toString());
      return {
        analysisResult: {
          components: [],
          explanation: `Failed to parse Gemini's JSON response.`,
        },
        rawResponse: text,
      };
    }

    return {
      analysisResult: resultObject as AnalyzedLayout,
      rawResponse: text,
    };
  } catch (error) {
    let rawResponse = "";
    let explanation = "";

    if (error instanceof Error) {
      if (error.message.includes("timed out")) {
        console.error(`\u274C ${error.message}`);
        explanation = "Gemini API call timed out.";
      } else if (error instanceof GoogleGenerativeAIFetchError) {
        if (error.status === 429) {
          explanation = "Gemini API quota exceeded.";
        } else {
          console.error(
            `\u274C Gemini API Fetch Error: ${error.message} Status: ${error.status}`,
          );
          explanation = `Gemini API Fetch Error: ${error.message}`;
        }
        rawResponse = error.message;
      } else {
        console.error(`\u274C Gemini API Error: ${error.message}`);
        explanation = `Gemini API Error: ${error.message}`;
        rawResponse = error.message;
      }
    } else {
      console.error(`\u274C An unexpected error occurred.`);
      explanation = `An unexpected error occurred: ${JSON.stringify(error)}`;
      rawResponse = explanation;
    }

    return {
      analysisResult: {
        components: [],
        explanation: explanation,
      },
      rawResponse: rawResponse,
    };
  }
}

export async function analyzeHtml(
  promptParts: Part[],
): Promise<GeminiResponse> {
  let result = await analyzeWithModel("gemini-1.5-pro-latest", promptParts);

  if (
    !result ||
    (result.analysisResult.explanation &&
      result.analysisResult.explanation.includes("Gemini API quota exceeded"))
  ) {
    console.warn("\u26A0 Falling back to Flash model...");
    result = await analyzeWithModel("gemini-2.5-flash", promptParts);
  }

  if (!result || !Array.isArray(result.analysisResult.components)) {
    const message =
      "Both primary and fallback Gemini models failed, or returned an invalid response. Please check the logs.";
    return {
      analysisResult: {
        components: [],
        explanation: message,
      },
      rawResponse: result?.rawResponse || message,
    };
  }

  if (result.analysisResult.explanation) {
    console.warn(
      `\u26A0 Gemini Explanation: ${result.analysisResult.explanation}`,
    );
  }

  return result;
}
