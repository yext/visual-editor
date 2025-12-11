import { StreamDocument } from "../applyTheme";
import { TemplateRenderProps } from "./getSchema";
import { getDirectoryParents } from "./helpers";

export const getBreadcrumbsSchema = (
  data: TemplateRenderProps,
  currentPageUrl: string
): Record<string, any> | undefined => {
  // Helper to create a ListItem object
  const fillBreadcrumbsItem = (
    position: number,
    name: string,
    url: string
  ) => ({
    "@type": "ListItem",
    position,
    name,
    item: url,
  });

  const directoryParents = getDirectoryParents(data.document);

  if (!directoryParents?.length) {
    // If dm_root, return a single breadcrumb item for the current page
    if (data.document.meta?.entityType?.id === "dm_root") {
      return {
        "@type": "BreadcrumbList",
        "@context": "https://schema.org",
        "@id": `https://${data.document.siteDomain}/${data.document.uid}#breadcrumbs`,
        itemListElement: [
          fillBreadcrumbsItem(1, data.document.name, currentPageUrl),
        ],
      };
    }
    // If no parents, do not return breadcrumbs
    return undefined;
  }

  // Create the breadcrumbs for the directory parents
  const breadcrumbItems = directoryParents.map((parent, index) =>
    fillBreadcrumbsItem(
      index + 1,
      parent.name,
      `https://${data.document.siteDomain}/${parent.slug}`
    )
  );

  // Add the current page as the last breadcrumb item
  if (data.document?.name) {
    breadcrumbItems.push(
      fillBreadcrumbsItem(
        breadcrumbItems.length + 1,
        data.document.name,
        currentPageUrl
      )
    );
  }

  return {
    "@type": "BreadcrumbList",
    "@context": "https://schema.org",
    "@id": `https://${data.document.siteDomain}/${data.document.uid}#breadcrumbs`,
    itemListElement: breadcrumbItems,
  };
};

/**
 * If reviews are present in the stream, return a AggregateRating object that is
 * connected to the main page schema block via the '@id' property.
 */
export const getAggregateRatingSchemaBlock = (
  document: StreamDocument,
  /** The resolved id of the main schema block */
  pageId: string
): Record<string, any> | undefined => {
  const reviewsAgg = document.ref_reviewsAgg as
    | Array<{
        publisher?: string;
        averageRating?: number;
        reviewCount?: number;
      }>
    | undefined;

  if (!reviewsAgg || !Array.isArray(reviewsAgg) || reviewsAgg.length === 0) {
    return;
  }

  for (const review of reviewsAgg) {
    if (
      review.publisher === "FIRSTPARTY" &&
      review.averageRating !== undefined &&
      review.reviewCount !== undefined
    ) {
      // there should be at most one "FIRSTPARTY" so return early when found
      return {
        "@type": "AggregateRating",
        "@id": `https://${document.siteDomain}/${document.uid}#aggregaterating`,
        ratingValue: review.averageRating.toString(),
        reviewCount: review.reviewCount.toString(),
        itemReviewed: {
          "@id": pageId,
        },
      };
    }
  }

  return;
};
