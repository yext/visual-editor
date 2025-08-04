// creator/src/inputHandler.ts
globalThis.File = class File {};

import puppeteer from "puppeteer";

/**
 * Fetches the fully rendered HTML and a screenshot of a given URL.
 * @param url The URL of the website to fetch.
 * @returns A Promise that resolves to an object containing the HTML content and a Base64 image string.
 */
export async function getPageContent(
  url: string,
): Promise<{ html: string; screenshot: string }> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle2" });

    // Scroll to the bottom to trigger lazy-loaded content
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Get the full HTML content
    const htmlContent = await page.content();

    // Take a full-page screenshot and return it as a Base64 string
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      encoding: "base64",
    });

    return {
      html: htmlContent,
      screenshot: screenshotBuffer as string,
    };
  } catch (error) {
    console.error(`Error fetching page content from ${url}:`, error);
    throw new Error(`Failed to fetch page content from ${url}`);
  } finally {
    await browser.close();
  }
}
