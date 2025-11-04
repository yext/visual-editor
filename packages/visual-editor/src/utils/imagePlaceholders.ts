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
 * @returns A randomly selected placeholder image URL (or first image in tests)
 */
export function getRandomPlaceholderImage(): string {
  // In test environments, always return the first image (tiBUJ0Hiwx8) for deterministic screenshots
  // Check for __VISUAL_EDITOR_TEST__ flag set via Vite define (at build time) or globalThis (at runtime)
  const isTestEnv =
    (typeof __VISUAL_EDITOR_TEST__ !== "undefined" &&
      __VISUAL_EDITOR_TEST__ === true) ||
    (globalThis as any).__VISUAL_EDITOR_TEST__ === true;

  const randomIndex = isTestEnv
    ? 0
    : Math.floor(Math.random() * PLACEHOLDER_IMAGE_IDS.length);

  const photoUrl = PLACEHOLDER_IMAGE_IDS[randomIndex];

  // Using Unsplash's download endpoint which redirects to the CDN
  // The "Invalid host" error is likely a validation warning but doesn't affect rendering
  return `https://images.unsplash.com/${photoUrl}`;
}

/**
 * Gets a random placeholder image object with default metadata.
 * @returns A randomly selected placeholder image object with url
 */
export function getRandomPlaceholderImageObject(): {
  url: string;
} {
  return {
    url: getRandomPlaceholderImage(),
  };
}
