import { Migration } from "../../utils/migrate.ts";

// Helper to get locales from streamDocument
const getLocales = (streamDocument: any): string[] => {
  try {
    return JSON.parse(streamDocument._pageset).scope.locales || ["en"];
  } catch {
    return ["en"];
  }
};

// Helper to migrate Image constant value
const migrateImage = (image: any, locales: string[]) => {
  if (!image) return image;
  // If already localized, return as is
  if ("hasLocalizedValue" in image) return image;

  // If it's a legacy image object (url, width, height, etc.)
  // Wrap it in localized structure
  const localizedImage: any = {
    hasLocalizedValue: "true",
  };

  locales.forEach((locale) => {
    localizedImage[locale] = image;
  });

  return localizedImage;
};

// Helper to migrate CTA link
const migrateCTALink = (cta: any, locales: string[]) => {
  if (!cta) return cta;

  // Migrate link if it's a string
  if (cta.link && typeof cta.link === "string") {
    const localizedLink: any = {
      hasLocalizedValue: "true",
    };
    locales.forEach((locale) => {
      localizedLink[locale] = cta.link;
    });
    cta.link = localizedLink;
  }

  return cta;
};

export const translatableCTAImageMigration: Migration = {
  PromoSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const locales = getLocales(streamDocument);

      // Migrate ImageSlot
      if (props.slots?.ImageSlot?.[0]?.props?.data?.image?.constantValue) {
        props.slots.ImageSlot[0].props.data.image.constantValue = migrateImage(
          props.slots.ImageSlot[0].props.data.image.constantValue,
          locales
        );
      }

      // Migrate CTASlot
      if (props.slots?.CTASlot?.[0]?.props?.data?.entityField?.constantValue) {
        props.slots.CTASlot[0].props.data.entityField.constantValue =
          migrateCTALink(
            props.slots.CTASlot[0].props.data.entityField.constantValue,
            locales
          );
      }

      return props;
    },
  },
  HeroSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const locales = getLocales(streamDocument);

      // Migrate ImageSlot
      if (props.slots?.ImageSlot?.[0]?.props?.data?.image?.constantValue) {
        props.slots.ImageSlot[0].props.data.image.constantValue = migrateImage(
          props.slots.ImageSlot[0].props.data.image.constantValue,
          locales
        );
      }

      // Migrate PrimaryCTASlot
      if (
        props.slots?.PrimaryCTASlot?.[0]?.props?.data?.entityField
          ?.constantValue
      ) {
        props.slots.PrimaryCTASlot[0].props.data.entityField.constantValue =
          migrateCTALink(
            props.slots.PrimaryCTASlot[0].props.data.entityField.constantValue,
            locales
          );
      }

      // Migrate SecondaryCTASlot
      if (
        props.slots?.SecondaryCTASlot?.[0]?.props?.data?.entityField
          ?.constantValue
      ) {
        props.slots.SecondaryCTASlot[0].props.data.entityField.constantValue =
          migrateCTALink(
            props.slots.SecondaryCTASlot[0].props.data.entityField
              .constantValue,
            locales
          );
      }

      return props;
    },
  },
  EventSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const locales = getLocales(streamDocument);

      const cardsWrapper = props.slots?.CardsWrapperSlot?.[0];
      if (cardsWrapper?.props?.slots?.CardSlot) {
        cardsWrapper.props.slots.CardSlot.forEach((card: any) => {
          // Migrate ImageSlot
          if (
            card.props?.slots?.ImageSlot?.[0]?.props?.data?.image?.constantValue
          ) {
            card.props.slots.ImageSlot[0].props.data.image.constantValue =
              migrateImage(
                card.props.slots.ImageSlot[0].props.data.image.constantValue,
                locales
              );
          }
          // Migrate CTASlot
          if (
            card.props?.slots?.CTASlot?.[0]?.props?.data?.entityField
              ?.constantValue
          ) {
            card.props.slots.CTASlot[0].props.data.entityField.constantValue =
              migrateCTALink(
                card.props.slots.CTASlot[0].props.data.entityField
                  .constantValue,
                locales
              );
          }
        });
      }

      return props;
    },
  },
  TeamSection: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const locales = getLocales(streamDocument);

      const cardsWrapper = props.slots?.CardsWrapperSlot?.[0];
      if (cardsWrapper?.props?.slots?.CardSlot) {
        cardsWrapper.props.slots.CardSlot.forEach((card: any) => {
          // Migrate ImageSlot
          if (
            card.props?.slots?.ImageSlot?.[0]?.props?.data?.image?.constantValue
          ) {
            card.props.slots.ImageSlot[0].props.data.image.constantValue =
              migrateImage(
                card.props.slots.ImageSlot[0].props.data.image.constantValue,
                locales
              );
          }
          // Migrate CTASlot
          if (
            card.props?.slots?.CTASlot?.[0]?.props?.data?.entityField
              ?.constantValue
          ) {
            card.props.slots.CTASlot[0].props.data.entityField.constantValue =
              migrateCTALink(
                card.props.slots.CTASlot[0].props.data.entityField
                  .constantValue,
                locales
              );
          }
        });
      }

      return props;
    },
  },
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const locales = getLocales(streamDocument);

      const primaryHeader = props.slots?.PrimaryHeaderSlot?.[0];
      if (primaryHeader) {
        // Migrate LogoSlot (Image)
        if (
          primaryHeader.props?.slots?.LogoSlot?.[0]?.props?.data?.image
            ?.constantValue
        ) {
          primaryHeader.props.slots.LogoSlot[0].props.data.image.constantValue =
            migrateImage(
              primaryHeader.props.slots.LogoSlot[0].props.data.image
                .constantValue,
              locales
            );
        }

        // Migrate PrimaryCTASlot
        if (
          primaryHeader.props?.slots?.PrimaryCTASlot?.[0]?.props?.data
            ?.entityField?.constantValue
        ) {
          primaryHeader.props.slots.PrimaryCTASlot[0].props.data.entityField.constantValue =
            migrateCTALink(
              primaryHeader.props.slots.PrimaryCTASlot[0].props.data.entityField
                .constantValue,
              locales
            );
        }

        // Migrate SecondaryCTASlot
        if (
          primaryHeader.props?.slots?.SecondaryCTASlot?.[0]?.props?.data
            ?.entityField?.constantValue
        ) {
          primaryHeader.props.slots.SecondaryCTASlot[0].props.data.entityField.constantValue =
            migrateCTALink(
              primaryHeader.props.slots.SecondaryCTASlot[0].props.data
                .entityField.constantValue,
              locales
            );
        }
      }

      return props;
    },
  },
  ExpandedFooter: {
    action: "updated",
    propTransformation: (props, streamDocument) => {
      const locales = getLocales(streamDocument);

      // Migrate LogoSlot
      if (props.slots?.LogoSlot?.[0]?.props?.data?.image?.constantValue) {
        props.slots.LogoSlot[0].props.data.image.constantValue = migrateImage(
          props.slots.LogoSlot[0].props.data.image.constantValue,
          locales
        );
      }

      // Migrate PrimaryLinksWrapperSlot
      if (props.slots?.PrimaryLinksWrapperSlot?.[0]?.props?.data?.links) {
        props.slots.PrimaryLinksWrapperSlot[0].props.data.links =
          props.slots.PrimaryLinksWrapperSlot[0].props.data.links.map(
            (link: any) => migrateCTALink(link, locales)
          );
      }

      // Migrate ExpandedLinksWrapperSlot
      if (props.slots?.ExpandedLinksWrapperSlot?.[0]?.props?.data?.links) {
        props.slots.ExpandedLinksWrapperSlot[0].props.data.links =
          props.slots.ExpandedLinksWrapperSlot[0].props.data.links.map(
            (link: any) => migrateCTALink(link, locales)
          );
      }

      // Migrate UtilityImagesSlot
      if (props.slots?.UtilityImagesSlot?.[0]?.props?.data?.utilityImages) {
        props.slots.UtilityImagesSlot[0].props.data.utilityImages.forEach(
          (item: any) => {
            if (item.image) {
              item.image = migrateImage(item.image, locales);
            }
          }
        );
      }

      return props;
    },
  },
};
