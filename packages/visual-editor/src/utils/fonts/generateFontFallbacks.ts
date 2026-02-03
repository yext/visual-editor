import { createFontStack } from "@capsizecss/core";
import { fontFamilyToCamelCase } from "@capsizecss/metrics";
import { defaultFonts } from "./font_registry.js";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Requires different TS module resolution than we're using
//@ts-ignore
import arial from "@capsizecss/metrics/arial";
//@ts-ignore
import georgia from "@capsizecss/metrics/georgia";
//@ts-ignore
import courierNew from "@capsizecss/metrics/courierNew";
//@ts-ignore
import brushScript from "@capsizecss/metrics/brushScript";

const outputFilepath = resolve(
  "src/utils/fonts/fontFallbackTransformations.json"
);

const systemFallbacks: Record<string, any> = {
  "sans-serif": arial,
  serif: georgia,
  cursive: brushScript,
  monospace: courierNew,
};

/**
 * This script generates a JSON mapping of font families to the corresponding
 * font transformations that minimizes layout shift during font loading.
 *
 * It only needs to be run if we update font_registry.js.
 */
const generate = async () => {
  const results: Record<string, string[]> = {};

  for (const [displayName, config] of Object.entries(defaultFonts)) {
    const camelName = fontFamilyToCamelCase(displayName);

    const fallbackMetrics = systemFallbacks[config.fallback] || arial;

    let weights = [];
    if ("weights" in config) {
      weights = config.weights;
    } else {
      for (let w = config.minWeight; w <= config.maxWeight; w += 100) {
        weights.push(w);
      }
    }

    results[displayName] = [];

    for (const weight of weights) {
      const styles = config.italics ? ["regular", "italic"] : ["regular"];

      for (const style of styles) {
        // Build the dynamic path (e.g., @capsizecss/metrics/inter/700italic)
        let variantSuffix =
          style === "regular" ? `/${weight}` : `/${weight}${style}`;
        if (weight === 400 && style === "regular") {
          variantSuffix = "";
        } else if (weight === 400 && style === "italic") {
          variantSuffix = `/italic`;
        }
        const importPath = `@capsizecss/metrics/${camelName}${variantSuffix}`;

        try {
          const { default: metrics } = await import(importPath);

          const { fontFaces } = createFontStack([metrics, fallbackMetrics], {});

          const finalizedFontFace = fontFaces.replace(
            "}",
            `  font-weight: ${weight};\n  font-style: ${style};\n}`
          );

          results[displayName].push(finalizedFontFace);
        } catch {
          console.warn(
            `Could not find metrics for ${displayName} (${variantSuffix})`
          );
        }
      }
    }
  }

  try {
    writeFileSync(outputFilepath, JSON.stringify(results, null, 2), "utf-8");
    console.log(`Successfully wrote to ${outputFilepath}`);
  } catch (error) {
    console.error("Failed to write file:", error);
  }
};

generate();
