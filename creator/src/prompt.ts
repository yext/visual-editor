// creator/src/utils/promptUtils.ts
import { Part } from "@google/generative-ai";
import { readComponentSchemas } from "./fileUtils";

const schemasPath = "./generated/component-schemas.json";

/**
 * Creates a structured prompt for Gemini using only a screenshot.
 * @param screenshot The Base64 encoded screenshot of the page.
 * @returns An array of Part objects for the Gemini API call.
 */
export function createGeminiPrompt(screenshot: string, html: string): Part[] {
  const schemas = readComponentSchemas(schemasPath);

  const extraSchema = `
  // The 'BackgroundStyle' MUST be an object with 'bgColor' and 'textColor' properties.
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
        The additionalContext contains rules for some props of some components. If it is present, these rules MUST BE followed.
        
        Below is the library of components and their schemas:
        \`\`\`typescript
        ${schemas}
        ${extraSchema}
        \`\`\`

        Based on the image, return a JSON array of components that represents the webpage layout. Your response MUST be a single, valid JSON array. Do not include any other text, explanations, or markdown code fences.

        Anywhere there is a image url, use "https://placehold.co/500" instead of "IMAGE_URL_FROM_SCREENSHOT".

        For any object that has "hasLocalizedValue": "true", 
        1. Please add an "es" key with the value of the "en" key translated to Spanish.
        2. Please add an "fr" key with the value of the "en" key translated to French.
        3. Any object with translations must have the key value pair "hasLocalizedValue": "true"
        4. Note that that there must be quotation marks around the value true for the hasLocalizedValue key.

        You should look for 
        - Frequently Asked Questions
        - Featured Items/Products
        - Nearby Locations
        If you find any of these, include them in the layout.

        Example output for a page with no matching components:
        {
          "components": [],
          "explanation": "Could not identify any matching components in the provided screenshot. The page appears to contain unstructured content."
        }

        Provide a summary of your decisions in the explanation key.

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
          "explanation": "..."
        }
      `,
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: screenshot,
      },
    },
    {
      text: "THIS IS THE HTML OF THE PAGE: " + html,
    },
  ];
}
