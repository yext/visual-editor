import { configureAxe } from "jest-axe";
import { defaultThemeConfig, applyTheme } from "@yext/visual-editor";
// Applies the theme tailwind classes
import "./WCAG.css";
// Enabled expect().toHaveNoViolations()
import "jest-axe/extend-expect";

// Applies the theme variables
beforeEach(() => {
  const tag = document.createElement("style");
  tag.textContent = applyTheme({}, defaultThemeConfig);
  document.head.appendChild(tag);
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
export const viewports = [
  { name: "mobile", width: 375, height: 667 },
  { name: "desktop", width: 1440, height: 900 },
];

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
