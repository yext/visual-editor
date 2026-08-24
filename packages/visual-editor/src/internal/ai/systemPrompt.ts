/** This prompt is used as the system context for all chat requests. */
export const puckAiSystemContext = `
Create the new self-contained design-mode component requested by the user. The TestHero and TestBanner reference components in the config are illustrative only: do not limit the request to them, modify them, or claim that only preconfigured components are supported. Use only testEntityField, testRichText, testImage, and testCTA. Do not use slots, child components, nested CTA/image bindings, or plain string props for Yext-aware content.

Every generated component must use this complete registration contract. See this example for reference:
{
  "label": "Example Hero",
  "html": "<section class=\\"example-hero\\"><div class=\\"example-hero__media\\"><div class=\\"example-hero__image\\" data-puck-field-image='{ \\"type\\": \\"testImage\\" }'></div></div><div class=\\"example-hero__content\\"><h1 class=\\"example-hero__title\\" data-puck-field-title='{ \\"type\\": \\"testEntityField\\" }'></h1><div class=\\"example-hero__description\\" data-puck-field-description='{ \\"type\\": \\"testRichText\\" }'></div><div class=\\"example-hero__ctas\\"><div class=\\"example-hero__cta\\" data-puck-field-primarycta='{ \\"type\\": \\"testCTA\\" }'></div><div class=\\"example-hero__cta\\" data-puck-field-secondarycta='{ \\"type\\": \\"testCTA\\" }'></div></div></div></section>",
  "styles": ".example-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: clamp(1.5rem, 5vw, 4rem); align-items: center; padding: clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem); } .example-hero__media, .example-hero__image { min-height: 320px; } .example-hero__image, .example-hero__content, .example-hero__cta { display: flex; align-items: center; } .example-hero__content { flex-direction: column; align-items: flex-start; gap: 1.25rem; } .example-hero__ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; }",
  "fields": {
    "title": { "type": "testEntityField", "label": "Title", "filter": { "types": ["type.string"] }, "output": "plainText" },
    "description": { "type": "testRichText", "label": "Description", "filter": { "types": ["type.string", "type.rich_text_v2"] } },
    "image": { "type": "testImage", "label": "Image", "filter": { "types": ["type.image"] } },
    "primarycta": { "type": "testCTA", "label": "Primary CTA" },
    "secondarycta": { "type": "testCTA", "label": "Secondary CTA" }
  },
  "defaultProps": {
    "title": { "field": "name", "constantValue": "", "constantValueEnabled": false },
    "description": { "field": "", "constantValue": { "en": { "json": "", "html": "<p>Discover what makes <b>[[name]]</b> worth the trip.</p>" }, "hasLocalizedValue": "true" }, "constantValueEnabled": true },
    "image": { "field": "", "constantValueEnabled": true, "constantValue": { "url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "alternateText": "" }, "aspectRatio": 1.78, "imageFillType": "fill", "width": 640 },
    "primarycta": { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": { "en": "Book Now", "hasLocalizedValue": "true" }, "link": "/book", "linkType": "URL" } },
    "secondarycta": { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": { "en": "Learn More", "hasLocalizedValue": "true" }, "link": "/learn-more", "linkType": "URL" } }
  }
}

For each HTML annotation, use the matching complete fields/defaultProps pair below. The annotation target is always empty; labels, filters, and values never belong in the annotation.

Text: <h1 data-puck-field-title='{ "type": "testEntityField" }'></h1>, "fields": { "title": { "type": "testEntityField", "label": "Title", "filter": { "types": ["type.string"] }, "output": "plainText" } }, "defaultProps": { "title": { "field": "name", "constantValue": "", "constantValueEnabled": false } }.

Rich text: <div data-puck-field-description='{ "type": "testRichText" }'></div>, "fields": { "description": { "type": "testRichText", "label": "Description", "filter": { "types": ["type.string", "type.rich_text_v2"] } } }, "defaultProps": { "description": { "field": "", "constantValue": { "en": { "json": "", "html": "<p>Visit <b>[[name]]</b> today.</p>" }, "hasLocalizedValue": "true" }, "constantValueEnabled": true } }.

Image: <div data-puck-field-image='{ "type": "testImage" }'></div>, "fields": { "image": { "type": "testImage", "label": "Image", "filter": { "types": ["type.image"] } } }, "defaultProps": { "image": { "field": "", "constantValueEnabled": true, "constantValue": { "url": "https://example.com/image.jpg", "alternateText": "" }, "aspectRatio": 1.78, "imageFillType": "fill", "width": 640 } }.

CTA: <div data-puck-field-primarycta='{ "type": "testCTA" }'></div>, "fields": { "primarycta": { "type": "testCTA", "label": "Primary CTA" } }, "defaultProps": { "primarycta": { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": { "en": "Book Now", "hasLocalizedValue": "true" }, "link": "/book", "linkType": "URL" } } }.

The final registration must contain label, html, styles, fields, and defaultProps. Every annotation needs one matching fields entry and one matching defaultProps entry with the same field name. A default must never be empty: use a non-empty mapped field such as "name" with constantValueEnabled false, or a non-empty constant value with constantValueEnabled true. Use one balanced root element. Do not include slots, child components, or streaming.
`
  .replaceAll(/\s+/g, " ")
  .trim();

/** These instructions apply specifically to Puck design mode component generation. */
export const puckAiDesignModeInstructions = `
Create a new component requested by the user using the supplied contract and the TestHero and TestBanner references. Use only testEntityField, testRichText, testImage, and testCTA. Put annotation metadata in fields and authored Yext values in defaultProps. HTML annotations contain only the field type and their targets are empty. Use no slots, child components, nested bindings, or streaming registrations.
`
  .replaceAll(/\s+/g, " ")
  .trim();
