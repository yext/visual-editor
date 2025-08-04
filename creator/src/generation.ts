import {
  BannerSection,
  BreadcrumbsSection,
  CoreInfoSection,
  EventSection,
  FAQSection,
  HeroSection,
  InsightSection,
  NearbyLocationsSection,
  PhotoGallerySection,
  ProductSection,
  PromoSection,
  ReviewsSection,
  StaticMapSection,
  TeamSection,
  TestimonialSection,
  ExpandedHeader,
  ExpandedFooter,
  Directory,
  LocatorComponent,
} from "@yext/visual-editor";
import { AnalyzedComponent } from "./analysis.ts";

/**
 * A database of component schemas for use in generation.
 */
const componentSchemas: { [key: string]: any } = {
  BannerSection: BannerSection,
  BreadcrumbsSection: BreadcrumbsSection,
  CoreInfoSection: CoreInfoSection,
  EventSection: EventSection,
  FAQSection: FAQSection,
  HeroSection: HeroSection,
  InsightSection: InsightSection,
  NearbyLocationsSection: NearbyLocationsSection,
  PhotoGallerySection: PhotoGallerySection,
  ProductSection: ProductSection,
  PromoSection: PromoSection,
  ReviewsSection: ReviewsSection,
  StaticMapSection: StaticMapSection,
  TeamSection: TeamSection,
  TestimonialSection: TestimonialSection,
  ExpandedHeader: ExpandedHeader,
  ExpandedFooter: ExpandedFooter,
  Directory: Directory,
  Locator: LocatorComponent,
};

/**
 * Performs a deep merge of two objects.
 * @param target The target object to merge into.
 * @param source The source object to merge from.
 * @returns The deeply merged object.
 */
function mergeObjects(target: any, source: any): any {
  if (
    typeof target !== "object" ||
    target === null ||
    typeof source !== "object" ||
    source === null
  ) {
    return source;
  }

  const output = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        target.hasOwnProperty(key)
      ) {
        output[key] = mergeObjects(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
  }

  return output;
}

/**
 * Generates the final layoutData JSON from the analyzed components.
 * @param analyzedComponents The list of components and their data from the analysis step.
 * @returns The complete layoutData JSON object.
 */
export function generateLayout(analyzedComponents: AnalyzedComponent[]): any {
  const layoutData = {
    root: {
      props: {
        title: {
          field: "name",
          constantValue: "",
          constantValueEnabled: false,
        },
        version: 7,
        description: {
          field: "description",
          constantValue: "",
          constantValueEnabled: false,
        },
      },
    },
    zones: {},
    content: [] as any[],
  };

  for (const analyzedComponent of analyzedComponents) {
    const schema = componentSchemas[analyzedComponent.type];
    if (schema) {
      // Correctly access the nested data and styles from the AI's response
      const mergedData = mergeObjects(
        schema.defaultProps.data,
        analyzedComponent.props.data,
      );
      const mergedStyles = mergeObjects(
        schema.defaultProps.styles,
        analyzedComponent.props.styles,
      );

      const component = {
        type: analyzedComponent.type,
        props: {
          ...schema.defaultProps,
          data: mergedData,
          styles: mergedStyles,
        },
      };
      layoutData.content.push(component);
    }
  }

  return layoutData;
}
