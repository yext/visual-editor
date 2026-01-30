export const defaultLink = {
  linkType: "URL" as const,
  label: {
    en: "Footer Link",
    hasLocalizedValue: "true" as const,
  },
  link: "#",
  openInNewTab: false,
};

export const defaultLinks = [
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
  { ...defaultLink },
];
