import { Migration } from "../../utils/migrate";

export const expandedHeaderSlots: Migration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      const secondaryHeaderSlot = [
        {
          type: "SecondaryHeaderSlot",
          props: {
            id: `${props.id}-SecondaryHeaderSlot`,
            data: {
              show: props.data?.secondaryHeader.show,
              showLanguageDropdown:
                props.data?.secondaryHeader.showLanguageDropdown,
            },
            styles: {
              backgroundColor: props.styles?.secondaryHeader?.backgroundColor,
            },
            parentStyles: {
              maxWidth: props.styles?.maxWidth,
            },
            slots: {
              LinksSlot: [
                {
                  type: "HeaderLinks",
                  props: {
                    id: `${props.id}-SecondaryHeaderLinksSlot`,
                    data: {
                      links: props.data?.secondaryHeader.secondaryLinks,
                    },
                    parentData: {
                      type: "Secondary",
                    },
                  },
                },
              ],
            },
          },
        },
      ];

      return {
        id: props.id,
        styles: {
          maxWidth: props.styles?.maxWidth,
          headerPosition: props.styles?.headerPosition,
        },
        slots: {
          PrimaryHeaderSlot: [
            {
              type: "PrimaryHeaderSlot",
              props: {
                id: `${props.id}-PrimaryHeaderSlot`,
                styles: {
                  backgroundColor: props.styles?.primaryHeader?.backgroundColor,
                },
                parentValues: {
                  maxWidth: props.styles?.maxWidth,
                  SecondaryHeaderSlot: secondaryHeaderSlot,
                },
                slots: {
                  PrimaryCTASlot: [
                    {
                      type: "CTASlot",
                      props: {
                        id: `${props.id}-PrimaryCTASlot`,
                        data: {
                          show: props.data?.primaryHeader.showPrimaryCTA,
                          entityField: {
                            field: "",
                            constantValue: props.data?.primaryHeader.primaryCTA,
                            constantValueEnabled: true,
                          },
                        },
                        styles: {
                          variant:
                            props.styles?.primaryHeader.primaryCtaVariant,
                          presetImage: "app-store",
                        },
                        eventName: "primaryCta",
                      },
                    },
                  ],
                  SecondaryCTASlot: [
                    {
                      type: "CTASlot",
                      props: {
                        id: `${props.id}-SecondaryCTASlot`,
                        data: {
                          show: props.data?.primaryHeader.showSecondaryCTA,
                          entityField: {
                            field: "",
                            constantValue:
                              props.data?.primaryHeader.secondaryCTA,
                            constantValueEnabled: true,
                          },
                        },
                        styles: {
                          variant:
                            props.styles?.primaryHeader.secondaryCtaVariant,
                          presetImage: "app-store",
                        },
                        eventName: "secondaryCta",
                      },
                    },
                  ],
                  LogoSlot: [
                    {
                      type: "ImageSlot",
                      props: {
                        id: `${props.id}-LogoSlot`,
                        data: {
                          image: {
                            field: "",
                            constantValue:
                              typeof props.data?.primaryHeader.logo === "string"
                                ? {
                                    url: props.data?.primaryHeader.logo,
                                    alternateText: {
                                      en: "Logo",
                                      hasLocalizedValue: "true",
                                    },
                                  }
                                : props.data?.primaryHeader.logo,
                            constantValueEnabled: true,
                          },
                        },
                        styles: {
                          width: props.styles?.primaryHeader.logo?.width ?? 200,
                          aspectRatio:
                            props.styles?.primaryHeader.logo?.aspectRatio ?? 1,
                        },
                      },
                    },
                  ],
                  LinksSlot: [
                    {
                      type: "HeaderLinks",
                      props: {
                        id: `${props.id}-PrimaryHeaderLinksSlot`,
                        data: {
                          links: props.data?.primaryHeader.links,
                        },
                        parentData: {
                          type: "Primary",
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
          SecondaryHeaderSlot: secondaryHeaderSlot,
        },
      };
    },
  },
};
