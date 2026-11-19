import type { Migration, MigrationAction } from "../../utils/migrate.ts";

const preserveHeadingTag: MigrationAction = {
  action: "updated",
  propTransformation: (props, _streamDocument, beforeSemanticRoles) => {
    const previousStyles = beforeSemanticRoles?.styles;
    if (!previousStyles) {
      return props;
    }

    return {
      ...props,
      styles: {
        ...props.styles,
        level: previousStyles.level ?? props.styles.level,
        semanticLevelOverride: previousStyles.semanticLevelOverride,
      },
    };
  },
};

export const preserveHeadingTags: Migration = {
  HeadingText: preserveHeadingTag,
  HeadingTextSlot: preserveHeadingTag,
};
