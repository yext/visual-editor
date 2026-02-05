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
