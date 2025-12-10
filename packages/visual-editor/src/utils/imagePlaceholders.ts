/**
 * Placeholder images for default image placeholders in page sections.
 */
const PLACEHOLDER_IMAGE_IDS = [
  "photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1000", // Ocean wave
  "photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1000", // Pine Trees
  "photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1000", // Sand dune
] as const;

export interface PlaceholderImageOptions {
  /** If provided, returns this URL to ensure stability (prevents re-fetching) */
  existingUrl?: string;
  /** Width in pixels to append to the URL */
  width?: number;
  /** Height in pixels to append to the URL */
  height?: number;
  /** Aspect ratio (width/height). If width is provided but height is not, height will be calculated. If height is provided but width is not, width will be calculated. */
  aspectRatio?: number;
}

/**
 * Gets a random placeholder image URL from the CDN.
 * @param options - Options for generating the placeholder image URL
 * @returns A randomly selected placeholder image URL (or first image in tests), or the existing URL if provided
 */
export function getRandomPlaceholderImage(
  options: PlaceholderImageOptions = {}
): string {
  const { existingUrl, width, height, aspectRatio } = options;

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

  if (calculatedHeight !== undefined) {
    photoUrl += `&height=${Math.round(calculatedHeight)}`;
  }

  const calculatedWidth =
    height !== undefined && width === undefined && aspectRatio !== undefined
      ? height * aspectRatio
      : width;

  if (calculatedWidth !== undefined) {
    photoUrl += `&width=${Math.round(calculatedWidth)}`;
  }

  // fit=max scales to fit within dimensions while preserving aspect ratio (no cropping)
  if (calculatedWidth !== undefined && calculatedHeight !== undefined) {
    photoUrl += `&fit=max`;
  }

  // Using Unsplash's download endpoint which redirects to the CDN
  return `https://images.unsplash.com/${photoUrl}`;
}

/**
 * Gets a random placeholder image object with default metadata.
 * @param options - Options for generating the placeholder image. Can include existingConstantValue for stability, or width/height/aspectRatio for dimensions.
 * @returns A randomly selected placeholder image object with url, or reuses existing URL if provided
 */
export function getRandomPlaceholderImageObject(
  options: PlaceholderImageOptions & {
    /** If provided with a URL, uses it to ensure stability (prevents re-fetching) */
    existingConstantValue?: {
      url?: string;
      width?: number;
      height?: number;
      aspectRatio?: number;
    };
  } = {}
): {
  url: string;
} {
  const { existingConstantValue, ...restOptions } = options;
  const existingUrl = existingConstantValue?.url ?? restOptions.existingUrl;
  const finalWidth = existingConstantValue?.width ?? restOptions.width;
  const finalHeight = existingConstantValue?.height ?? restOptions.height;
  const finalAspectRatio =
    existingConstantValue?.aspectRatio ?? restOptions.aspectRatio;

  return {
    url: getRandomPlaceholderImage({
      existingUrl,
      width: finalWidth,
      height: finalHeight,
      aspectRatio: finalAspectRatio,
    }),
  };
}
