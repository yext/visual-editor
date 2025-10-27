import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate";
import { CTAWrapperProps, ImageWrapperProps } from "../contentBlocks";
import { PrimaryHeaderSlotProps } from "../header/PrimaryHeaderSlot";
import { SecondaryHeaderSlotProps } from "../header/SecondaryHeaderSlot";
import { HeaderLinksProps } from "../header/HeaderLinks";

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
                    data: {
                      links: props.data?.secondaryHeader.secondaryLinks,
                    },
                    parentData: {
                      type: "Secondary",
                    },
                  } satisfies HeaderLinksProps,
                },
              ],
            },
          } satisfies WithId<SecondaryHeaderSlotProps>,
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
                        data: {
                          show: props.data?.primaryHeader.showPrimaryCTA,
                          entityField: {
                            field: "",
                            constantValue: props.data?.primaryHeader.primaryCTA,
                            constantValueEnabled: true,
                          },
                        },
                        styles: {
                          displayType: "textAndLink",
                          variant:
                            props.styles?.primaryHeader.primaryCtaVariant,
                        },
                      } satisfies CTAWrapperProps,
                    },
                  ],
                  SecondaryCTASlot: [
                    {
                      type: "CTASlot",
                      props: {
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
                          displayType: "textAndLink",
                          variant:
                            props.styles?.primaryHeader.secondaryCtaVariant,
                        },
                      } satisfies CTAWrapperProps,
                    },
                  ],
                  LogoSlot: [
                    {
                      type: "ImageSlot",
                      props: {
                        data: {
                          image: {
                            field: "",
                            constantValue: props.data?.primaryHeader.logo,
                            constantValueEnabled: true,
                          },
                        },
                        styles: {
                          width: props.styles?.primaryHeader.logo?.width ?? 200,
                          aspectRatio:
                            props.styles?.primaryHeader.logo?.aspectRatio ?? 1,
                        },
                      } satisfies ImageWrapperProps,
                    },
                  ],
                  LinksSlot: [
                    {
                      type: "HeaderLinks",
                      props: {
                        data: {
                          links: props.data?.primaryHeader.links,
                        },
                        parentData: {
                          type: "Primary",
                        },
                      } satisfies HeaderLinksProps,
                    },
                  ],
                },
              } satisfies PrimaryHeaderSlotProps,
            },
          ],
          SecondaryHeaderSlot: secondaryHeaderSlot,
        },
      };
    },
  },
};
