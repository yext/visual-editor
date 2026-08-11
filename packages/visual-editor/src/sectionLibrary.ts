/** Metadata that describes a user-selectable Section Library section. */
export type SectionConfig = {
  displayName: string;
  description: string;
  pageSetTypes: "ENTITY"[];
  category?: string;
};
