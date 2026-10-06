import type { StreamDocument } from "../types/StreamDocument.ts";
import { LOCAL_BUSINESS_ENTITY_TYPES } from "./defaultSchemas.ts";

const pageHeader = (
  type: string,
  anchor: string
) => `  "@context": "https://schema.org",
  "@type": "${type}",
  "url": "{{#if siteDomain}}https://{{siteDomain}}{{/if}}/{{path}}"{{#unless (eq (json uid) "null")}},
  "@id": "{{#if siteDomain}}https://{{siteDomain}}/{{/if}}#{{uid}}-${anchor}"{{/unless}}{{#if name}},
  "name": {{json name}}{{/if}}`;

const address = (
  indent = "  "
) => `{{#if address}}{{#with (AddressSchema address)}}{{#if address}},
${indent}"address": {{json address}}{{/if}}{{/with}}{{/if}}`;
const hours = (
  indent = "  "
) => `{{#if hours}}{{#with (OpeningHoursSpecificationSchema hours)}}{{#if openingHoursSpecification}},
${indent}"openingHoursSpecification": {{json openingHoursSpecification}}{{/if}}{{/with}}{{/if}}`;
const description = `{{#if description}},
  "description": {{json description}}{{/if}}`;

const localBusiness = `<script type="application/ld+json">
{
${pageHeader("{{businessType}}", "{{businessType}}")}${address()}${hours()}{{#if photoGallery}}{{#with (PhotoGallerySchema photoGallery)}}{{#if image}},
  "image": {{json image}}{{/if}}{{/with}}{{/if}}${description}{{#if mainPhone}},
  "telephone": {{json mainPhone}}{{/if}}{{#if paymentOptions}},
  "paymentAccepted": {{json paymentOptions}}{{/if}}{{#if services}},
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [{{#each services}}
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": {{json this}}
        }
      }{{#unless @last}},{{/unless}}{{/each}}
    ]
  }{{/if}}
}
</script>`;

const directory = `<script type="application/ld+json">
{
${pageHeader("CollectionPage", "collectionpage")}{{#if dm_directoryChildren}},
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [{{#each dm_directoryChildren}}
      {
        "@type": "Thing",
        "name": {{json name}},
        "url": {{json (directoryChildUrl this @root)}}${address("        ")}${hours("        ")}{{#if mainPhone}},
        "phone": {{json mainPhone}}{{/if}}
      }{{#unless @last}},{{/unless}}{{/each}}
    ]
  }{{/if}}
}
</script>`;

const locator = `<script type="application/ld+json">
{
${pageHeader("WebPage", "webpage")}
}
</script>`;

const fallback = `<script type="application/ld+json">
{
${pageHeader("Thing", "thing")}${description}
}
</script>`;

/** Complete editable markup, selected using the same entity types as Recommended. */
export const getCustomSchemaTemplate = (
  streamDocument: StreamDocument
): string => {
  const entityTypeId = streamDocument.meta?.entityType?.id;
  if (entityTypeId && LOCAL_BUSINESS_ENTITY_TYPES.includes(entityTypeId)) {
    return localBusiness;
  }
  if (entityTypeId?.startsWith("dm_")) return directory;
  if (entityTypeId === "locator") return locator;
  return fallback;
};
