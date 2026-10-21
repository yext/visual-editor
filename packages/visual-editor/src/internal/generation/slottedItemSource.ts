import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import { unwrapZodSchema as unwrap } from "../utils/unwrapZodSchema.ts";
import type {
  GenerationComponent,
  PuckGenerationCatalog,
} from "../../utils/generationCatalog.ts";
import {
  createSlottedCard,
  setChildSlotIds,
} from "../../utils/itemSource/slottedCardDefaults.ts";
import { clonePuckResolveData as clone } from "../utils/clonePuckResolveData.ts";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import type { SavedComponent } from "./authored.ts";

export const isLinkedSource = (props: Record<string, any>): boolean =>
  !props.data?.constantValueEnabled && !!props.data?.field;

/** Apply generation-only restrictions without modifying the editor's fields. */
export const generationFields = (config: GenerationComponent): Fields => {
  const fields = config.fields ?? {};
  const source = config.generation?.slottedItemSource;
  const slots = fields.slots;
  if (!source || slots?.type !== "object") {
    return fields;
  }
  const cardSlot = slots.objectFields.CardSlot;
  return {
    ...fields,
    slots: {
      ...slots,
      objectFields: {
        ...slots.objectFields,
        CardSlot: { ...cardSlot, type: "slot", allow: [source.cardType] },
      },
    },
  };
};

/** Contracts must leave helper-owned reference and backup storage out of model input. */
export const preflightSlottedItemSource = (
  name: string,
  config: GenerationComponent,
  catalog: PuckGenerationCatalog
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
    !Object.hasOwn(catalog.data.components, source.cardType) ||
    !catalog.data.components[source.cardType].generation
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
  if (
    !(data instanceof z.ZodObject) ||
    !(unwrap(data.shape.field) instanceof z.ZodString) ||
    !(unwrap(data.shape.constantValueEnabled) instanceof z.ZodBoolean) ||
    data.shape.constantValue ||
    (data.def.catchall && (data.def.catchall as z.ZodType).def.type !== "never")
  ) {
    error(
      "requires data.field and data.constantValueEnabled, without constantValue or open-ended data"
    );
  }
  if (catalog.data.components[source.cardType].generation?.props.shape.index) {
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

/** Linked visible cards are derived; the inactive manual backup remains authored. */
export const slottedAuthoredProps = (
  component: SavedComponent,
  config: GenerationComponent
) =>
  config.generation?.slottedItemSource && isLinkedSource(component.props)
    ? { ...component.props, slots: { ...component.props.slots, CardSlot: [] } }
    : component.props;

export const manualBackup = (component: SavedComponent): SavedComponent[] =>
  component.props.manualSlots?.CardSlot ?? [];

/** Prepare defaults before walking children. Explicit arrays always win over placeholder counts. */
export const prepareSlottedSource = (
  component: SavedComponent,
  config: GenerationComponent,
  explicitCards: boolean
) => {
  const source = config.generation?.slottedItemSource;
  if (!source) {
    return;
  }
  const props = component.props;
  const cards = props.slots?.CardSlot;
  if (!Array.isArray(cards)) {
    throw new Error(`${component.type}: props/slots/CardSlot must be an array`);
  }
  if (isLinkedSource(props)) {
    if (explicitCards && cards.length) {
      throw new Error(
        `${component.type}: linked sources cannot author props/slots/CardSlot children`
      );
    }
    props.slots.CardSlot = [];
    props.manualSlots = { CardSlot: clone(manualBackup(component)) };
  } else {
    if (!explicitCards && !cards.length) {
      const backup = manualBackup(component);
      props.slots.CardSlot = backup.length
        ? clone(backup)
        : Array.from(
            { length: props.data?.constantValue?.length ?? 0 },
            (_, index) => createSlottedCard(source, "", index)
          );
    }
    // The visible list is authoritative. The mirror is populated after final Id allocation.
    props.manualSlots = { CardSlot: [] };
  }
};

/** Finalize helper identities and reference storage after all authored children have fresh Ids. */
export const finalizeSlottedSource = (
  component: SavedComponent,
  config: GenerationComponent,
  preserveExisting = false
) => {
  if (!config.generation?.slottedItemSource) {
    return;
  }
  const props = component.props;
  const cards: SavedComponent[] = isLinkedSource(props)
    ? manualBackup(component)
    : props.slots.CardSlot;
  cards.forEach((card, index) => {
    card.props.index = index;
    if (!preserveExisting) {
      setChildSlotIds(card as any, card.props.id);
    }
  });
  props.data.constantValue = cards.map((card) => ({ id: card.props.id }));
  if (!isLinkedSource(props)) {
    props.manualSlots = {
      ...(preserveExisting ? props.manualSlots : {}),
      CardSlot: clone(cards),
    };
  }
};

/** Validate storage independently of projection: omitting references must not hide broken links. */
export const validateSlottedSource = (
  component: SavedComponent,
  config: GenerationComponent
) => {
  const source = config.generation?.slottedItemSource;
  if (!source) {
    return;
  }
  const props = component.props;
  const fail = (path: string): never => {
    throw new Error(`${component.type} (${props.id}): invalid ${path}`);
  };
  if (!Array.isArray(props.slots?.CardSlot)) {
    fail("props/slots/CardSlot");
  }
  if (!Array.isArray(props.manualSlots?.CardSlot)) {
    fail("props/manualSlots/CardSlot");
  }
  const cards: SavedComponent[] = isLinkedSource(props)
    ? manualBackup(component)
    : props.slots.CardSlot;
  for (const card of [
    ...cards,
    ...(isLinkedSource(props) ? props.slots.CardSlot : []),
  ]) {
    if (card?.type !== source.cardType) {
      fail("props/slots/CardSlot/type");
    }
  }
  if (
    !isDeepEqual(
      props.data?.constantValue,
      cards.map((card) => ({ id: card.props.id }))
    )
  ) {
    fail("props/data/constantValue");
  }
};

/** Check derived visible trees without treating their entity-driven props as authored. */
export const validateLinkedCardStructure = (
  component: SavedComponent,
  config: GenerationComponent,
  catalog: PuckGenerationCatalog,
  seenIds: Set<string>
) => {
  const source = config.generation?.slottedItemSource;
  if (!source || !isLinkedSource(component.props)) {
    return;
  }
  const fail = (path: string): never => {
    throw new Error(
      `${component.type} (${component.props.id}): invalid ${path}`
    );
  };
  const visitFields = (value: any, fields: Fields, path: string) => {
    for (const [key, field] of Object.entries(fields)) {
      if (value?.[key] === undefined) {
        continue;
      }
      const childPath = `${path}/${key}`;
      if (field.type === "slot") {
        if (!Array.isArray(value[key])) {
          fail(childPath);
        }
        value[key].forEach((card: SavedComponent, index: number) =>
          visit(card, `${childPath}/${index}`, field)
        );
      } else if (field.type === "object") {
        visitFields(value[key], field.objectFields, childPath);
      } else if (field.type === "array") {
        if (!Array.isArray(value[key])) {
          fail(childPath);
        }
        value[key].forEach((item: any, index: number) =>
          visitFields(item, field.arrayFields, `${childPath}/${index}`)
        );
      }
    }
  };
  const visit = (
    card: SavedComponent,
    path: string,
    field: { allow?: string[]; disallow?: string[] }
  ) => {
    if (
      !card ||
      typeof card.type !== "string" ||
      !card.props ||
      typeof card.props !== "object" ||
      Array.isArray(card.props)
    ) {
      fail(path);
    }
    if (
      !Object.hasOwn(catalog.data.components, card.type) ||
      field.disallow?.includes(card.type) ||
      (field.allow?.length && !field.allow.includes(card.type))
    ) {
      fail(`${path}/type`);
    }
    const id = card.props.id;
    if (typeof id !== "string" || !id.trim() || seenIds.has(id)) {
      fail(`${path}/props/id`);
    }
    seenIds.add(id);
    visitFields(
      card.props,
      catalog.data.components[card.type].fields ?? {},
      `${path}/props`
    );
  };
  component.props.slots.CardSlot.forEach(
    (card: SavedComponent, index: number) =>
      visit(card, `props/slots/CardSlot/${index}`, { allow: [source.cardType] })
  );
};
