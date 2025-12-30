import { Migration } from "../../utils/migrate.ts";

export const updateLinksAlignmentMigration: Migration = {
  ExpandedFooter: {
    action: "updated",
    propTransformation: ({ styles, ...props }) => {
      const primaryFooter = styles?.primaryFooter;
      if (!primaryFooter) {
        return { ...props, styles };
      }

      if (primaryFooter.linksPosition && !("linksAlignment" in primaryFooter)) {
        return { ...props, styles };
      }

      return {
        ...props,
        styles: {
          ...styles,
          primaryFooter: {
            ...primaryFooter,
            linksPosition:
              primaryFooter.linksPosition ??
              primaryFooter.linksAlignment ??
              "right",
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

      if (styles.linksPosition && !("linksAlignment" in styles)) {
        return { ...props, styles };
      }

      return {
        ...props,
        styles: {
          ...styles,
          linksPosition:
            styles.linksPosition ?? styles.linksAlignment ?? "left",
        },
      };
    },
  },
};
