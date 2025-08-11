import * as React from "react";
import { PresetImageType } from "../types/types";
import {
  AppleLogo,
  DribbleLogo,
  FacebookLogo,
  FigmaLogo,
  GoogleLogo,
  TwitterLogo,
} from "../y/base/buttons/social-logos";

// Simple 24x24 SVG icons for app store buttons, matching the style of social media icons
const AppStoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#000" />
    <path d="M7 7h10v10H7z" fill="none" />
    <path d="M9 9h6v6H9z" fill="#fff" />
    <path
      d="M12 8.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"
      fill="#fff"
    />
  </svg>
);

const GooglePlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#01875F" />
    <path d="M8 8l8 4-8 4V8z" fill="#fff" />
    <path d="M8 8l8 4-8 4V8z" fill="#fff" opacity="0.8" />
  </svg>
);

const GalaxyStoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#1428A0" />
    <circle cx="12" cy="12" r="4" fill="#fff" />
    <path
      d="M12 8.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"
      fill="#1428A0"
    />
  </svg>
);

const AppGalleryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#C91C2E" />
    <path d="M9 6h6v12H9z" fill="none" />
    <path d="M10 8h4v2h-4z" fill="#fff" />
    <path d="M10 11h4v2h-4z" fill="#fff" />
    <path d="M10 14h4v2h-4z" fill="#fff" />
  </svg>
);

const AppStoreOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      width="24"
      height="24"
      rx="4"
      stroke="#000"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M9 9h6v6H9z" fill="#000" />
    <path
      d="M12 8.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"
      fill="#000"
    />
  </svg>
);

const GooglePlayOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      width="24"
      height="24"
      rx="4"
      stroke="#01875F"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M8 8l8 4-8 4V8z" fill="#01875F" />
  </svg>
);

const GalaxyStoreOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      width="24"
      height="24"
      rx="4"
      stroke="#1428A0"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      fill="none"
      stroke="#1428A0"
      strokeWidth="1.5"
    />
    <path
      d="M12 8.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"
      fill="#1428A0"
    />
  </svg>
);

const AppGalleryOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      width="24"
      height="24"
      rx="4"
      stroke="#C91C2E"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M9 6h6v12H9z" fill="none" />
    <path d="M10 8h4v2h-4z" fill="#C91C2E" />
    <path d="M10 11h4v2h-4z" fill="#C91C2E" />
    <path d="M10 14h4v2h-4z" fill="#C91C2E" />
  </svg>
);

// Preset image icons mapping using simple SVG icons and actual Untitled UI logo components
export const presetImageIcons: Record<PresetImageType, React.ReactNode> = {
  // App Store Buttons (using simple 24x24 SVG icons, same style as social media icons)
  "app-store": <AppStoreIcon />,
  "google-play": <GooglePlayIcon />,
  "galaxy-store": <GalaxyStoreIcon />,
  "app-gallery": <AppGalleryIcon />,

  // App Store Outline Buttons (using simple 24x24 SVG icons)
  "app-store-outline": <AppStoreOutlineIcon />,
  "google-play-outline": <GooglePlayOutlineIcon />,
  "galaxy-store-outline": <GalaxyStoreOutlineIcon />,
  "app-gallery-outline": <AppGalleryOutlineIcon />,

  // Social Buttons (using actual Untitled UI logo components)
  google: <GoogleLogo colorful />,
  facebook: <FacebookLogo colorful />,
  apple: <AppleLogo />,
  twitter: <TwitterLogo />,
  figma: <FigmaLogo colorful />,
  dribbble: <DribbleLogo colorful />,
};
