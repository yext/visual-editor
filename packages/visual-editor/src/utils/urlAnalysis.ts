/**
 * Utility functions for analyzing URLs and matching them to components
 */

interface ComponentMatch {
  componentName: string;
  confidence: number;
  reason: string;
}

interface ColorAnalysis {
  primaryColor: string;
  secondaryColor: string;
}

interface URLAnalysisResult {
  matches: ComponentMatch[];
  colors: ColorAnalysis;
  error?: string;
}

// List of available components from the registry
const AVAILABLE_COMPONENTS = [
  "Address",
  "Banner",
  "BodyText",
  "Breadcrumbs",
  "CoreInfoSection",
  "CtaWrapper",
  "Directory",
  "Emails",
  "EventSection",
  "ExpandedFooter",
  "ExpandedHeader",
  "FAQsSection",
  "Flex",
  "Footer",
  "GetDirections",
  "Grid",
  "Header",
  "HeadingText",
  "HeroSection",
  "HoursStatus",
  "HoursTable",
  "InsightSection",
  "Image",
  "NearbyLocations",
  "MapboxStaticMap",
  "Phone",
  "PhotoGallerySection",
  "ProductSection",
  "PromoSection",
  "SectionContainer",
  "StaticMapSection",
  "TeamSection",
  "TestimonialSection",
  "TextList",
];

/**
 * Analyzes a URL using Google Gemini API to identify components and colors
 */
export async function analyzeURL(url: string): Promise<URLAnalysisResult> {
  try {
    // Validate URL
    if (!url || !isValidURL(url)) {
      throw new Error("Invalid URL provided");
    }

    // Get Google Gemini API key from prompt (for local development)
    const apiKey = prompt("Enter your Google Gemini API key:");
    if (!apiKey) {
      throw new Error("Google Gemini API key is required");
    }

    // Fetch page content through Gemini API
    const analysisResult = await analyzePageWithGemini(url, apiKey);

    return analysisResult;
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return {
      matches: [],
      colors: { primaryColor: "#000000", secondaryColor: "#ffffff" },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Validates if a string is a valid URL
 */
function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Uses Google Gemini API to analyze a webpage
 */
async function analyzePageWithGemini(
  url: string,
  apiKey: string
): Promise<URLAnalysisResult> {
  const prompt = `
Please analyze the webpage at "${url}" and provide the following information:

1. Identify which of these component types would be needed to recreate this page:
${AVAILABLE_COMPONENTS.join(", ")}

2. Extract the primary and secondary colors used on the page

Respond in the following JSON format:
{
  "matches": [
    {
      "componentName": "ComponentName",
      "confidence": 0.8,
      "reason": "Explanation of why this component matches"
    }
  ],
  "colors": {
    "primaryColor": "#hex-color",
    "secondaryColor": "#hex-color"
  }
}

Focus on matching the visual layout and functional elements to the appropriate components. Consider:
- Headers and navigation (Header, ExpandedHeader)
- Hero sections (HeroSection, Banner)
- Content blocks (Image, BodyText, HeadingText)
- Contact information (Phone, Emails, Address)
- Interactive elements (CtaWrapper, GetDirections)
- Layout containers (Flex, Grid, SectionContainer)
- Footer content (Footer, ExpandedFooter)

Provide specific reasoning for each match and confidence scores between 0 and 1.
`;

  try {
    // Use Gemini API to analyze the webpage
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid response from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;

    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Gemini response");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!result.matches || !result.colors) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Filter matches to only include valid components
    const validMatches = result.matches.filter((match: ComponentMatch) =>
      AVAILABLE_COMPONENTS.includes(match.componentName)
    );

    return {
      matches: validMatches,
      colors: result.colors,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      `Failed to analyze page with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
