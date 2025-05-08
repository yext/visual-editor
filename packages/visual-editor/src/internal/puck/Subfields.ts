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
  { field: "image", type: "type.image", label: "Image" },
  { field: "primaryCta", type: "type.cta", label: "Primary CTA" },
  { field: "secondaryCta", type: "type.cta", label: "Secondary CTA" },
];

const PROMO_SECTION_SUBFIELD: SubFieldProps = [
  { field: "image", type: "type.image", label: "Image" },
  { field: "title", type: "type.string", label: "Title" },
  { field: "description", type: "type.string", label: "Description" },
  { field: "cta", type: "type.cta", label: "CTA" },
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
