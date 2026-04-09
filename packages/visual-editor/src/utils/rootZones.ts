import { Data } from "@puckeditor/core";

export const ROOT_HEADER_ZONE = "header-zone";
export const ROOT_MAIN_ZONE = "main-zone";
export const ROOT_FOOTER_ZONE = "footer-zone";

export const ROOT_HEADER_ZONE_KEY = `root:${ROOT_HEADER_ZONE}`;
export const ROOT_MAIN_ZONE_KEY = `root:${ROOT_MAIN_ZONE}`;
export const ROOT_FOOTER_ZONE_KEY = `root:${ROOT_FOOTER_ZONE}`;

export const ROOT_HEADER_COMPONENTS = [
  "ExpandedHeader",
  "Header",
  "CustomCodeSection",
] as const;

export const ROOT_MAIN_DISALLOWED_COMPONENTS = [
  "ExpandedHeader",
  "Header",
  "ExpandedFooter",
  "Footer",
] as const;

export const ROOT_FOOTER_COMPONENTS = [
  "ExpandedFooter",
  "Footer",
  "CustomCodeSection",
] as const;

const headerComponents = new Set<string>(ROOT_HEADER_COMPONENTS);
const footerComponents = new Set<string>(ROOT_FOOTER_COMPONENTS);

export const splitRootContentIntoZones = (content: Data["content"] = []) => {
  let headerCount = 0;
  while (
    headerCount < content.length &&
    headerComponents.has(content[headerCount]?.type)
  ) {
    headerCount += 1;
  }

  let footerStart = content.length;
  while (
    footerStart > headerCount &&
    footerComponents.has(content[footerStart - 1]?.type)
  ) {
    footerStart -= 1;
  }

  return {
    headerContent: content.slice(0, headerCount),
    mainContent: content.slice(headerCount, footerStart),
    footerContent: content.slice(footerStart),
  };
};

export const applyRootZonesToData = (data: Data): Data => {
  const { headerContent, mainContent, footerContent } =
    splitRootContentIntoZones(data.content);

  const otherZones = Object.fromEntries(
    Object.entries(data.zones ?? {}).filter(
      ([zoneKey]) =>
        zoneKey !== ROOT_HEADER_ZONE_KEY &&
        zoneKey !== ROOT_MAIN_ZONE_KEY &&
        zoneKey !== ROOT_FOOTER_ZONE_KEY
    )
  );

  return {
    ...data,
    content: [],
    zones: {
      ...otherZones,
      [ROOT_HEADER_ZONE_KEY]: headerContent,
      [ROOT_MAIN_ZONE_KEY]: mainContent,
      [ROOT_FOOTER_ZONE_KEY]: footerContent,
    },
  };
};
