import React from "react";
import { PresetImageType } from "../types/types";
import {
  GooglePlayButton,
  AppStoreButton,
  GalaxyStoreButton,
  AppGalleryButton,
} from "../components/base/buttons/app-store-buttons";

// Preset image icons mapping - only app store and food delivery logos for CTAs
export const presetImageIcons: Record<PresetImageType, React.ReactNode> = {
  "app-store": <AppStoreButton size="lg" />,
  "google-play": <GooglePlayButton size="lg" />,
  "galaxy-store": <GalaxyStoreButton size="lg" />,
  "app-gallery": <AppGalleryButton size="lg" />,

  "uber-eats": (
    <img
      src="https://cdn-assets-us.frontify.com/s3/frontify-enterprise-files-us/eyJwYXRoIjoicG9zdG1hdGVzXC9maWxlXC85SFNOWGg4TllyaHBoRUw1WWdjYi5wbmcifQ:postmates:Cq8658w3bJfQOxFkVZRRr-2BUG00jWQDG429urRCZpM?width=115"
      srcSet={
        "https://cdn-assets-us.frontify.com/s3/frontify-enterprise-files-us/eyJwYXRoIjoicG9zdG1hdGVzXC9maWxlXC85SFNOWGg4TllyaHBoRUw1WWdjYi5wbmcifQ:postmates:Cq8658w3bJfQOxFkVZRRr-2BUG00jWQDG429urRCZpM?width=115 1x, " +
        "https://cdn-assets-us.frontify.com/s3/frontify-enterprise-files-us/eyJwYXRoIjoicG9zdG1hdGVzXC9maWxlXC85SFNOWGg4TllyaHBoRUw1WWdjYi5wbmcifQ:postmates:Cq8658w3bJfQOxFkVZRRr-2BUG00jWQDG429urRCZpM?width=230 2x, " +
        "https://cdn-assets-us.frontify.com/s3/frontify-enterprise-files-us/eyJwYXRoIjoicG9zdG1hdGVzXC9maWxlXC85SFNOWGg4TllyaHBoRUw1WWdjYi5wbmcifQ:postmates:Cq8658w3bJfQOxFkVZRRr-2BUG00jWQDG429urRCZpM?width=345 3x"
      }
      alt="Uber Eats"
      width="115"
      style={{ objectFit: "contain" }}
    />
  ),
};
