/**
 * Placeholder images for default image placeholders in page sections.
 */
const PLACEHOLDER_IMAGE_IDS = [
  "tiBUJ0Hiwx8", // Crashing ocean wave
  "OYFHT4X5isg", // Aerial view of pine trees in mist
  "7Y0NshQLohk", // Sand dune
] as const;

/**
 * Gets a random placeholder image URL from the CDN.
 * @returns A randomly selected placeholder image URL (or first image in tests)
 */
export function getRandomPlaceholderImage(): string {
  // In test environments, always return the first image (tiBUJ0Hiwx8) for deterministic screenshots
  const isTestEnv =
    (typeof process !== "undefined" &&
      (process.env.NODE_ENV === "test" || process.env.VITEST === "true")) ||
    (typeof window !== "undefined" &&
      (window.location?.href?.includes("vitest") ||
        (window as any).__vitest__ !== undefined));

  const randomIndex = isTestEnv
    ? 0
    : Math.floor(Math.random() * PLACEHOLDER_IMAGE_IDS.length);

  const photoId = PLACEHOLDER_IMAGE_IDS[randomIndex];
  // Using Unsplash's download endpoint which redirects to the CDN
  // The "Invalid host" error is likely a validation warning but doesn't affect rendering
  return `https://unsplash.com/photos/${photoId}/download?force=true`;
}

/**
 * Gets a random placeholder image object with default metadata.
 * @returns A randomly selected placeholder image object
 */
export function getRandomPlaceholderImageObject(): {
  url: string;
  width: number;
  height: number;
} {
  return {
    url: getRandomPlaceholderImage(),
    width: 640,
    height: 360,
  };
}

/**
 * Gets all available placeholder image IDs.
 */
export function getPlaceholderImageIds(): readonly string[] {
  return PLACEHOLDER_IMAGE_IDS;
}
