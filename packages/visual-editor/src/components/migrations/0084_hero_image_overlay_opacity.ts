import { Migration } from "../../utils/migrate.ts";

export const heroImageOverlayOpacityMigration: Migration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      styles: {
        ...props.styles,
        imageOverlayOpacity: props.styles?.imageOverlayOpacity ?? 60,
      },
    }),
  },
};
