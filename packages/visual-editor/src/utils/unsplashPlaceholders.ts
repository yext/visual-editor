/**
 * Unsplash placeholder images for default image placeholders in page sections.
 * When a component with an image is dragged onto the page, one of these images
 * will be randomly selected.
 */
const UNSPLASH_IMAGE_IDS = [
  "tiBUJ0Hiwx8", // Crashing ocean wave
  "OYFHT4X5isg", // Aerial view of pine trees in mist
  "7Y0NshQLohk", // Sand dune
] as const;

/**
 * Gets a random Unsplash image URL.
 * @param width - Image width (default: 640)
 * @returns A randomly selected Unsplash image URL
 */
export function getRandomUnsplashImage(width: number = 640): string {
  const randomIndex = Math.floor(Math.random() * UNSPLASH_IMAGE_IDS.length);
  const photoId = UNSPLASH_IMAGE_IDS[randomIndex];
  // Using Unsplash's photo download endpoint with dimensions
  // This format redirects to the actual image URL from Unsplash's CDN
  // Format: https://unsplash.com/photos/{photoId}/download?force=true&w={width}
  return `https://unsplash.com/photos/${photoId}/download?force=true&w=${width}`;
}

/**
 * Gets a random Unsplash image object with full metadata.
 * @param width - Image width (default: 640)
 * @param height - Image height (default: 360)
 * @returns A randomly selected Unsplash image object
 */
export function getRandomUnsplashImageObject(
  width: number = 640,
  height: number = 360
): { url: string; width: number; height: number } {
  return {
    url: getRandomUnsplashImage(width),
    width,
    height,
  };
}

/**
 * Gets all available Unsplash image IDs.
 */
export function getUnsplashImageIds(): readonly string[] {
  return UNSPLASH_IMAGE_IDS;
}
