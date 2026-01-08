import { Migration } from "../../utils/migrate.ts";

export const updateLinksAlignmentMigration: Migration = {
  ExpandedFooter: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const primaryFooter = styles?.primaryFooter;
      if (!primaryFooter) {
        return { ...props, styles };
      }

      const { linksAlignment, ...restPrimaryFooter } = primaryFooter;

      return {
        ...props,
        styles: {
          ...styles,
          primaryFooter: {
            ...restPrimaryFooter,
            linksPosition:
              primaryFooter.linksPosition ?? linksAlignment ?? "right",
          },
        },
      };
    },
  },

  SecondaryFooterSlot: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      if (!styles) {
        return { ...props, styles };
      }

      const { linksAlignment, ...restStyles } = styles;

      return {
        ...props,
        styles: {
          ...restStyles,
          linksPosition: styles.linksPosition ?? linksAlignment ?? "left",
        },
      };
    },
  },
};
