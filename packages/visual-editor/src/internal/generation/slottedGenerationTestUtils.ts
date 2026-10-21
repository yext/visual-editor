import { resolveAllData } from "@puckeditor/core";
import { z } from "zod";
import { createSlottedItemSource } from "../../utils/itemSource/createSlottedItemSource.ts";
import { createPuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { clone, type Content } from "./authored.ts";

const defaults = { $default: true };
const binding = z.object({
  field: z.string(),
  constantValueEnabled: z.boolean(),
  constantValue: z.string().optional(),
});

export const slottedFixture = (cardType = "FAQCard") => {
  const defaultCardProps = {
    data: {
      question: { defaultValue: "Default question", fr: "Question par défaut" },
      answer: "Default answer",
    },
    styles: { color: "blue" },
    slots: {
      BodySlot: [
        { type: "Text", props: { id: "copied-child", text: "Default body" } },
      ],
    },
  };
  const source = createSlottedItemSource({
    label: "Items",
    itemLabel: "Item",
    cardName: cardType,
    defaultItemProps: () => clone(defaultCardProps),
    mappingFields: {
      question: { type: "entityField", filter: { types: ["type.string"] } },
    },
  });
  const components: Record<string, any> = {
    Section: {
      generation: {
        props: z.object({
          title: z.string(),
          data: z.object({
            field: z.string(),
            constantValueEnabled: z.boolean(),
            mappings: z.object({ question: binding }),
          }),
          slots: z.object({ CardSlot: z.array(z.unknown()) }),
        }),
        slottedItemSource: source.generation,
      },
      fields: {
        slots: {
          type: "object",
          objectFields: { CardSlot: { type: "slot", allow: [] } },
        },
      },
      defaultProps: { ...clone(source.defaultWrapperProps), title: "Section" },
      resolveData: (data: any, params: any) =>
        source.populateSlots(data, params.metadata.streamDocument),
      render: () => null,
    },
    [cardType]: {
      generation: {
        props: z.object({
          data: z.object({
            question: z.object({
              defaultValue: z.string(),
              fr: z.string().optional(),
            }),
            answer: z.string(),
          }),
          styles: z.object({ color: z.string() }),
          slots: z.object({ BodySlot: z.array(z.unknown()) }),
        }),
      },
      fields: {
        slots: {
          type: "object",
          objectFields: { BodySlot: { type: "slot", allow: ["Text"] } },
        },
      },
      defaultProps: defaultCardProps,
      nestedOnly: true,
      render: () => null,
    },
    Text: {
      generation: { props: z.object({ text: z.string() }) },
      defaultProps: { text: "Text" },
      nestedOnly: true,
      render: () => null,
    },
  };
  const catalog = () => createPuckGenerationCatalog(components);
  const section = (cards: any = defaults, data: any = defaults) => ({
    type: "Section",
    props: { title: defaults, data, slots: { CardSlot: cards } },
  });
  const card = (text = "Generated question", color = "pink") => ({
    type: cardType,
    props: {
      data: {
        question: { defaultValue: text, fr: "Traduction" },
        answer: "Generated answer",
      },
      styles: { color },
      slots: { BodySlot: defaults },
    },
  });
  const materialize = (content = [section()]): Content =>
    compileGenerationSchema(catalog(), ["en", "fr"]).materialize({
      text: "Created",
      translationMode: "translate",
      result: { action: "create", content },
    }).spec!;
  const linked = {
    field: "c_items",
    constantValueEnabled: false,
    mappings: {
      question: {
        field: "name",
        constantValueEnabled: false,
        constantValue: { $unset: true },
      },
    },
  };
  const resolve = (data: Content, streamDocument: any = { locale: "en" }) =>
    resolveAllData(
      clone({ ...data, root: { props: {} } }) as any,
      { components } as any,
      { streamDocument }
    ) as Promise<any>;
  return {
    source,
    components,
    get catalog() {
      return catalog();
    },
    materialize,
    section,
    card,
    linked,
    resolve,
  };
};
