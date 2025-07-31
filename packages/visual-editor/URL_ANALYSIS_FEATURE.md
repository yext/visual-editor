# URL Analysis Feature for Visual Editor

## Overview

The Visual Editor now includes a **URL Analysis** feature that allows developers to analyze external web pages using Google Gemini AI. This feature helps identify which Visual Editor components could be used to recreate the layout and design of any website.

## How to Use

### Prerequisites

1. You must be in `localDev` mode for this feature to be available
2. You need a Google Gemini API key

### Step-by-Step Usage

1. **Enable LocalDev Mode**: Make sure your Visual Editor instance is running with `localDev: true`

2. **Access the Button**: Look for the "Analyze URL" button in the LayoutHeader toolbar (it appears alongside other local development buttons like "Log Layout Data")

3. **Enter URL**: Click the button and enter the URL you want to analyze when prompted

4. **Provide API Key**: Enter your Google Gemini API key when prompted

5. **Review Results**: The analysis results will be logged to the browser console and displayed in an alert

### What You Get

The analysis provides:

- **Component Matches**: A list of Visual Editor components that could be used to recreate the page
- **Confidence Scores**: How well each component matches (0-100%)
- **Reasoning**: Explanation of why each component was suggested
- **Color Analysis**: Primary and secondary colors extracted from the page

### Available Components

The system can identify matches for these Visual Editor components:

**Layout & Structure:**

- Header, ExpandedHeader
- Footer, ExpandedFooter
- Flex, Grid, SectionContainer

**Page Sections:**

- HeroSection, Banner
- CoreInfoSection, EventSection
- FAQsSection, PhotoGallerySection
- ProductSection, PromoSection
- TeamSection, TestimonialSection
- NearbyLocations, StaticMapSection

**Content Blocks:**

- HeadingText, BodyText, Image
- Phone, Emails, Address
- CtaWrapper, GetDirections
- HoursStatus, HoursTable
- MapboxStaticMap, TextList

**Other:**

- Directory, Breadcrumbs
- InsightSection

### Example Output

```
=== URL Analysis Results ===
URL: https://example.com

📦 Component Matches:
1. Header (confidence: 95.0%)
   Reason: Navigation bar with logo and menu items
2. HeroSection (confidence: 88.0%)
   Reason: Large banner area with heading and call-to-action
3. BodyText (confidence: 75.0%)
   Reason: Multiple text content areas throughout the page

🎨 Color Analysis:
Primary Color: #1a365d
Secondary Color: #ffffff
```

## Technical Details

### Implementation

- **Location**: `src/utils/urlAnalysis.ts`
- **Integration**: `src/internal/puck/components/LayoutHeader.tsx`
- **API**: Uses Google Gemini Pro model for content analysis

### Error Handling

The system gracefully handles:

- Invalid URLs
- Missing API keys
- Network errors
- API rate limits
- Malformed responses

### Privacy & Security

- API keys are requested via prompt (not stored)
- Only works in local development mode
- No data is persisted or transmitted beyond the API call

## Limitations

- Requires internet connection for API calls
- Limited by Google Gemini API rate limits
- Analysis quality depends on page complexity and content
- Only works in `localDev` mode for security reasons

## Troubleshooting

**Button Not Visible**: Ensure `localDev: true` is set in your Visual Editor configuration

**API Errors**:

- Verify your Gemini API key is valid
- Check your internet connection
- Ensure the URL is publicly accessible

**Poor Results**:

- Try with simpler, more structured websites
- Some dynamic content may not be analyzed effectively
- Complex single-page applications may not be fully captured
