import type { Migration } from "../../utils/migrate.ts";

/** Only this conversion understands palette tokens and fixed typography/action roles. */
export const migrateDynamicThemeSelections = (
  value: any,
  inheritedDark = false
): any => {
  if (Array.isArray(value)) {
    return value.map((child) =>
      migrateDynamicThemeSelections(child, inheritedDark)
    );
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  if (typeof value.selectedColor === "string") {
    const token = value.selectedColor;
    const palette =
      /^palette-(primary|secondary|tertiary|quaternary)(?:-(light|dark|contrast))?$/.exec(
        token
      );
    if (palette) {
      return {
        colorId: `main-${palette[1]}${palette[2] && palette[2] !== "contrast" ? `-${palette[2]}` : ""}`,
        channel: palette[2] === "contrast" ? "foreground" : "background",
        ...(value.contrastingColor?.startsWith("[")
          ? {
              contrastingColor: value.contrastingColor,
              isDarkColor: value.isDarkColor,
            }
          : {}),
      };
    }
    if (token === "white" || token === "black") {
      return { colorId: `main-${token}`, channel: "background" };
    }
    // Component-authored literals and contrast overrides retain their original values.
    return { ...value };
  }
  const background =
    value.styles?.backgroundColor ??
    value.props?.styles?.backgroundColor ??
    value.backgroundColor;
  const dark = background
    ? background.isDarkColor === true || background.contrastingColor === "white"
    : inheritedDark;
  const result = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      migrateDynamicThemeSelections(child, dark),
    ])
  );
  if (
    typeof value.type === "string" &&
    result.props?.styles &&
    /^(?:Breadcrumbs|Phone|Image|Directory|DirectoryCard|DirectoryWrapper|DirectoryGrid)(?:Slot)?$/.test(
      value.type
    ) &&
    !result.props.styles.actionId
  ) {
    result.props.styles.actionId = `main-${value.type.startsWith("Directory") && value.type !== "DirectoryCard" ? "directoryLink" : "link"}${dark ? "-inverse" : ""}`;
  }
  if (
    typeof value.type === "string" &&
    /^LocatorResultCard(?:Slot)?$/.test(value.type)
  ) {
    for (const key of ["address", "phone", "email"]) {
      if (result.props?.[key] && !result.props[key].actionId) {
        result.props[key].actionId = `main-link${dark ? "-inverse" : ""}`;
      }
    }
  }
  if (value.primaryHeading && value.phone && value.email && value.address) {
    for (const key of ["address", "phone", "email"]) {
      result[key].actionId ??= `main-link${dark ? "-inverse" : ""}`;
    }
  }
  if (value.pageHeading && typeof value.pageHeading === "object") {
    result.pageHeading.typographyId ??= "main-h1";
  }
  if (
    typeof value.type === "string" &&
    /^Locator(?:Slot)?$/.test(value.type) &&
    result.props
  ) {
    result.props.pageHeading = {
      ...result.props.pageHeading,
      typographyId: result.props.pageHeading?.typographyId ?? "main-h1",
    };
  }
  const level = value.level ?? value.headingLevel;
  if (
    Number.isInteger(level) &&
    level >= 1 &&
    level <= 6 &&
    !value.typographyId
  ) {
    result.typographyId = `main-h${level}`;
  }
  if (
    [
      "primary",
      "secondary",
      "link",
      "directoryLink",
      "headerFooterMainLink",
      "headerFooterSecondaryLink",
    ].includes(value.variant) &&
    !value.actionId
  ) {
    result.actionId = `main-${value.variant}${inheritedDark && value.variant !== "primary" ? "-inverse" : ""}`;
    delete result.variant;
  }
  if (
    ["xs", "sm", "base", "lg"].includes(value.variant ?? value.bodyVariant) &&
    !value.typographyId
  ) {
    const variant = value.variant ?? value.bodyVariant;
    result.typographyId =
      variant === "base" ? "main-body" : `main-body-${variant}`;
  }
  if (value.ctaVariant && !value.actionId) {
    result.actionId = `main-${value.ctaVariant}${inheritedDark && value.ctaVariant !== "primary" ? "-inverse" : ""}`;
    delete result.ctaVariant;
  }
  if (value.fontOptions && !value.fontOptions.typographyId) {
    result.fontOptions.typographyId = "main-body";
  }
  return result;
};

export const dynamicThemeMigration: Migration = {
  content: {
    transformation: (content) => migrateDynamicThemeSelections(content),
  },
  "*": {
    action: "updated",
    propTransformation: (props) => migrateDynamicThemeSelections(props),
  },
};
