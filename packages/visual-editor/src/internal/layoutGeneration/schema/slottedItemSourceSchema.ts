import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import type { GenerationComponent } from "../../../utils/createPuckGenerationCatalog.ts";
import type { SlottedItemSourceGenerationMetadata } from "../../../utils/itemSource/itemSourceTypes.ts";
import { unwrapZodSchema as unwrap } from "../../utils/unwrapZodSchema.ts";

/** Manual card content belongs to native slots, not the helper's reference storage. */
export const slottedItemSourceSchema = (
  mappingSchema: z.ZodObject,
  options: { fixedField?: string; linkedOnly?: boolean } = {}
): z.ZodObject => {
  const mappings = Object.fromEntries(
    Object.keys(mappingSchema.shape).map((key) => [
      key,
      z.strictObject({
        field: z.string(),
        constantValueEnabled: z.literal(false),
      }),
    ])
  );

  return z
    .object({
      field: options.fixedField ? z.literal(options.fixedField) : z.string(),
      constantValueEnabled: options.linkedOnly ? z.literal(false) : z.boolean(),
      mappings: (options.linkedOnly ? mappingSchema : z.object(mappings))
        .optional()
        .describe(
          options.linkedOnly
            ? "Declared mappings and configuration for linked cards only. Manual cards are unsupported."
            : "Entity bindings for linked cards only. Put manual card content in slots.CardSlot."
        ),
    })
    .describe(
      options.linkedOnly
        ? "Linked cards only: use the declared source field and constantValueEnabled false. Mappings retain their declared binding and configuration shapes. Manual cards are unsupported."
        : options.fixedField
          ? "Keep the declared source field. Manual cards: constantValueEnabled true, content in slots.CardSlot. Linked cards: constantValueEnabled false, mappings for bindings."
          : "Manual cards: field empty, constantValueEnabled true, content in slots.CardSlot. Linked cards: source field, constantValueEnabled false, mappings for bindings."
    );
};

/** Restrict a catalog copy of the fields without changing the editor config. */
export const restrictSlottedItemSourceFields = (
  fields: Fields,
  source: SlottedItemSourceGenerationMetadata | undefined
): Fields => {
  const slots = fields.slots;

  if (!source || slots?.type !== "object") {
    return fields;
  }

  return {
    ...fields,
    slots: {
      ...slots,
      objectFields: {
        ...slots.objectFields,
        CardSlot: {
          ...slots.objectFields.CardSlot,
          type: "slot",
          allow: [source.cardType],
        },
      },
    },
  };
};

/** Contracts must leave helper-owned reference and backup storage out of model input. */
export const validateSlottedItemSourceContract = (
  name: string,
  config: GenerationComponent,
  components: Record<string, GenerationComponent>
) => {
  const source = config.generation?.slottedItemSource;

  if (!source) {
    return;
  }

  const shape = config.generation!.props.shape;

  const data = unwrap(shape.data);

  const slots = unwrap(shape.slots);

  const fields = config.fields?.slots;

  const cardSlot =
    fields?.type === "object" ? fields.objectFields.CardSlot : undefined;

  const error = (detail: string): never => {
    throw new Error(
      `Generation schema at ${name}: slottedItemSource ${detail}`
    );
  };

  if (
    typeof source.cardType !== "string" ||
    !source.cardType.trim() ||
    !Object.hasOwn(components, source.cardType) ||
    !components[source.cardType].generation
  ) {
    error("requires a registered card generation contract");
  }
  if (
    source.defaultItemProps !== undefined &&
    typeof source.defaultItemProps !== "function" &&
    (typeof source.defaultItemProps !== "object" ||
      source.defaultItemProps === null ||
      Array.isArray(source.defaultItemProps))
  ) {
    error("has invalid defaultItemProps");
  }
  const scalar = (
    schema: z.ZodType | undefined,
    type: "string" | "boolean"
  ) => {
    const node = schema && unwrap(schema);
    return (
      (type === "string"
        ? node instanceof z.ZodString
        : node instanceof z.ZodBoolean) ||
      (node instanceof z.ZodLiteral &&
        [...node.values].every((value) => typeof value === type))
    );
  };
  if (
    !(data instanceof z.ZodObject) ||
    !scalar(data.shape.field, "string") ||
    !scalar(data.shape.constantValueEnabled, "boolean") ||
    data.shape.constantValue ||
    (data.def.catchall && (data.def.catchall as z.ZodType).def.type !== "never")
  ) {
    error(
      "requires data.field and data.constantValueEnabled, without constantValue or open-ended data"
    );
  }
  if (components[source.cardType].generation?.props.shape.index) {
    error("card contracts must omit derived indexes");
  }
  if (shape.manualSlots || shape.conditionalRender) {
    error("cannot declare manualSlots or conditionalRender as authored");
  }
  if (
    !(slots instanceof z.ZodObject) ||
    !(unwrap(slots.shape.CardSlot) instanceof z.ZodArray) ||
    cardSlot?.type !== "slot"
  ) {
    error("requires slots.CardSlot as an authored native slot");
  }
  if (
    cardSlot?.type === "slot" &&
    (cardSlot.disallow?.includes(source.cardType) ||
      (cardSlot.allow?.length && !cardSlot.allow.includes(source.cardType)))
  ) {
    error("card type conflicts with the native slot restrictions");
  }
};
