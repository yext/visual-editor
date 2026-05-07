import { FontRegistry } from "../../utils/fonts/visualEditorFonts.ts";
import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import DOMPurify from "dompurify";
import type { LocalDevOptions } from "../../editor/types.ts";

export type HeadDeployStatus = "RUNNING" | "INACTIVE" | "FAILED" | "ACTIVE";

export type TemplateMetadata = {
  siteId: number;
  templateId: string;
  layoutId?: number;
  entityId?: number;
  themeEntityId?: number;
  assignment: "ALL" | "ENTITY";
  isDevMode: boolean;
  devOverride: boolean;
  isxYextDebug: boolean;
  isThemeMode: boolean;
  entityCount: number;
  totalEntityCount: number;
  entityTypeDisplayName: string;
  platformLocale?: string;
  locales: string[];
  layoutTaskApprovals: boolean;
  locatorDisplayFields?: Record<string, FieldTypeData>;
  customFonts?: FontRegistry;
  headDeployStatus: HeadDeployStatus;
};

export type FieldTypeData = {
  field_id: string;
  field_name: string;
  field_type: object;
  field_type_id: string;
};

const defaultLocatorDisplayFields: Record<string, FieldTypeData> = {
  name: {
    field_id: "name",
    field_name: "Name",
    field_type: {
      variant_type: 1,
    },
    field_type_id: "type.string",
  },
  mainPhone: {
    field_id: "mainPhone",
    field_name: "Main Phone",
    field_type: {},
    field_type_id: "type.phone",
  },
};

const locatorLocalDevDisplayFields: Record<string, FieldTypeData> = {
  ...defaultLocatorDisplayFields,
  slug: {
    field_id: "slug",
    field_name: "Slug",
    field_type: {
      variant_type: 1,
    },
    field_type_id: "type.string",
  },
  website: {
    field_id: "website",
    field_name: "Website",
    field_type: {
      variant_type: 1,
    },
    field_type_id: "type.string",
  },
  additionalHoursText: {
    field_id: "additionalHoursText",
    field_name: "Additional Hours Text",
    field_type: {
      variant_type: 1,
    },
    field_type_id: "type.string",
  },
  emails: {
    field_id: "emails",
    field_name: "Emails",
    field_type: {
      variant_type: 1,
    },
    field_type_id: "type.string",
  },
  services: {
    field_id: "services",
    field_name: "Services",
    field_type: {
      variant_type: 1,
    },
    field_type_id: "type.string",
  },
  hours: {
    field_id: "hours",
    field_name: "Hours",
    field_type: {},
    field_type_id: "type.hours",
  },
  headshot: {
    field_id: "headshot",
    field_name: "Headshot",
    field_type: {},
    field_type_id: "type.image",
  },
};

const isLocatorLocalDevDocument = (streamDocument?: StreamDocument) => {
  return (
    streamDocument?.meta?.entityType?.id === "locator" ||
    streamDocument?.__?.codeTemplate === "locator"
  );
};

export function generateTemplateMetadata(
  streamDocument?: StreamDocument,
  localDevOptions?: LocalDevOptions
): TemplateMetadata {
  const cleanString = DOMPurify.sanitize(window.location.href).split("?")[0];
  const isLocatorDocument = isLocatorLocalDevDocument(streamDocument);
  const templateId =
    localDevOptions?.templateId ?? streamDocument?.__?.name ?? "dev";
  const locale = localDevOptions?.locale ?? "en";
  const entityId = localDevOptions?.entityId
    ? hashCode(String(localDevOptions.entityId))
    : hashCode(cleanString);
  const layoutScopeKey =
    localDevOptions?.layoutScopeKey ??
    JSON.stringify({
      templateId,
      entityId: localDevOptions?.entityId ?? cleanString,
      locale,
    });
  const locales = localDevOptions?.locales?.length
    ? localDevOptions.locales
    : ["en", "es", "fr"];

  return {
    siteId: 1337,
    templateId,
    entityId,
    layoutId: hashCode(layoutScopeKey),
    assignment: "ALL",
    isDevMode: true,
    isxYextDebug: true,
    isThemeMode: false,
    devOverride: false,
    entityCount: 0,
    totalEntityCount: 0,
    entityTypeDisplayName: isLocatorDocument ? "Locator" : "Entity",
    platformLocale: locale,
    locales,
    layoutTaskApprovals: false,
    headDeployStatus: "ACTIVE",
    locatorDisplayFields: isLocatorDocument
      ? locatorLocalDevDisplayFields
      : defaultLocatorDisplayFields,
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
