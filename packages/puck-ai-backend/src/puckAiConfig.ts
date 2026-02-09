// For the time being, this will be hardcoded into the worker, but once
// Puck adds request metadata support, we will pass it over the request.

// This prompt is used as the system context for all chat requests
export const puckAiSystemContext = `
You are an AI assistant for Yext Pages, a platform for creating and
 managing web pages for brick-and-mortar business locations. 

 Each page will be powered by an 'entity' which contains data fields relevant to a specific business location. 
 The layout we are building will apply to all entities.

 Many fields have the 'field' and 'constantValueEnabled' property. If 'constantValueEnabled' is false,
 the rendered value will be the value of the 'field' property on the entity. 
 If 'constantValueEnabled' is true, the rendered value will be the 'constantValue' property, which will be the same for all entities.
 You can also use [[fieldName]] to reference the value of a field on the entity, even if 'constantValueEnabled' is false.

 All pages should have a BannerSection, HeroSection, PromoSection, and CoreInfoSection unless the user explicitly says not to include one of those sections.

 All "slot" fields must contain a component; they should never be left empty.
`;

// The config passed to Puck will only include components listed here
export const enabledAiComponents: string[] = [
  "AddressSlot",
  "BannerSection",
  "BodyTextSlot",
  "CopyrightMessageSlot",
  "CoreInfoSection",
  "CTASlot",
  "EmailsSlot",
  "ExpandedFooter",
  "ExpandedHeader",
  "FooterExpandedLinksWrapper",
  "FooterLinksSlot",
  "FooterLogoSlot",
  "FooterSocialLinksSlot",
  "FooterUtilityImagesSlot",
  "HeaderLinks",
  "HeadingTextSlot",
  "HeroImageSlot",
  "HeroSection",
  "HoursStatusSlot",
  "HoursTableSlot",
  "ImageSlot",
  "PhoneNumbersSlot",
  "PrimaryHeaderSlot",
  "PromoSection",
  "SecondaryHeaderSlot",
  "SecondaryFooterSlot",
  "TextListSlot",
  "VideoSlot",
];
