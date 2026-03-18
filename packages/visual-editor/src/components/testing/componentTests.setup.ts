import { configureAxe } from "jest-axe";
// Applies the theme tailwind classes
import "./componentTests.css";
// Applies the build css that is applied to the page templates
import "../../../dist/style.css";
// Enabled expect().toHaveNoViolations()
import "jest-axe/extend-expect";
import { expect, vi, beforeEach } from "vitest";
import { BrowserPage, commands, page } from "@vitest/browser/context";
import { act } from "@testing-library/react";
import { defaultThemeConfig } from "../DefaultThemeConfig.ts";
import { applyTheme } from "../../utils/applyTheme.ts";
import { ThemeData } from "../../internal/types/themeData.ts";

const TEST_CSS_OVERRIDE_TAG_ID = "screenshot-test-overrides";
const originalConsoleError = console.error.bind(console);
let hasLoggedActWarning = false;

// Applies the default theme variables and mocks the date
export const testSetup = (theme: ThemeData) => {
  // July 1, 2025 Noon (month is 0-indexed)
  vi.setSystemTime(new Date(2025, 6, 1, 12, 0, 0).valueOf());

  const tag = document.createElement("style");
  const themeTags = applyTheme(
    { __: { theme: JSON.stringify(theme) } },
    "./",
    defaultThemeConfig
  );

  // don't load fonts
  const matches = [...themeTags.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
  if (matches.length > 0 && matches[1]?.length) {
    const theme = matches[1][0];

    document.head.appendChild(tag);
    tag.outerHTML = theme;
  } else {
    console.error("failed to apply theme");
  }
};

// Run the test setup before each test
beforeEach(() => {
  testSetup({});
});

/**
 * Override console.error to suppress log spam
 * This will print the wrapped-in-act warning only once per test run, and will print all other errors as normal.
 */
console.error = (...args: unknown[]) => {
  const firstArg = args[0];
  if (
    typeof firstArg === "string" &&
    firstArg.startsWith(
      "Warning: An update to %s inside a test was not wrapped in act(...)."
    )
  ) {
    if (!hasLoggedActWarning) {
      hasLoggedActWarning = true;
      originalConsoleError(
        "Warning: React emitted not-wrapped-in-act updates during screenshot tests (details suppressed)."
      );
    }
    return;
  }

  originalConsoleError(...args);
};

/** Override hover effects to reduce test flakiness */
const disableHoverEffects = () => {
  if (document.getElementById(TEST_CSS_OVERRIDE_TAG_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = TEST_CSS_OVERRIDE_TAG_ID;
  style.textContent = `
    .hover\\:no-underline:hover {
      text-decoration-line: underline !important;
    }
  `;

  document.head.appendChild(style);
};

// Adds the toMatchScreenshot method to vitest's expect.
// This portion is run in the browser environment while
// compareScreenshot is run in the node environment.
expect.extend({
  async toMatchScreenshot(
    this: any, // 'this' context for Vitest matchers
    screenshotName: string,
    options?: {
      customThreshold?: number;
      ignoreExact?: number[];
    }
  ) {
    disableHoverEffects();

    const updatedScreenshotData = await act(async () => {
      // Workaround for vitest not allowing fullPage mobile screenshots
      // See https://github.com/vitest-dev/vitest/discussions/7749
      (window.frameElement as HTMLIFrameElement).style.height =
        `${document.body.offsetHeight}px`;

      const screenshot = await page.screenshot({
        save: false,
      });

      // Reset to default screen height
      (window.frameElement as HTMLIFrameElement).style.height = "";
      return screenshot;
    });

    const { passes, numDiffPixels } = await commands.compareScreenshot(
      screenshotName,
      updatedScreenshotData,
      options?.customThreshold,
      options?.ignoreExact
    );

    return {
      pass: passes,
      message: () => `Screenshots differed by ${numDiffPixels} pixels`,
    };
  },
});

// jest-axe disabled color contrast checks by default because they are
// not supported in JSDOM. However, we are running the tests in playwright
// so we want to re-enable the checks.
export const axe = configureAxe({
  globalOptions: {
    rules: [{ id: "color-contrast", enabled: true }],
  },
});

/** Helper function to log WCAG warnings for tests that are known violations */
export const logSuppressedWcagViolations = (
  results: Awaited<ReturnType<typeof axe>>
) => {
  if (!results.violations.length) {
    return;
  }

  console.warn(
    [
      "[warning] Ignoring the following WCAG/axe violations:",
      ...results.violations.map(
        (violation, index) =>
          `${index + 1}. [${violation.impact ?? "none"}] ${violation.id} (${violation.nodes.length} nodes) - ${violation.help}`
      ),
    ].join("\n")
  );
};

// Each test will run once for each of the following viewports
export const viewports = {
  mobile: { name: "mobile", width: 375, height: 667 },
  tablet: { name: "tablet", width: 800, height: 1280 },
  desktop: { name: "desktop", width: 1440, height: 900 },
  xlDesktop: { name: "xl", width: 1920, height: 1080 },
};

// Adds mobile and desktop viewports to tests if not specified
export const transformTests = (tests: ComponentTest[]) => {
  return tests.reduce((accumulator, test) => {
    if (test.viewport) {
      accumulator.push(test as ComponentTestWithViewport);
    } else {
      accumulator.push({ ...test, viewport: viewports.desktop });
      accumulator.push({ ...test, viewport: viewports.tablet });
      accumulator.push({ ...test, viewport: viewports.mobile });
      if (test.includeXLViewport) {
        accumulator.push({ ...test, viewport: viewports.xlDesktop });
      }
    }

    return accumulator;
  }, [] as ComponentTestWithViewport[]);
};

export type ComponentTest = {
  name: string;
  document: Record<string, any>;
  version: number;
  props: Record<string, any>;
  interactions?: (page: BrowserPage) => Promise<void>;
  viewport?: {
    name: string;
    width: number;
    height: number;
  };
  includeXLViewport?: boolean;
};

export type ComponentTestWithViewport = ComponentTest &
  Required<Pick<ComponentTest, "viewport">>;

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Shared Test Data
export const testHours = {
  friday: {
    openIntervals: [
      {
        end: "16:00",
        start: "10:00",
      },
    ],
  },
  monday: {
    openIntervals: [
      {
        end: "22:00",
        start: "10:00",
      },
    ],
  },
  saturday: {
    openIntervals: [
      {
        end: "22:00",
        start: "10:00",
      },
    ],
  },
  sunday: {
    openIntervals: [
      {
        end: "14:00",
        start: "11:00",
      },
    ],
  },
  thursday: {
    openIntervals: [
      {
        end: "22:00",
        start: "10:00",
      },
    ],
  },
  tuesday: {
    openIntervals: [
      {
        end: "19:00",
        start: "10:00",
      },
    ],
  },
  wednesday: {
    openIntervals: [
      {
        end: "22:00",
        start: "10:00",
      },
    ],
  },
};
