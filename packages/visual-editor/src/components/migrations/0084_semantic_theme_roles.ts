import type { Migration } from "../../utils/migrate.ts";

// Freeze the original role mapping so future component changes cannot alter saved-layout migrations.
const headingLevelToTypographyRole = (level?: number) =>
  level === 1 ? "headline" : level === 2 ? "section-title" : "card-title";

const renameRole = (role: string | undefined): string | undefined => {
  if (role === "lead") {
    return "eyebrow";
  }
  if (role === "fine-print") {
    return "body-small";
  }
  return role;
};

const bodyRole = (variant: string): string => {
  if (variant === "xs" || variant === "sm") {
    return "body-small";
  }
  if (variant === "lg") {
    return "body-large";
  }
  return "body";
};

// Include nested slot props and locator card settings, but never rewrite bound
// entity data or authored constant content. The migration is idempotent.
const migratePresentation = (value: any, key = ""): any => {
  if (Array.isArray(value)) {
    return value.map((item) => migratePresentation(item, key));
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const result = Object.fromEntries(
    Object.entries(value).map(([childKey, child]) => [
      childKey,
      [
        "data",
        "constantValue",
        "trueDisplayText",
        "falseDisplayText",
        "parentData",
      ].includes(childKey)
        ? child
        : migratePresentation(child, childKey),
    ])
  );
  if (typeof result.typographyRole === "string") {
    result.typographyRole = renameRole(result.typographyRole);
  }
  const variant =
    result.bodyVariant ??
    (["secondaryHeading", "tertiaryHeading"].includes(key)
      ? result.variant
      : undefined);
  if (
    typeof variant === "string" &&
    ["xs", "sm", "base", "lg"].includes(variant)
  ) {
    // An explicitly selected non-body role takes priority over the old offset.
    if (!result.typographyRole || result.typographyRole === "body") {
      result.typographyRole = bodyRole(variant);
    }
    delete result.bodyVariant;
    if (["secondaryHeading", "tertiaryHeading"].includes(key)) {
      delete result.variant;
    }
  }
  return result;
};

const headingStyles = (
  styles: Record<string, any> = {},
  level = 2,
  tag?: "p"
) => ({
  ...styles,
  typographyRole:
    styles.typographyRole ?? headingLevelToTypographyRole(styles.level ?? 2),
  level,
  semanticLevelOverride: tag,
});

const placeSlot = (slot: any[], level: number, tag?: "p") =>
  slot?.map((item) =>
    item.type === "HeadingTextSlot" || item.type === "HeadingText"
      ? {
          ...item,
          props: {
            ...item.props,
            styles: headingStyles(item.props.styles, level, tag),
          },
        }
      : item
  );

/** Preserve every explicit color/typography override and all content/identity data.
 * Role adoption is independent of placement-owned HTML hierarchy.
 */
export const semanticThemeRoles: Migration = {
  Directory: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      slots: {
        ...props.slots,
        TitleSlot: placeSlot(props.slots?.TitleSlot, 1),
        SiteNameSlot: placeSlot(props.slots?.SiteNameSlot, 2, "p"),
      },
    }),
  },
  DirectoryCard: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      slots: {
        ...props.slots,
        HeadingSlot: placeSlot(props.slots?.HeadingSlot, 2),
      },
    }),
  },
  HeadingText: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      styles: headingStyles(
        props.styles,
        props.styles?.typographyRole ? (props.styles.level ?? 2) : 2,
        props.styles?.semanticLevelOverride === "p" ? "p" : undefined
      ),
    }),
  },
  HeadingTextSlot: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      styles: headingStyles(
        props.styles,
        props.styles?.typographyRole ? (props.styles.level ?? 2) : 2,
        props.styles?.semanticLevelOverride === "p" ? "p" : undefined
      ),
    }),
  },
  Locator: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      resultCard: props.resultCard?.map((card: any) => ({
        ...card,
        props: {
          ...card.props,
          primaryHeading: {
            ...card.props?.primaryHeading,
            typographyRole:
              card.props?.primaryHeading?.typographyRole ??
              headingLevelToTypographyRole(
                card.props?.primaryHeading?.headingLevel ?? 3
              ),
            headingLevel: 2,
          },
        },
      })),
    }),
  },
  "*": {
    action: "updated",
    propTransformation: (props) => migratePresentation(props),
  },
};
