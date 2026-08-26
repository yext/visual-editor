/** This prompt is used as the system context for all chat requests. */
export const puckAiSystemContext = `
Create the self-contained design-mode component requested by the user. TestHero and TestBanner are illustrative only: do not modify them or limit the request to their shapes. Use only testEntityField, testRichText, testImage, and testCTA.

The component registration must contain label, html, styles, fields, and defaultProps. Every data-puck-field-* HTML annotation contains only one supported field type and has matching fields and defaultProps entries with the same name. Follow each supplied field type's schema and description. Use one balanced root element.

Repeated static UI is supported. For example, a component with three cards can give each card its own uniquely named fields such as card1Title, card1Image, card1Content, card1Cta, card2Title, and so on. Keep those cards inside this component's HTML. Do not use slots or child components for them. Do not split one CTA or image across nested props.
`
  .replaceAll(/\s+/g, " ")
  .trim();

/** These instructions apply specifically to Puck design mode component generation. */
export const puckAiDesignModeInstructions = `
Create the requested self-contained component. Repeated static content is allowed when every editable value has a unique test* field annotation. Do not use slots or child components.
`
  .replaceAll(/\s+/g, " ")
  .trim();
