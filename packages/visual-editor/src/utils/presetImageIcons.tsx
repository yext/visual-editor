import React from "react";
import { PresetImageType } from "../types/types.ts";
import { AppStoreButton } from "../components/base/buttons/AppStoreButton.tsx";
import { GooglePlayButton } from "../components/base/buttons/GooglePlayButton.tsx";
import { GalaxyStoreButton } from "../components/base/buttons/GalaxyStoreButton.tsx";
import { AppGalleryButton } from "../components/base/buttons/AppGalleryButton.tsx";
import { DeliverooButton } from "../components/base/buttons/DeliverooButton.tsx";
import { DoordashButton } from "../components/base/buttons/DoordashButton.tsx";
import { GrubhubButton } from "../components/base/buttons/GrubhubButton.tsx";
import { SkipTheDishesButton } from "../components/base/buttons/SkipTheDishesButton.tsx";
import { PostmatesButton } from "../components/base/buttons/PostmatesButton.tsx";
import { UberEatsButton } from "../components/base/buttons/UberEatsButton.tsx";
import { EzCaterButton } from "../components/base/buttons/EzCaterButton.tsx";

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
