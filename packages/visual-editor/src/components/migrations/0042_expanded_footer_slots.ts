import { Migration } from "../../utils/migrate";

export const expandedFooterSlots: Migration = {
  ExpandedFooter: {
    action: "updated",
    propTransformation: (props) => {
      // Extract all data from primaryFooter
      const {
        logo,
        xLink,
        facebookLink,
        instagramLink,
        linkedInLink,
        pinterestLink,
        tiktokLink,
        youtubeLink,
        utilityImages,
        footerLinks,
        expandedFooterLinks,
        expandedFooter,
      } = props.data.primaryFooter || {};

      // Extract data from secondaryFooter
      const { secondaryFooterLinks, copyrightMessage, show } =
        props.data.secondaryFooter || {};

      // Get secondary footer styles
      const secondaryBackgroundColor =
        props.styles?.secondaryFooter?.backgroundColor;
      const secondaryLinksAlignment =
        props.styles?.secondaryFooter?.linksAlignment || "left";

      // Get logo styles
      const logoWidth = props.styles?.primaryFooter?.logo?.width || 100;
      const logoAspectRatio =
        props.styles?.primaryFooter?.logo?.aspectRatio || 1.78;
      const utilityImagesWidth =
        props.styles?.primaryFooter?.utilityImages?.width || 60;
      const utilityImagesAspectRatio =
        props.styles?.primaryFooter?.utilityImages?.aspectRatio || 1;

      return {
        ...props,
        data: {
          ...props.data,
          primaryFooter: {
            expandedFooter: expandedFooter ?? false,
          },
        },
        slots: {
          LogoSlot: [
            {
              type: "FooterLogoSlot",
              props: {
                id: `${props.id}-FooterLogoSlot`,
                data: {
                  image: {
                    field: "",
                    constantValue: logo || {
                      url: "",
                      height: 100,
                      width: 100,
                      alternateText: { en: "Logo", hasLocalizedValue: "true" },
                    },
                    constantValueEnabled: true,
                  },
                },
                styles: {
                  width: logoWidth,
                  aspectRatio: logoAspectRatio,
                },
              },
            },
          ],
          SocialLinksSlot: [
            {
              type: "FooterSocialLinksSlot",
              props: {
                id: `${props.id}-FooterSocialLinksSlot`,
                data: {
                  xLink: xLink || "",
                  facebookLink: facebookLink || "",
                  instagramLink: instagramLink || "",
                  linkedInLink: linkedInLink || "",
                  pinterestLink: pinterestLink || "",
                  tiktokLink: tiktokLink || "",
                  youtubeLink: youtubeLink || "",
                },
              },
            },
          ],
          UtilityImagesSlot: [
            {
              type: "FooterUtilityImagesSlot",
              props: {
                id: `${props.id}-FooterUtilityImagesSlot`,
                data: {
                  utilityImages: utilityImages || [],
                },
                styles: {
                  width: utilityImagesWidth,
                  aspectRatio: utilityImagesAspectRatio,
                },
              },
            },
          ],
          PrimaryLinksWrapperSlot: [
            {
              type: "FooterLinksSlot",
              props: {
                id: `${props.id}-FooterPrimaryLinksSlot`,
                data: {
                  links: footerLinks || [],
                },
                variant: "primary",
                eventNamePrefix: "primary",
              },
            },
          ],
          ExpandedLinksWrapperSlot: [
            {
              type: "FooterExpandedLinksWrapper",
              props: {
                id: `${props.id}-FooterExpandedLinksWrapper`,
                data: {
                  sections: expandedFooterLinks || [],
                },
              },
            },
          ],
          SecondaryFooterSlot: [
            {
              type: "SecondaryFooterSlot",
              props: {
                id: `${props.id}-SecondaryFooterSlot`,
                data: {
                  show: show ?? true,
                },
                styles: {
                  backgroundColor: secondaryBackgroundColor,
                  linksAlignment: secondaryLinksAlignment,
                },
                maxWidth: props.styles?.maxWidth || "theme",
                slots: {
                  SecondaryLinksWrapperSlot: [
                    {
                      type: "FooterLinksSlot",
                      props: {
                        id: `${props.id}-FooterSecondaryLinksSlot`,
                        data: {
                          links: secondaryFooterLinks || [],
                        },
                        variant: "secondary",
                        eventNamePrefix: "secondary",
                        alignment: secondaryLinksAlignment,
                      },
                    },
                  ],
                  CopyrightSlot: [
                    {
                      type: "CopyrightMessageSlot",
                      props: {
                        id: `${props.id}-CopyrightSlot`,
                        data: {
                          text: copyrightMessage || {
                            en: "",
                            hasLocalizedValue: "true",
                          },
                        },
                        alignment: secondaryLinksAlignment,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      };
    },
  },
};
