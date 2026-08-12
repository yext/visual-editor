export type PageSetType = "ENTITY" | "DIRECTORY" | "LOCATOR";

export type SectionConfig = {
  displayName: string;
  description: string;
  pageSetTypes: PageSetType[];
  category?: string;
};
