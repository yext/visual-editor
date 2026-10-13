import { StreamDocument } from "../types/StreamDocument.ts";
import { resolveBreadcrumbs } from "../urls/resolveBreadcrumbs.ts";
import { TemplateRenderProps } from "./getSchema.ts";

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

  const breadcrumbs = resolveBreadcrumbs(data.document);

  if (!breadcrumbs.length) {
    // If dm_root, return a single breadcrumb item for the current page
    if (data.document.meta?.entityType?.id === "dm_root") {
      return {
        "@type": "BreadcrumbList",
        "@context": "https://schema.org",
        "@id": data.document.siteDomain
          ? `https://${data.document.siteDomain}/#${data.document.uid}-breadcrumbs`
          : `#${data.document.uid}-breadcrumbs`,
        itemListElement: [
          fillBreadcrumbsItem(1, data.document.name, currentPageUrl),
        ],
      };
    }
    // If no parents, do not return breadcrumbs
    return undefined;
  }

  const breadcrumbItems = breadcrumbs
    .filter((breadcrumb) => breadcrumb.name)
    .map((breadcrumb, index) => {
      const url = breadcrumb.slug
        ? data.document.siteDomain
          ? `https://${data.document.siteDomain}/${breadcrumb.slug.replace(/^\/+/, "")}`
          : `/${breadcrumb.slug.replace(/^\/+/, "")}`
        : currentPageUrl;

      return fillBreadcrumbsItem(index + 1, breadcrumb.name, url);
    });

  return {
    "@type": "BreadcrumbList",
    "@context": "https://schema.org",
    "@id": data.document.siteDomain
      ? `https://${data.document.siteDomain}/#${data.document.uid}-breadcrumbs`
      : `#${data.document.uid}-breadcrumbs`,
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
        "@id": document.siteDomain
          ? `https://${document.siteDomain}/#${document.uid}-aggregaterating`
          : `#${document.uid}-aggregaterating`,
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
