export const supportedPageSetTypes = [
  "ENTITY",
  "DIRECTORY",
  "LOCATOR",
] as const;

export type PageSetType = (typeof supportedPageSetTypes)[number];

export type SectionConfig = {
  id: string;
  displayName: string;
  description: string;
  pageSetTypes: PageSetType[];
  category?: string;
};
