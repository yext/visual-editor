import type { z } from "zod";
import type { SlottedItemSourceGenerationMetadata } from "../utils/itemSource/itemSourceTypes.ts";
import "@puckeditor/core";

/** Generation controls shared by native Puck and Yext field definitions. */
export type FieldGenerationMetadata = {
  /** Exclude this field from AI generation. The default value will be used. */
  exclude?: boolean;
  /** Overrides the requiredness of this field */
  required?: boolean;
  /** Require integer values for inferred number fields. Does not change editor step. */
  integer?: boolean;
  /** Allow null (for example, an inherited selector value) during inference only. */
  nullable?: boolean;
  /** Plain text instructions to pass to the model. */
  instructions?: string;
  /** Require exactly one slot child. False or omitted keeps variable-length arrays. */
  singleChild?: boolean;
  /** Explicit schemas own optionality; callbacks receive the inferred schema. */
  schema?: z.ZodType | ((inferred: z.ZodType) => z.ZodType);
};

export type LayoutGenerationMetadata = {
  /** Exclude this from layout generation. Components are included by default. */
  exclude?: boolean;
  /** Plain text instructions to pass to the model. */
  instructions?: string;
  /** Complete override of the layout generation props inferred from fields. */
  props?: z.ZodObject;
  /** JSON Pointer paths whose resolved values survive chat edit preservation. */
  resolvedProps?: string[];
  slottedItemSource?: SlottedItemSourceGenerationMetadata;
};

declare module "@puckeditor/core" {
  interface BaseField {
    generation?: FieldGenerationMetadata;
  }
}
