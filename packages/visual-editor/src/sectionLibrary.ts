export type PageSetType = "ENTITY" | "DIRECTORY" | "LOCATOR";

export type SectionConfig = {
  id: string;
  displayName: string;
  description: string;
  pageSetTypes: PageSetType[];
  category?: string;
};
