/**
 * Utility functions for analyzing URLs and matching them to components
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Placeholder for Google Gemini API key - replace with your actual key
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

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
  layoutData: {
    root: Record<string, any>;
    zones: Record<string, any>;
    content: Array<{
      type: string;
      id: string;
      props: Record<string, any>;
    }>;
  };
  error?: string;
}

// List of available page section components
const AVAILABLE_COMPONENTS = [
  "BannerSection",
  "BreadcrumbsSection",
  "CoreInfoSection",
  "EventSection",
  "FAQSection",
  "HeroSection",
  "InsightSection",
  "NearbyLocationsSection",
  "PhotoGallerySection",
  "ProductSection",
  "PromoSection",
  "ReviewsSection",
  "SectionContainer",
  "StaticMapSection",
  "TeamSection",
  "TestimonialSection",
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

    // Check if API key is configured
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error(
        "Please configure your Google Gemini API key in the code"
      );
    }

    // Fetch page content through Gemini API
    const analysisResult = await analyzePageWithGemini(url, GEMINI_API_KEY);

    return analysisResult;
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return {
      matches: [],
      colors: { primaryColor: "#000000", secondaryColor: "#ffffff" },
      layoutData: { root: {}, zones: {}, content: [] },
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

1. Identify which of these page section component types would be needed to recreate this page layout. Focus ONLY on these page section components:
${AVAILABLE_COMPONENTS.join(", ")}

These are page-level sections that structure the layout. Do NOT suggest content block components like BodyText, HeadingText, Image, etc. Focus on larger page sections like HeroSection, PromoSection, etc.

2. Extract the primary and secondary colors used on the page:
   - Primary color should focus on colors used in headers, navigation bars, buttons, or main branding elements
   - Secondary color should be the next most prominent color in the design
   - Do NOT consider colors that appear only in images or photos
   - Focus on the actual design elements like backgrounds, text, borders, buttons

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

Focus on matching the visual layout sections to the appropriate page section components. Consider:
- Hero sections at the top (HeroSection, BannerSection)
- Content sections (PromoSection, InsightSection, ProductSection)
- Gallery areas (PhotoGallerySection)
- Team/testimonial areas (TeamSection, TestimonialSection)
- FAQ sections (FAQSection)
- Location-related sections (NearbyLocationsSection, StaticMapSection)
- Event content (EventSection)
- Review displays (ReviewsSection)
- Navigation elements (BreadcrumbsSection)
- Container/wrapper elements (SectionContainer)

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
    const validMatches = analysisResult.matches.filter((match: any) =>
      AVAILABLE_COMPONENTS.includes(match.componentName)
    );

    // Generate layout data structure
    const layoutData = {
      root: {},
      zones: {},
      content: validMatches.map((match: any) => ({
        type: match.componentName,
        id: `${match.componentName}${Math.random().toString(36).substr(2, 9)}`,
        props: {},
      })),
    };

    return {
      matches: validMatches,
      colors: analysisResult.colors,
      layoutData,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      `Failed to analyze page with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
