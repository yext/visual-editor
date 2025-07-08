import { configureAxe } from "jest-axe";
import { defaultThemeConfig, applyTheme } from "@yext/visual-editor";
// Applies the theme tailwind classes
import "./componentTests.css";
// Enabled expect().toHaveNoViolations()
import "jest-axe/extend-expect";
import { expect, vi } from "vitest";
import { BrowserPage, commands, page } from "@vitest/browser/context";

expect.extend({
  async toMatchScreenshot(screenshotName: string) {
    const updatedScreenshotData = await page.screenshot({
      save: false,
    });

    const numDiffPixels = await commands.compareScreenshot(
      screenshotName,
      updatedScreenshotData
    );

    if (numDiffPixels > 0) {
      return {
        pass: false,
        message: () => "Screenshots did not match",
      };
    }

    return {
      pass: true,
      message: () => "Screenshots matched",
    };
  },
});

// Applies the theme variables and mocks the date
beforeEach(() => {
  // July 1, 2025 Noon (month is 0-indexed)
  vi.setSystemTime(new Date(2025, 6, 1, 12, 0, 0).valueOf());

  const tag = document.createElement("style");
  const themeTags = applyTheme({}, defaultThemeConfig);

  // don't load fonts
  const match = themeTags.match(/<style[^>]*>[\s\S]*?<\/style>/);
  if (match && match[0]) {
    const theme = match[0];

    document.head.appendChild(tag);
    tag.outerHTML = theme;
  } else {
    console.error("failed to apply theme");
  }
});

// jest-axe disabled color contrast checks by default because they are
// not supported in JSDOM. However, we are running the tests in playwright
// so we want to re-enable the checks.
export const axe = configureAxe({
  globalOptions: {
    rules: [{ id: "color-contrast", enabled: true }],
  },
});

// Each test will run once for each of the following viewports
export const viewports = {
  mobile: { name: "mobile", width: 375, height: 667 },
  desktop: { name: "desktop", width: 1440, height: 900 },
};

// Adds mobile and desktop viewports to tests if not specified
export const transformTests = (tests: ComponentTest[]) => {
  return tests.reduce((accumulator, test) => {
    if (test.viewport) {
      accumulator.push(test as ComponentTestWithViewport);
    } else {
      accumulator.push({ ...test, viewport: viewports.desktop });
      accumulator.push({ ...test, viewport: viewports.mobile });
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
};

export type ComponentTestWithViewport = ComponentTest &
  Required<Pick<ComponentTest, "viewport">>;

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Shared Test Data
export const testSite = {
  header: {
    links: [
      { label: "Home", link: "index.html", linkType: "OTHER" },
      {
        label: "More Info",
        link: "https://yext.com",
        linkType: "URL",
      },
      { label: "Call Us", link: "+12125550110", linkType: "PHONE" },
    ],
  },
  logo: {
    image: {
      alternateText: "The Galaxy Grill Logo",
      height: 1152,
      url: "https://a.mktgcdn.com/p-dev/YfHDxOszJCxQZt7PEHtzUWk8sGzV5E_q2BLXYc_fCHo/1152x1152.png",
      width: 1152,
    },
  },
  copyrightMessage: "© 2025 Yext",
  footer: {
    links: [
      {
        label: "Privacy Policy",
        link: "https://www.yext.com/privacy-policy",
        linkType: "URL",
      },
      {
        label: "Contact Us",
        link: "sumo@yext.com",
        linkType: "EMAIL",
      },
    ],
  },
  instagramHandle: "yextinc",
  youTubeChannelUrl: "https://www.youtube.com/c/yext",
};

export const testHours = {
  friday: {
    openIntervals: [
      {
        end: "22:00",
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
        end: "22:00",
        start: "10:00",
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
        end: "22:00",
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
