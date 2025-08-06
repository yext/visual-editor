import "vitest";

interface CustomMatchers<R = unknown> {
  toMatchScreenshot: (options?: {
    /** The screenshot will fail if >customThreshold pixels differ. Defaults to 0. */
    customThreshold?: number;
    /**
     * The screenshot will pass if ===ignoreExact pixels differ. Defaults to 0.
     * Useful for ignoring common flaky rendering issues.
     */
    ignoreExact?: number[];
  }) => Promise<R>;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}

declare module "@vitest/browser/context" {
  interface BrowserCommands {
    compareScreenshot: (
      screenshotName: string,
      updatedScreenshotData: string,
      customThreshold?: number,
      ignoreExact?: number[]
    ) => Promise<{ passes: boolean; numDiffPixels: number }>;
  }
}
