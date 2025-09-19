import { ComponentConfig, Slot } from "@measured/puck";
import { YextField, msg, backgroundColors } from "@yext/visual-editor";
import { HeroStyles } from "./HeroSection";
import {
  AddressProps,
  BodyTextProps,
  MapboxStaticProps,
  HoursTableProps,
  HoursStatusProps,
  GetDirectionsProps,
  EmailsProps,
  CTAGroupProps,
  CTAWrapperProps,
  HeadingTextProps,
  ImageWrapperProps,
  PhoneProps,
  TextListProps,
  Emails,
  TextList,
  Phone,
  MapboxStaticMap,
  ImageWrapper,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  CTAGroup,
  CTAWrapper,
  BodyText,
  Address,
} from "../contentBlocks";
import { SlottedPageSection } from "../atoms/slottedPageSection";
import { SlotFlex, SlotFlexProps } from "../layoutBlocks/SlotFlex";
import { ComponentDataOptionalId } from "@measured/puck";

export type Components = {
  Address: AddressProps;
  BodyText: BodyTextProps;
  CTAGroup: CTAGroupProps;
  CTAWrapper: CTAWrapperProps;
  Emails: EmailsProps;
  GetDirections: GetDirectionsProps;
  HeadingText: HeadingTextProps;
  HoursStatus: HoursStatusProps;
  HoursTable: HoursTableProps;
  ImageWrapper: ImageWrapperProps;
  MapboxStaticMap: MapboxStaticProps;
  Phone: PhoneProps;
  TextList: TextListProps;
  SlotFlex: SlotFlexProps;
};

const contentBlocks = {
  Address: Address,
  BodyText: BodyText,
  CTAGroup: CTAGroup,
  CTAWrapper: CTAWrapper,
  Emails: Emails,
  GetDirections: GetDirections,
  HeadingText: HeadingText,
  HoursStatus: HoursStatus,
  HoursTable: HoursTable,
  ImageWrapper: ImageWrapper,
  MapboxStaticMap: MapboxStaticMap,
  Phone: Phone,
  TextList: TextList,
  SlotFlex: SlotFlex,
};

async function createComponent<T extends keyof Components>(
  component: T,
  props?: Partial<Components[T]>
): Promise<ComponentDataOptionalId<Components[T]>> {
  return {
    type: component,
    props: {
      ...contentBlocks[component].defaultProps,
      ...props,
    },
  } as ComponentDataOptionalId<Components[T]>;
}

export type SlotHeroProps = {
  children: Slot;
  styles: Pick<
    HeroStyles,
    | "backgroundColor"
    | "desktopImagePosition"
    | "mobileImagePosition"
    | "showImage"
  >;
};

export const SlotHero: ComponentConfig<SlotHeroProps> = {
  label: "Slot Hero",
  fields: {
    children: {
      type: "slot",
    },
    styles: YextField(msg("fields.styles", "Styles"), {
      type: "object",
      objectFields: {
        backgroundColor: YextField(
          msg("fields.backgroundColor", "Background Color"),
          {
            type: "select",
            options: "BACKGROUND_COLOR",
          }
        ),
        showImage: YextField(msg("fields.showImage", "Show Image"), {
          type: "radio",
          options: [
            {
              label: msg("fields.options.true", "True"),
              value: true,
            },
            {
              label: msg("fields.options.false", "False"),
              value: false,
            },
          ],
        }),
        desktopImagePosition: YextField(
          msg("fields.desktopImagePosition", "Desktop Image Position"),
          {
            type: "radio",
            options: [
              {
                label: msg("fields.options.left", "Left", {
                  context: "direction",
                }),
                value: "left",
              },
              {
                label: msg("fields.options.right", "Right", {
                  context: "direction",
                }),
                value: "right",
              },
            ],
          }
        ),
        mobileImagePosition: YextField(
          msg("fields.mobileImagePosition", "Mobile Image Position"),
          {
            type: "radio",
            options: [
              {
                label: msg("fields.options.top", "Top"),
                value: "top",
              },
              {
                label: msg("fields.options.bottom", "Bottom"),
                value: "bottom",
              },
            ],
          }
        ),
      },
    }),
  },
  defaultProps: {
    children: [],
    styles: {
      backgroundColor: backgroundColors.background1.value,
      showImage: true,
      desktopImagePosition: "right",
      mobileImagePosition: "bottom",
    },
  },
  resolveData: async (data, { changed, trigger }) => {
    if (!changed.children || trigger === "load") return data;

    // Create initial content blocks similar to ClassicHero layout
    const children = [];

    // Business Name (H1)
    const businessName = await createComponent("HeadingText", {
      text: {
        field: "",
        constantValue: {
          en: "Business Name",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      level: 1,
    });

    // Local Geo Modifier (H3)
    const localGeoModifier = await createComponent("HeadingText", {
      text: {
        field: "",
        constantValue: {
          en: "Geomodifier",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      level: 3,
    });

    // Business Information Stack
    const businessInformation = await createComponent("SlotFlex", {
      className: "flex-col gap-y-0",
      items: [businessName, localGeoModifier],
    });

    // Hours Status
    const hoursStatus = await createComponent("HoursStatus", {
      hours: {
        field: "hours",
        constantValue: {},
      },
    });

    // CTA Group
    const ctaGroup = await createComponent("CTAGroup", {
      buttons: [
        {
          entityField: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              ctaType: "textAndLink",
              label: "Call To Action",
              link: "#",
            },
          },
          variant: "primary",
        },
        {
          entityField: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              ctaType: "textAndLink",
              label: "Learn More",
              link: "#",
            },
          },
          variant: "secondary",
        },
      ],
    });

    // Hero Content Container
    const heroContent = await createComponent("SlotFlex", {
      className:
        "flex-col gap-y-4 w-full sm:w-initial justify-center lg:min-w-[350px]",
      items: [businessInformation, hoursStatus, ctaGroup],
    });

    // Image if showImage is true
    let leftImageComponent = null;
    let rightImageComponent = null;

    if (data.props.styles.showImage) {
      const imageComponent = await createComponent("ImageWrapper", {
        data: {
          image: {
            field: "",
            constantValue: {
              url: "https://placehold.co/640x360",
              height: 360,
              width: 640,
            },
            constantValueEnabled: true,
          },
        },
        styles: {
          aspectRatio: 1.78, // 16:9
          width: 640,
        },
      });

      // Create left image (Desktop left / Mobile top)
      leftImageComponent = await createComponent("SlotFlex", {
        className: `w-full my-auto ${data.props.styles.mobileImagePosition === "bottom" ? "hidden sm:block" : ""} ${data.props.styles.desktopImagePosition === "right" ? "sm:hidden" : ""}`,
        items: [imageComponent],
      });

      // Create right image (Desktop right / Mobile bottom)
      rightImageComponent = await createComponent("SlotFlex", {
        className: `w-full my-auto ${data.props.styles.mobileImagePosition === "top" ? "hidden sm:block" : ""} ${data.props.styles.desktopImagePosition === "left" ? "sm:hidden" : ""}`,
        items: [imageComponent],
      });
    }

    // Main layout container
    const mainLayout = await createComponent("SlotFlex", {
      className: "flex flex-col sm:flex-row gap-6 md:gap-10",
      items: [
        ...(leftImageComponent ? [leftImageComponent] : []),
        heroContent,
        ...(rightImageComponent ? [rightImageComponent] : []),
      ],
    });

    children.push(mainLayout);

    return {
      ...data,
      props: {
        ...data.props,
        children,
      },
    };
  },
  render: ({ children, styles, puck, id }) => (
    <SlottedPageSection
      background={styles.backgroundColor}
      puck={puck}
      id={id}
      className="flex flex-col sm:flex-row gap-6 md:gap-10"
    >
      {children}
    </SlottedPageSection>
  ),
};
