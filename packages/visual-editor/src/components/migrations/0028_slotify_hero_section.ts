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
                data: {
                  entityField: {
                    field: field ? field + ".primaryCta" : "",
                    constantValue: constantValue.primaryCta ?? {
                      label: {
                        en: "Call To Action",
                        hasLocalizedValue: "true",
                      },
                      link: "#",
                      linkType: "URL",
                      ctaType: "textAndLink",
                    },
                    constantValueEnabled:
                      constantValueOverride.primaryCta ?? false,
                  },
                },
                eventName: "primaryCta",
                styles: { variant: primaryCTA },
              },
            },
          ],
          SecondaryCTASlot: [
            {
              type: "CTASlot",
              props: {
                data: {
                  entityField: {
                    field: field ? field + ".secondaryCta" : "",
                    constantValue: constantValue.secondaryCta ?? {
                      label: {
                        en: "Learn More",
                        hasLocalizedValue: "true",
                      },
                      link: "#",
                      linkType: "URL",
                      ctaType: "textAndLink",
                    },
                    constantValueEnabled:
                      constantValueOverride.secondaryCta ?? false,
                  },
                },
                eventName: "secondaryCta",
                styles: { variant: secondaryCTA },
              },
            },
          ],
        },
      };
    },
  },
};
