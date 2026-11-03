import type { AiPageGeneration } from "../internal/types/templateMetadata.ts";

export type LocalDevOptions = {
  aiPageGeneration?: AiPageGeneration;
  templateId?: string;
  entityId?: string | number;
  locale?: string;
  locales?: string[];
  layoutScopeKey?: string;
  themeScopeKey?: string;
  initialLayoutData?: Record<string, unknown>;
};
