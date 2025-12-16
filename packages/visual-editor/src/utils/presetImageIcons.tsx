import React from "react";
import { PresetImageType } from "../types/types";
import {
  GooglePlayButton,
  AppStoreButton,
  GalaxyStoreButton,
  AppGalleryButton,
  DeliverooButton,
  DoordashButton,
  GrubhubButton,
  SkipTheDishesButton,
  PostmatesButton,
  UberEatsButton,
  EzCaterButton,
} from "../components/base/buttons/app-store-buttons";

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
