import DOMPurify from "dompurify";

export type TemplateMetadata = {
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

export function generateTemplateMetadata(): TemplateMetadata {
  const cleanString = DOMPurify.sanitize(window.location.href).split("?")[0];
  return {
    siteId: 1337,
    templateId: "dev",
    entityId: hashCode(cleanString),
    layoutId: hashCode(cleanString),
    isDevMode: true,
    isxYextDebug: true,
    isThemeMode: false,
    devOverride: false,
  };
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0, len = s.length; i < len; i++) {
    const chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
