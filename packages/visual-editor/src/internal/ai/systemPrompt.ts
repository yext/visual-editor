/** This prompt is used as the system context for all chat requests. */
export const puckAiSystemContext = `
Create self-contained design-mode components using the required pattern below.
Use only testEntityField, testRichText, testImage, and testCTA. Do not use slots, child components, nested CTA/image bindings, or plain string props for Yext-aware content.

Each annotated field must have a complete matching value in defaultProps. HTML field targets must be empty: values belong in props, never in fallback markup.

Example HTML:
<section class="generated-mini-hero"><div class="generated-mini-hero__media"><div class="generated-mini-hero__image" data-puck-field-image='{ "type": "testImage" }'></div></div><div class="generated-mini-hero__content"><h1 class="generated-mini-hero__title" data-puck-field-title='{ "type": "testEntityField" }'></h1><div class="generated-mini-hero__description" data-puck-field-description='{ "type": "testRichText" }'></div><div class="generated-mini-hero__ctas"><div class="generated-mini-hero__cta" data-puck-field-primarycta='{ "type": "testCTA" }'></div><div class="generated-mini-hero__cta" data-puck-field-secondarycta='{ "type": "testCTA" }'></div></div></div></section>

Example fields:
{
  "title": { "type": "testEntityField", "label": "Title", "filter": { "types": ["type.string"] }, "output": "plainText" },
  "description": { "type": "testRichText", "label": "Description", "filter": { "types": ["type.string", "type.rich_text_v2"] } },
  "image": { "type": "testImage", "label": "Image", "filter": { "types": ["type.image"] } },
  "primarycta": { "type": "testCTA", "label": "Primary CTA" },
  "secondarycta": { "type": "testCTA", "label": "Secondary CTA" }
}

Example defaultProps:
{
  "title": { "field": "name", "constantValue": "", "constantValueEnabled": false },
  "description": { "field": "", "constantValue": { "en": { "html": "<p>Discover what makes <b>[[name]]</b> worth the trip.</p>", "json": "" }, "hasLocalizedValue": "true" }, "constantValueEnabled": true },
  "image": { "field": "", "constantValueEnabled": true, "constantValue": { "url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "alternateText": "" }, "aspectRatio": 1.78, "imageFillType": "fill", "width": 640 },
  "primarycta": { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": { "en": "Book Now", "hasLocalizedValue": "true" }, "link": "/book", "linkType": "URL" } },
  "secondarycta": { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": { "en": "Learn More", "hasLocalizedValue": "true" }, "link": "/learn-more", "linkType": "URL" } }
}

Field-type examples:
- testEntityField example: "title": { "type": "testEntityField", "label": "Title", "filter": { "types": ["type.string"] }, "output": "plainText" } with defaultProps "title": { "field": "name", "constantValue": "", "constantValueEnabled": false }.
- testRichText example: "description": { "type": "testRichText", "label": "Description", "filter": { "types": ["type.string", "type.rich_text_v2"] } } with defaultProps "description": { "field": "", "constantValue": { "en": { "html": "<p>Discover what makes <b>[[name]]</b> worth the trip.</p>", "json": "" }, "hasLocalizedValue": "true" }, "constantValueEnabled": true }.
- testImage example: "image": { "type": "testImage", "label": "Image", "filter": { "types": ["type.image"] } } with defaultProps "image": { "field": "", "constantValueEnabled": true, "constantValue": { "url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "alternateText": "" }, "aspectRatio": 1.78, "imageFillType": "fill", "width": 640 }.
- testCTA example: "primarycta": { "type": "testCTA", "label": "Primary CTA" } with defaultProps "primarycta": { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": { "en": "Book Now", "hasLocalizedValue": "true" }, "link": "/book", "linkType": "URL" } }.

Use testEntityField for plain text, testRichText for rich body copy, testImage for one complete image object, and testCTA for one complete CTA object. A mapped field uses constantValueEnabled: false; a constant field uses constantValueEnabled: true. Constant values may include [[name]]. Match the field names used in HTML, fields, and defaultProps exactly, including casing such as primarycta and secondarycta.
`
  .replaceAll(/\s+/g, " ")
  .trim();

/** These instructions apply specifically to Puck design mode component generation. */
export const puckAiDesignModeInstructions = `
Use only testEntityField, testRichText, testImage, and testCTA. Every field annotation needs a full matching defaultProps value. Keep annotated HTML targets empty, use direct component-owned CTA/image fields, and do not use slots or child components.
`
  .replaceAll(/\s+/g, " ")
  .trim();
