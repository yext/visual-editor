import { msg } from "../../utils/i18n/platform.ts";
import { DevLogger } from "../../utils/devLogger.ts";
import {
  ConstantValueTypes,
  EntityFieldTypes,
} from "../utils/getFilteredEntityFields.ts";

const devLogger = new DevLogger();

export type SubFieldProps = {
  field: string;
  type: EntityFieldTypes;
  label: string;
  constantValueType?: ConstantValueTypes;
}[];

const PROMO_SECTION_SUBFIELD: SubFieldProps = [
  {
    field: "image",
    type: "type.image",
    constantValueType: "imageOrVideo",
    label: msg("fields.media", "Media"),
  },
  { field: "title", type: "type.string", label: msg("fields.title", "Title") },
  {
    field: "description",
    type: "type.rich_text_v2",
    label: msg("fields.description", "Description"),
  },
  { field: "cta", type: "type.cta", label: msg("fields.cta", "CTA") },
];

const STRUCT_TYPE_TO_SUBFIELDS: Record<string, SubFieldProps> = {
  "type.promo_section": PROMO_SECTION_SUBFIELD,
};

export const getSubfieldsFromType = (
  type: string | undefined
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
