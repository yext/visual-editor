import { msg } from "../../utils/i18nPlatform.ts";
import { StructEntityFieldTypes } from "../../editor/YextStructFieldSelector.tsx";
import { DevLogger } from "../../utils/devLogger.ts";
import { EntityFieldTypes } from "../utils/getFilteredEntityFields.ts";

const devLogger = new DevLogger();

export type SubFieldProps = {
  field: string;
  type: EntityFieldTypes;
  label: string;
}[];

const HERO_SECTION_SUBFIELD: SubFieldProps = [
  { field: "image", type: "type.image", label: msg("fields.image", "Image") },
  {
    field: "primaryCta",
    type: "type.cta",
    label: msg("fields.primaryCTA", "Primary CTA"),
  },
  {
    field: "secondaryCta",
    type: "type.cta",
    label: msg("fields.secondaryCTA", "Secondary CTA"),
  },
];

const PROMO_SECTION_SUBFIELD: SubFieldProps = [
  { field: "image", type: "type.image", label: msg("fields.image", "Image") },
  { field: "title", type: "type.string", label: msg("fields.title", "Title") },
  {
    field: "description",
    type: "type.rich_text_v2",
    label: msg("fields.description", "Description"),
  },
  { field: "cta", type: "type.cta", label: msg("fields.cta", "CTA") },
];

const STRUCT_TYPE_TO_SUBFIELDS: Record<StructEntityFieldTypes, SubFieldProps> =
  {
    "type.hero_section": HERO_SECTION_SUBFIELD,
    "type.promo_section": PROMO_SECTION_SUBFIELD,
  };

export const getSubfieldsFromType = (
  type: StructEntityFieldTypes | undefined
): SubFieldProps | undefined => {
  if (!type) {
    return;
  }
  const subfields = STRUCT_TYPE_TO_SUBFIELDS[type];
  if (!subfields) {
    devLogger.log(`No subfields found for ${type}`);
    return;
  }
  return subfields;
};
