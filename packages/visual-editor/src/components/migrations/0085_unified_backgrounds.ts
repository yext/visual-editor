import type { Migration } from "../../utils/migrate.ts";
// Freeze this conversion so future field changes cannot alter saved-layout migrations.
const sectionDefaults: Record<string, string> = {
  BannerSection: "primary",
  HeroSection: "page",
  ProductSection: "muted",
  AboutSection: "muted",
  CoreInfoSection: "page",
  PromoSection: "page",
  ProfessionalHeroSection: "page",
  EventSection: "muted",
  InsightSection: "muted",
  TeamSection: "muted",
  TestimonialSection: "muted",
  NearbyLocationsSection: "page",
  FAQSection: "muted",
  ReviewsSection: "page",
  PhotoGallerySection: "page",
  VideoSection: "page",
  StaticMapSection: "page",
  FormSection: "page",
  Grid: "page",
  Directory: "page",
  DirectoryGrid: "page",
  BreadcrumbsSection: "page",
  BreadcrumbsSlot: "page",
  PrimaryHeaderSlot: "page",
  SecondaryHeaderSlot: "muted",
  SecondaryFooterSlot: "muted",
};
const nestedComponents = [
  "Phone",
  "PhoneSlot",
  "DirectoryCard",
  "ProductCard",
  "EventCard",
  "InsightCard",
  "TeamCard",
  "TestimonialCard",
  "NearbyLocationCardsWrapper",
  "NearbyLocationsCardsWrapper",
];

const consolidate = (
  value: Record<string, any>,
  fallback: string,
  allowInherit: boolean
) => {
  for (const [variantKey, colorKey] of [
    ["surface", "backgroundColor"],
    ["listSurface", "listBackgroundColor"],
  ]) {
    if (!Object.hasOwn(value, variantKey) && !Object.hasOwn(value, colorKey)) {
      continue;
    }
    const previous = value[colorKey];
    // Authored colors always took precedence over the semantic variant.
    const selected =
      previous != null &&
      !(typeof previous === "object" && previous.selectedColor === "default")
        ? previous
        : (value[variantKey] ?? fallback);
    value[colorKey] =
      selected === "inherit" && !allowInherit ? fallback : selected;
    delete value[variantKey];
  }
};

export const consolidateBackgroundProps = (
  type: string,
  original: Record<string, any>
) => {
  const props = structuredClone(original);
  const fallback =
    sectionDefaults[type] ??
    (type === "Phone" || type === "PhoneSlot" ? "muted" : "page");
  const allowInherit = !Object.hasOwn(sectionDefaults, type);
  if (type === "Grid") {
    consolidate(props, fallback, false);
  }
  if (props.styles) {
    if (
      (type === "Phone" || type === "PhoneSlot") &&
      props.styles.backgroundColor === undefined
    ) {
      const oldColor = props.styles.color;
      props.styles.backgroundColor =
        oldColor?.selectedColor && oldColor.selectedColor !== "default"
          ? oldColor
          : (props.styles.surface ?? "muted");
    }
    consolidate(props.styles, fallback, allowInherit);
    if (type === "ExpandedFooter" && props.styles.primaryFooter) {
      consolidate(props.styles.primaryFooter, "primary", false);
    }
  }
  return props;
};

export const unifiedBackgrounds: Migration = Object.fromEntries(
  [...Object.keys(sectionDefaults), ...nestedComponents, "ExpandedFooter"].map(
    (type) => [
      type,
      {
        action: "updated" as const,
        propTransformation: (props: { id: string } & Record<string, any>) =>
          consolidateBackgroundProps(type, props) as typeof props,
      },
    ]
  )
);
