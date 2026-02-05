import { Migration } from "../../utils/migrate.ts";

export const addShowHideOptions: Migration = {
  AboutSection: {
    action: "updated",
    propTransformation: (props) => {
      const showDetailsColumn = props.data?.showDetailsColumn;
      delete props.data;
      return {
        ...props,
        styles: {
          ...props.styles,
          showDetailsColumn: showDetailsColumn ?? true,
        },
      };
    },
  },
  EventSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
        slots: {
          ...props.slots,
          CardsWrapperSlot: props.slots.CardsWrapperSlot?.map(
            (cardWrapper: any) => ({
              ...cardWrapper,
              props: {
                ...cardWrapper.props,
                styles: {
                  ...cardWrapper.props.styles,
                  showImage: true,
                  showDateTime: true,
                  showDescription: true,
                  showCTA: true,
                },
              },
            })
          ),
        },
      };
    },
  },
  FAQsSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
      };
    },
  },
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showBusinessName: true,
          showGeomodifier: true,
          showHoursStatus: true,
          showAverageReview: true,
          showPrimaryCTA: true,
          showSecondaryCTA: true,
        },
      };
    },
  },
  InsightSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
        slots: {
          ...props.slots,
          CardsWrapperSlot: props.slots.CardsWrapperSlot?.map(
            (cardWrapper: any) => ({
              ...cardWrapper,
              props: {
                ...cardWrapper.props,
                styles: {
                  ...cardWrapper.props.styles,
                  showImage: true,
                  showCategory: true,
                  showPublishTime: true,
                  showDescription: true,
                  showCTA: true,
                },
              },
            })
          ),
        },
      };
    },
  },
  NearbyLocationsSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
        slots: {
          ...props.slots,
          CardsWrapperSlot: props.slots.CardsWrapperSlot?.map(
            (cardWrapper: any) => ({
              ...cardWrapper,
              props: {
                ...cardWrapper.props,
                styles: {
                  ...cardWrapper.props.styles,
                  showHours: true,
                  showPhone: true,
                  showAddress: true,
                },
              },
            })
          ),
        },
      };
    },
  },
  PhotoGallerySection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
      };
    },
  },
  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showMedia: true,
          showHeading: true,
          showDescription: true,
          showCTA: true,
        },
      };
    },
  },
  ProductSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          backgroundColor: props.styles.backgroundColor,
          cardVariant: props.styles.cardVariant,
          showSectionHeading: true,
        },
        slots: {
          ...props.slots,
          CardsWrapperSlot: props.slots.CardsWrapperSlot?.map(
            (cardWrapper: any) => ({
              ...cardWrapper,
              props: {
                ...cardWrapper.props,
                styles: {
                  ...cardWrapper.props.styles,
                  showImage: props.styles.showImage ?? true,
                  showBrow: props.styles.showBrow ?? true,
                  showTitle: props.styles.showTitle ?? true,
                  showPrice: props.styles.showPrice ?? true,
                  showDescription: props.styles.showDescription ?? true,
                  showCTA: props.styles.showCTA ?? true,
                },
              },
            })
          ),
        },
      };
    },
  },
  ReviewsSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
      };
    },
  },
  TeamSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
        slots: {
          ...props.slots,
          CardsWrapperSlot: props.slots.CardsWrapperSlot?.map(
            (cardWrapper: any) => ({
              ...cardWrapper,
              props: {
                ...cardWrapper.props,
                styles: {
                  ...cardWrapper.props.styles,
                  showImage: true,
                  showTitle: true,
                  showPhone: true,
                  showEmail: true,
                  showCTA: true,
                },
              },
            })
          ),
        },
      };
    },
  },
  TestimonialSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        styles: {
          ...props.styles,
          showSectionHeading: true,
        },
        slots: {
          ...props.slots,
          CardsWrapperSlot: props.slots.CardsWrapperSlot?.map(
            (cardWrapper: any) => ({
              ...cardWrapper,
              props: {
                ...cardWrapper.props,
                styles: {
                  ...cardWrapper.props.styles,
                  showName: true,
                  showDate: true,
                },
              },
            })
          ),
        },
      };
    },
  },
};
