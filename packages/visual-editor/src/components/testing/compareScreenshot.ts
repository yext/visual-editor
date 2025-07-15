import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import type { BrowserCommand } from "vitest/node";

export const compareScreenshot: BrowserCommand<
  [screenshotName: string, updatedScreenshotData: string]
> = (_, screenshotName, updatedScreenshotData) => {
  const filePath = path.join(
    process.cwd(),
    `src/components/testing/screenshots/${screenshotName}.png`
  );

  const updatedScreenshotBuffer = Buffer.from(updatedScreenshotData, "base64");
  const updatedImg = PNG.sync.read(updatedScreenshotBuffer);

  let baselineBuffer, baselineImg;
  try {
    baselineBuffer = readFileSync(filePath);
    baselineImg = PNG.sync.read(baselineBuffer);
  } catch (_) {
    // If baseline doesn't exist, save new screenshot as baseline
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, PNG.sync.write(updatedImg));
    return {
      pass: true,
      message: () => `Baseline screenshot created for ${filePath}`,
    };
  }

  // Initialize diff image
  const { width, height } = baselineImg;
  const diff = new PNG({ width, height });

  if (height !== updatedImg.height) {
    console.warn(
      `Screenshot heights did not match (existing ${height}, updated ${height})`
    );
    writeFileSync(filePath, PNG.sync.write(updatedImg));
    return Math.abs(updatedImg.height - height) * width;
  }

  const numDiffPixels = pixelmatch(
    baselineImg.data,
    updatedImg.data,
    diff.data,
    width,
    height,
    { threshold: 0.3 } // the per-pixel color difference threshold
  );

  if (numDiffPixels > 0) {
    // save the updated screenshot
    writeFileSync(filePath, PNG.sync.write(updatedImg));
  }

  return numDiffPixels;
};
