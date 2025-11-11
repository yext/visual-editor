import { Migration } from "@yext/visual-editor";

export const heroSectionSlots: Migration = {
  HoursStatus: {
    action: "updated",
    propTransformation: (props) => {
      return {
        id: props.id,
        data: {
          hours: props.hours,
        },
        styles: {
          showCurrentStatus: props.showCurrentStatus,
          timeFormat: props.timeFormat,
          dayOfWeekFormat: props.dayOfWeekFormat,
          showDayNames: props.showDayNames,
          className: props.className,
        },
      };
    },
  },
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      const field = props.data.hero?.field ?? "";
      const constantValue = props.data.hero?.constantValue;
      const constantValueOverride =
        props.data.hero?.constantValueOverride ?? {};

      const showAverageReview = props.data.showAverageReview;
      const imageStyle = props.styles.image;
      const primaryCTA = props.styles.primaryCTA;
      const secondaryCTA = props.styles.secondaryCTA;
      const businessName = props.data.businessName;
      const businessNameLevel = props.styles.businessNameLevel;
      const geomodifier = props.data.localGeoModifier;
      const geomodifierLevel = props.styles.localGeoModifierLevel;
      const hours = props.data.hours;

      delete props.data.hero;
      delete props.data.showAverageReview;
      delete props.styles.image;
      delete props.styles.primaryCTA;
      delete props.styles.secondaryCTA;
      delete props.data.businessName;
      delete props.styles.businessNameLevel;
      delete props.data.localGeoModifier;
      delete props.styles.localGeoModifierLevel;

      if (constantValue?.primaryCta?.ctaType === "getDirections") {
        if (
          constantValue?.primaryCta?.label &&
          !constantValue?.primaryCta?.label?.en
        ) {
          constantValue.primaryCta.label.en = "Get Directions";
        }
      }

      if (constantValue?.secondaryCta?.ctaType === "getDirections") {
        if (
          constantValue?.secondaryCta?.label &&
          !constantValue?.secondaryCta?.label?.en
        ) {
          constantValue.secondaryCta.label.en = "Get Directions";
        }
      }

      return {
        ...props,
        data: {
          backgroundImage: {
            field: field ? field + ".image" : "",
            constantValue: constantValue.image ?? {},
            constantValueEnabled: constantValueOverride.image ?? false,
          },
        },
        styles: {
          ...props.styles,
          showAverageReview: showAverageReview,
          imageHeight: imageStyle.height ?? constantValue.image.height ?? 500,
        },
        slots: {
          BusinessNameSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-BusinessNameSlot`,
                data: {
                  text: businessName,
                },
                styles: {
                  level: businessNameLevel,
                  align: "left",
                },
              },
            },
          ],
          GeomodifierSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-GeomodifierSlot`,
                data: {
                  text: geomodifier,
                },
                styles: {
                  level: geomodifierLevel ?? 1,
                },
              },
            },
          ],
          HoursStatusSlot: [
            {
              type: "HoursStatusSlot",
              props: {
                id: `${props.id}-HoursStatusSlot`,
                data: {
                  hours: hours,
                },
                styles: {},
              },
            },
          ],
          ImageSlot: [
            {
              type: "HeroImageSlot",
              props: {
                id: `${props.id}-ImageSlot`,
                data: {
                  image: {
                    field: field ? field + ".image" : "",
                    constantValue: constantValue.image ?? {
                      url: "https://placehold.co/640x360",
                      height: 360,
                      width: 640,
                    },
                    constantValueEnabled: constantValueOverride.image ?? false,
                  },
                },
                styles: { ...imageStyle },
                variant: imageStyle.variant ?? "classic",
              },
            },
          ],
          PrimaryCTASlot: [
            {
              type: "CTASlot",
              props: {
                id: `${props.id}-PrimaryCTASlot`,
                data: {
                  entityField: {
                    field: field ? field + ".primaryCta" : "",
                    constantValue: {
                      label:
                        constantValue?.primaryCta?.label ??
                        (constantValue.primaryCta?.ctaType === "getDirections"
                          ? { en: "Get Directions", hasLocalizedValue: "true" }
                          : {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            }),
                      link: constantValue?.primaryCta?.link ?? "#",
                      linkType: constantValue?.primaryCta?.linkType ?? "URL",
                      ctaType:
                        constantValue?.primaryCta?.ctaType ?? "textAndLink",
                    },
                    selectedTypes:
                      constantValue.primaryCta?.ctaType === "getDirections"
                        ? ["type.coordinate"]
                        : ["type.cta"],
                    constantValueEnabled:
                      constantValueOverride.primaryCta ?? false,
                  },
                },
                eventName: "primaryCta",
                styles: {
                  variant: primaryCTA,
                  presetImage:
                    constantValue.primaryCta.ctaType === "presetImage"
                      ? constantValue.primaryCta.presetImageType
                      : undefined,
                },
              },
            },
          ],
          SecondaryCTASlot: [
            {
              type: "CTASlot",
              props: {
                id: `${props.id}-SecondaryCTASlot`,
                data: {
                  entityField: {
                    field: field ? field + ".secondaryCta" : "",
                    constantValue: {
                      label:
                        constantValue?.secondaryCta?.label ??
                        (constantValue.secondaryCta?.ctaType === "getDirections"
                          ? { en: "Get Directions", hasLocalizedValue: "true" }
                          : {
                              en: "Learn More",
                              hasLocalizedValue: "true",
                            }),
                      link: constantValue?.secondaryCta?.link ?? "#",
                      linkType: constantValue?.secondaryCta?.linkType ?? "URL",
                    },
                    selectedTypes:
                      constantValue.secondaryCta?.ctaType === "getDirections"
                        ? ["type.coordinate"]
                        : ["type.cta"],
                    constantValueEnabled:
                      constantValueOverride.secondaryCta ?? false,
                    ctaType:
                      constantValue?.primaryCta?.ctaType ?? "textAndLink",
                  },
                },
                eventName: "secondaryCta",
                styles: {
                  variant: secondaryCTA,
                  presetImage:
                    constantValue.secondaryCta.ctaType === "presetImage"
                      ? constantValue.secondaryCta.presetImageType
                      : undefined,
                },
              },
            },
          ],
        },
      };
    },
  },
};
