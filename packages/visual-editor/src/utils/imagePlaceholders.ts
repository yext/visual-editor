/**
 * Placeholder images for default image placeholders in page sections.
 */
const PLACEHOLDER_IMAGE_IDS = [
  "photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb", // Ocean wave
  "photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb", // Pine Trees
  "photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb", // Sand dune
] as const;

/**
 * Gets a random placeholder image URL from the CDN.
 * @param existingUrl - If provided, returns this URL to ensure stability (prevents re-fetching)
 * @param width - Optional width in pixels to append to the URL
 * @param height - Optional height in pixels to append to the URL
 * @param aspectRatio - Optional aspect ratio (width/height). If width is provided but height is not, height will be calculated from aspectRatio
 * @returns A randomly selected placeholder image URL (or first image in tests), or the existing URL if provided
 */
export function getRandomPlaceholderImage(
  existingUrl?: string,
  width?: number,
  height?: number,
  aspectRatio?: number
): string {
  // If an existing URL is provided, use it to prevent re-fetching
  if (existingUrl && existingUrl.trim() !== "") {
    return existingUrl;
  }

  // In test environments, always return the first image for deterministic screenshots
  // Check for __VISUAL_EDITOR_TEST__ flag set via Vite define (at build time) or globalThis (at runtime)
  const isTestEnv =
    (typeof __VISUAL_EDITOR_TEST__ !== "undefined" &&
      __VISUAL_EDITOR_TEST__ === true) ||
    (globalThis as any).__VISUAL_EDITOR_TEST__ === true;

  const randomIndex = isTestEnv
    ? 0
    : Math.floor(Math.random() * PLACEHOLDER_IMAGE_IDS.length);

  let photoUrl = PLACEHOLDER_IMAGE_IDS[randomIndex];

  const calculatedHeight =
    width !== undefined && height === undefined && aspectRatio !== undefined
      ? width / aspectRatio
      : height;

  if (width !== undefined) {
    photoUrl += `&width=${width}`;
  }
  if (calculatedHeight !== undefined) {
    photoUrl += `&height=${Math.round(calculatedHeight)}`;
  }

  // fit=crop ensures exact dimensions
  if (width !== undefined && calculatedHeight !== undefined) {
    photoUrl += `&fit=crop`;
  }

  // Using Unsplash's download endpoint which redirects to the CDN
  return `https://images.unsplash.com/${photoUrl}`;
}

/**
 * Gets a random placeholder image object with default metadata.
 * @param existingConstantValue - If provided with a URL, uses it to ensure stability (prevents re-fetching)
 * @param width - Optional width in pixels to append to the URL
 * @param height - Optional height in pixels to append to the URL
 * @param aspectRatio - Optional aspect ratio (width/height). If width is provided but height is not, height will be calculated from aspectRatio
 * @returns A randomly selected placeholder image object with url, or reuses existing URL if provided
 */
export function getRandomPlaceholderImageObject(
  existingConstantValue?: {
    url?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
  },
  width?: number,
  height?: number,
  aspectRatio?: number
): {
  url: string;
} {
  const existingUrl = existingConstantValue?.url;
  const finalWidth = existingConstantValue?.width ?? width;
  const finalHeight = existingConstantValue?.height ?? height;
  const finalAspectRatio = existingConstantValue?.aspectRatio ?? aspectRatio;
  return {
    url: getRandomPlaceholderImage(
      existingUrl,
      finalWidth,
      finalHeight,
      finalAspectRatio
    ),
  };
}
