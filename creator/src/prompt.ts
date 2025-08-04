// creator/src/utils/promptUtils.ts
import { Part } from "@google/generative-ai";
import { readComponentSchemas } from "./fileUtils";

const schemasPath = "./generated/component-schemas.json";

/**
 * Creates a structured prompt for Gemini using only a screenshot.
 * @param screenshot The Base64 encoded screenshot of the page.
 * @returns An array of Part objects for the Gemini API call.
 */
export function createGeminiPrompt(screenshot: string): Part[] {
  const schemas = readComponentSchemas(schemasPath);

  const extraSchema = `
  // The 'BackgroundStyle' must be an object with 'bgColor' and 'textColor' properties.
  // Example: "backgroundColor": { "bgColor": "bg-white", "textColor": "text-black" }
  export type BackgroundStyle = {
    bgColor: string;
    textColor: string;
    isDarkBackground?: boolean;
  };
  `;

  return [
    {
      text: `
        You are an expert at analyzing website layouts and matching them to a library of components.
        
        Your task is to analyze the provided screenshot of a webpage and generate a structured JSON layout. You must identify which components from the provided library best match the layout.
        
        Use the screenshot to identify the layout, extract text, links, and image URLs.
        
        Below is the library of components and their schemas:
        \`\`\`typescript
        ${schemas}
        ${extraSchema}
        \`\`\`
        
        Based on the image, return a JSON array of components that represents the webpage layout. Your response MUST be a single, valid JSON array. Do not include any other text, explanations, or markdown code fences.
        
        Example output for a page with no matching components:
        {
          "components": [],
          "explanation": "Could not identify any matching components in the provided screenshot. The page appears to contain unstructured content."
        }
        
        Example output for a page with matching components:
        {
          "components": [
            {
              "type": "HeroSection",
              "props": {
                // ... props data
              }
            }
          ],
          "explanation": null
        }
      `,
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: screenshot,
      },
    },
  ];
}
