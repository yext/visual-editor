import React from "react";
import { PresetImageType } from "../types/types.ts";
import { AppStoreButton } from "../components/assets/presetImages/AppStoreButton.tsx";
import { GooglePlayButton } from "../components/assets/presetImages/GooglePlayButton.tsx";
import { GalaxyStoreButton } from "../components/assets/presetImages/GalaxyStoreButton.tsx";
import { AppGalleryButton } from "../components/assets/presetImages/AppGalleryButton.tsx";
import { DeliverooButton } from "../components/assets/presetImages/DeliverooButton.tsx";
import { DoordashButton } from "../components/assets/presetImages/DoordashButton.tsx";
import { GrubhubButton } from "../components/assets/presetImages/GrubhubButton.tsx";
import { SkipTheDishesButton } from "../components/assets/presetImages/SkipTheDishesButton.tsx";
import { PostmatesButton } from "../components/assets/presetImages/PostmatesButton.tsx";
import { UberEatsButton } from "../components/assets/presetImages/UberEatsButton.tsx";
import { EzCaterButton } from "../components/assets/presetImages/EzCaterButton.tsx";

// Preset image icons mapping - only app store and food delivery logos for CTAs
export const presetImageIcons: Record<PresetImageType, React.ReactNode> = {
  "app-store": <AppStoreButton size="lg" />,
  "google-play": <GooglePlayButton size="lg" />,
  "galaxy-store": <GalaxyStoreButton size="lg" />,
  "app-gallery": <AppGalleryButton size="lg" />,

  deliveroo: <DeliverooButton />,
  doordash: <DoordashButton />,
  grubhub: <GrubhubButton />,
  "skip-the-dishes": <SkipTheDishesButton />,
  postmates: <PostmatesButton />,
  "uber-eats": <UberEatsButton />,
  ezcater: <EzCaterButton />,
};
