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

export type LibraryMetadata = {
  schemaVersion: 1;
  id: string;
  displayName: string;
  description: string;
};

export const verticals = [
  "HEALTHCARE",
  "FINANCIAL_SERVICES",
  "FOOD_AND_DINING",
  "RETAIL",
  "HOSPITALITY",
  "PROFESSIONAL_SERVICES",
] as const;

export type Vertical = (typeof verticals)[number];

export const purposes = ["LOCATION", "CITATION"] as const;

export type Purpose = (typeof purposes)[number];

export type EntityLayoutMetadata = {
  id: string;
  displayName: string;
  previewImageUrl: string;
  vertical?: Vertical[];
  purpose?: Purpose[];
  pageSetType: "ENTITY";
};

export type DirectoryLayoutMetadata = {
  id: string;
  displayName: string;
  pageSetType: "DIRECTORY";
};

export type LocatorLayoutMetadata = {
  id: string;
  displayName: string;
  pageSetType: "LOCATOR";
};

export type LayoutMetadata =
  | EntityLayoutMetadata
  | DirectoryLayoutMetadata
  | LocatorLayoutMetadata;

export type SectionLibraryLayout = {
  metadata: LayoutMetadata;
  defaultLayout: Record<string, any>;
};
