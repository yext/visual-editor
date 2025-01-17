export type TemplateMetadata = {
  role: string;
  siteId: number;
  templateId: string;
  layoutId?: number;
  entityId?: number;
  themeEntityId?: number;
  isDevMode: boolean;
  devOverride: boolean;
  isxYextDebug: boolean;
  isThemeMode: boolean;
};

export const DevTemplateMetadata: TemplateMetadata = {
  role: "developer",
  siteId: 0,
  templateId: "dev",
  entityId: 0,
  isDevMode: true,
  isxYextDebug: true,
  isThemeMode: false,
  devOverride: false,
};
