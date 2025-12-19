import React from "react";
import { PresetImageType } from "../types/types";
import { AppStoreButton } from "../components/base/buttons/AppStoreButton";
import { GooglePlayButton } from "../components/base/buttons/GooglePlayButton";
import { GalaxyStoreButton } from "../components/base/buttons/GalaxyStoreButton";
import { AppGalleryButton } from "../components/base/buttons/AppGalleryButton";
import { DeliverooButton } from "../components/base/buttons/DeliverooButton";
import { DoordashButton } from "../components/base/buttons/DoordashButton";
import { GrubhubButton } from "../components/base/buttons/GrubhubButton";
import { SkipTheDishesButton } from "../components/base/buttons/SkipTheDishesButton";
import { PostmatesButton } from "../components/base/buttons/PostmatesButton";
import { UberEatsButton } from "../components/base/buttons/UberEatsButton";
import { EzCaterButton } from "../components/base/buttons/EzCaterButton";

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
