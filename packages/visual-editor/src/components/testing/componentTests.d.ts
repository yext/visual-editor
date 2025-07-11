import "vitest";

interface CustomMatchers<R = unknown> {
  toMatchScreenshot: () => Promise<R>;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}

declare module "@vitest/browser/context" {
  interface BrowserCommands {
    compareScreenshot: (
      screenshotName: string,
      updatedScreenshotData: string
    ) => Promise<number>;
  }
}
