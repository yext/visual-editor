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
  if (!image) {
    return image;
  }

  // Normalize string to object
  let imageObj = image;
  if (typeof image === "string") {
    imageObj = { url: image };
  }

  // If already localized, return as is
  if ("hasLocalizedValue" in imageObj) {
    return imageObj;
  }

  // If it's a legacy image object (url, width, height, etc.)
  // Wrap it in localized structure
  const localizedImage: any = {
    hasLocalizedValue: "true",
  };

  locales.forEach((locale) => {
    localizedImage[locale] = imageObj;
  });

  return localizedImage;
};

// Helper to migrate CTA link and label
const migrateCTA = (cta: any, locales: string[]) => {
  if (!cta) {
    return cta;
  }

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

  // Migrate label if it's a string
  if (cta.label && typeof cta.label === "string") {
    const localizedLabel: any = {
      hasLocalizedValue: "true",
    };
    locales.forEach((locale) => {
      localizedLabel[locale] = cta.label;
    });
    cta.label = localizedLabel;
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
          migrateCTA(
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
          migrateCTA(
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
          migrateCTA(
            props.slots.SecondaryCTASlot[0].props.data.entityField
              .constantValue,
            locales
          );
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
        let logo = props.slots.LogoSlot[0].props.data.image.constantValue;

        // Normalize logo
        if (typeof logo === "string") {
          logo = { url: logo };
        }
        // Handle nested image.url from legacy complex image
        if (logo?.image?.url && !logo.url) {
          logo = { ...logo, url: logo.image.url };
        }
        // Ensure defaults
        logo = {
          height: 100,
          width: 100,
          alternateText: { en: "Logo", hasLocalizedValue: "true" },
          ...logo,
        };

        props.slots.LogoSlot[0].props.data.image.constantValue = migrateImage(
          logo,
          locales
        );
      }

      // Migrate UtilityImagesSlot
      if (props.slots?.UtilityImagesSlot?.[0]?.props?.data?.utilityImages) {
        const utilityImages =
          props.slots.UtilityImagesSlot[0].props.data.utilityImages;

        props.slots.UtilityImagesSlot[0].props.data.utilityImages =
          utilityImages.map((img: any) => {
            // Normalize utility image item
            let processedImg = img;
            if (typeof img === "string") {
              processedImg = { image: { url: img } };
            } else if (!img.image && img.url) {
              // Handle flat object { url: "...", linkTarget: "..." }
              processedImg = {
                image: { url: img.url },
                linkTarget: img.linkTarget,
              };
            }

            // Ensure defaults for the image part
            if (processedImg.image) {
              // Normalize image string inside the item
              if (typeof processedImg.image === "string") {
                processedImg.image = { url: processedImg.image };
              }

              const baseImage = {
                height: 60,
                width: 60,
                alternateText: "Utility Image",
                ...processedImg.image,
              };

              processedImg.image = migrateImage(baseImage, locales);
            }
            return processedImg;
          });
      }

      // Migrate PrimaryLinksWrapperSlot
      if (props.slots?.PrimaryLinksWrapperSlot?.[0]?.props?.data?.links) {
        props.slots.PrimaryLinksWrapperSlot[0].props.data.links =
          props.slots.PrimaryLinksWrapperSlot[0].props.data.links.map(
            (link: any) => migrateCTA(link, locales)
          );
      }

      // Migrate ExpandedLinksWrapperSlot
      if (props.slots?.ExpandedLinksWrapperSlot?.[0]?.props?.data?.links) {
        props.slots.ExpandedLinksWrapperSlot[0].props.data.links =
          props.slots.ExpandedLinksWrapperSlot[0].props.data.links.map(
            (link: any) => migrateCTA(link, locales)
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
              migrateCTA(
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
              migrateCTA(
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
            migrateCTA(
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
            migrateCTA(
              primaryHeader.props.slots.SecondaryCTASlot[0].props.data
                .entityField.constantValue,
              locales
            );
        }
      }

      return props;
    },
  },
};
