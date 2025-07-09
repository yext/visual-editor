import { Migration } from "../../utils/migrate.ts";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";

export const addCardStylesMigration: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props) => ({
      styles: {
        cards: {
          backgroundColor: backgroundColors.background1.value,
          headingLevel: 3,
        },
      },
      ...props,
    }),
  },
  EventSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { cardBackgroundColor, heading, ...otherStyles } = styles || {};
      return {
        styles: {
          heading: heading,
          cards: {
            headingLevel: heading.level < 6 ? heading.level + 1 : 3,
            backgroundColor: cardBackgroundColor,
          },
          ...otherStyles,
        },
        ...props,
      };
    },
  },
  InsightSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { cardBackgroundColor, heading, ...otherStyles } = styles || {};
      return {
        styles: {
          heading: heading,
          cards: {
            headingLevel: heading.level < 6 ? heading.level + 1 : 3,
            backgroundColor: cardBackgroundColor,
          },
          ...otherStyles,
        },
        ...props,
      };
    },
  },
  NearbyLocationsSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { cardBackgroundColor, cardHeadingLevel, ...otherStyles } =
        styles || {};
      return {
        styles: {
          cards: {
            headingLevel: cardHeadingLevel,
            backgroundColor: cardBackgroundColor,
          },
          ...otherStyles,
        },
        ...props,
      };
    },
  },
  ProductSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { cardBackgroundColor, heading, ...otherStyles } = styles || {};
      return {
        styles: {
          heading: heading,
          cards: {
            headingLevel: heading.level < 6 ? heading.level + 1 : 3,
            backgroundColor: cardBackgroundColor,
          },
          ...otherStyles,
        },
        ...props,
      };
    },
  },
  TeamSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { cardBackgroundColor, heading, ...otherStyles } = styles || {};
      return {
        styles: {
          heading: heading,
          cards: {
            headingLevel: heading.level < 6 ? heading.level + 1 : 3,
            backgroundColor: cardBackgroundColor,
          },
          ...otherStyles,
        },
        ...props,
      };
    },
  },
  TestimonialSection: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const { cardBackgroundColor, heading, ...otherStyles } = styles || {};
      return {
        styles: {
          heading: heading,
          cards: {
            headingLevel: heading.level < 6 ? heading.level + 1 : 3,
            backgroundColor: cardBackgroundColor,
          },
          ...otherStyles,
        },
        ...props,
      };
    },
  },
};
