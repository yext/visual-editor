/**
 * Utility functions for analyzing URLs and matching them to components
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

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
    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content using the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Gemini response");
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!analysisResult.matches || !analysisResult.colors) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Filter matches to only include valid components
    const validMatches = analysisResult.matches.filter(
      (match: ComponentMatch) =>
        AVAILABLE_COMPONENTS.includes(match.componentName)
    );

    return {
      matches: validMatches,
      colors: analysisResult.colors,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      `Failed to analyze page with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
