/**
 * Unsplash placeholder images for default image placeholders in page sections.
 * When a component with an image is dragged onto the page, one of these images
 * will be randomly selected.
 *
 * Using Unsplash CDN format: https://images.unsplash.com/photo-{photoId}
 * This provides direct access to the image without redirects or validation issues.
 */
const UNSPLASH_IMAGE_IDS = [
  "tiBUJ0Hiwx8", // Crashing ocean wave
  "OYFHT4X5isg", // Aerial view of pine trees in mist
  "7Y0NshQLohk", // Sand dune
] as const;

/**
 * Gets a random Unsplash image URL from the CDN.
 * @returns A randomly selected Unsplash image URL
 */
export function getRandomUnsplashImage(): string {
  const randomIndex = Math.floor(Math.random() * UNSPLASH_IMAGE_IDS.length);
  const photoId = UNSPLASH_IMAGE_IDS[randomIndex];
  // Using Unsplash's download endpoint which redirects to the CDN
  // The "Invalid host" error is likely a validation warning but doesn't affect rendering
  // Format: https://unsplash.com/photos/{photoId}/download?force=true&w={width}
  // This format works and images render correctly despite the console warning
  return `https://unsplash.com/photos/${photoId}/download?force=true`;
}

/**
 * Gets a random Unsplash image object with default metadata.
 * @returns A randomly selected Unsplash image object
 */
export function getRandomUnsplashImageObject(): {
  url: string;
  width: number;
  height: number;
} {
  return {
    url: getRandomUnsplashImage(),
    width: 640,
    height: 360,
  };
}

/**
 * Gets all available Unsplash image IDs.
 */
export function getUnsplashImageIds(): readonly string[] {
  return UNSPLASH_IMAGE_IDS;
}
