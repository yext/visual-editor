import type { Fields } from "@puckeditor/core";
import { isDeepEqual } from "../../../utils/deepEqual.ts";
import type {
  GenerationComponent,
  PuckGenerationCatalog,
} from "../../../utils/createPuckGenerationCatalog.ts";
import {
  createSlottedCard,
  setChildSlotIds,
} from "../../../utils/itemSource/createSlottedItemSource.ts";
import { clonePuckResolveData as clone } from "../../utils/clonePuckResolveData.ts";
import type { SavedComponent } from "./authoredValues.ts";

export const isLinkedSource = (props: Record<string, any>): boolean =>
  !props.data?.constantValueEnabled && !!props.data?.field;

/** Manual list structure is edited through the source field, independently of Puck DnD. */
export const isManagedCardCollection = (
  catalog: PuckGenerationCatalog,
  owner: SavedComponent | undefined,
  slotPath: string | null
): boolean =>
  !!owner &&
  slotPath === "/slots/CardSlot" &&
  !!catalog.data.components[owner.type]?.generation?.slottedItemSource &&
  !isLinkedSource(owner.props);

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
