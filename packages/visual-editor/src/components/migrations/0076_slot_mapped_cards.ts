import { Migration } from "../../utils/migrate.ts";

const defaultEntityFieldMapping = Object.freeze({
  field: "",
  constantValueEnabled: false,
  constantValue: undefined,
});

const eventDefaultMappings = {
  image: { ...defaultEntityFieldMapping, field: "image" },
  title: { ...defaultEntityFieldMapping, field: "title" },
  dateTime: { ...defaultEntityFieldMapping, field: "dateTime" },
  description: { ...defaultEntityFieldMapping, field: "description" },
  cta: { ...defaultEntityFieldMapping, field: "cta" },
};
const faqDefaultMappings = {
  question: { ...defaultEntityFieldMapping, field: "question" },
  answer: { ...defaultEntityFieldMapping, field: "answer" },
};
const productDefaultMappings = {
  image: { ...defaultEntityFieldMapping, field: "image" },
  brow: { ...defaultEntityFieldMapping, field: "brow" },
  name: { ...defaultEntityFieldMapping, field: "name" },
  price: { ...defaultEntityFieldMapping, field: "price" },
  description: { ...defaultEntityFieldMapping, field: "description" },
  cta: { ...defaultEntityFieldMapping, field: "cta" },
};
const testimonialDefaultMappings = {
  description: { ...defaultEntityFieldMapping, field: "description" },
  contributorName: {
    ...defaultEntityFieldMapping,
    field: "contributorName",
  },
  contributionDate: {
    ...defaultEntityFieldMapping,
    field: "contributionDate",
  },
};
const insightDefaultMappings = {
  image: { ...defaultEntityFieldMapping, field: "image" },
  name: { ...defaultEntityFieldMapping, field: "name" },
  category: { ...defaultEntityFieldMapping, field: "category" },
  publishTime: { ...defaultEntityFieldMapping, field: "publishTime" },
  description: { ...defaultEntityFieldMapping, field: "description" },
  cta: { ...defaultEntityFieldMapping, field: "cta" },
};
const teamDefaultMappings = {
  headshot: { ...defaultEntityFieldMapping, field: "headshot" },
  name: { ...defaultEntityFieldMapping, field: "name" },
  title: { ...defaultEntityFieldMapping, field: "title" },
  phoneNumber: { ...defaultEntityFieldMapping, field: "phoneNumber" },
  email: { ...defaultEntityFieldMapping, field: "email" },
  cta: { ...defaultEntityFieldMapping, field: "cta" },
};

const cloneValue = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

const appendChildField = (field: string, childField: string): string => {
  if (!field || field.endsWith(`.${childField}`)) {
    return field;
  }

  return `${field}.${childField}`;
};

const clearNestedFieldValues = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(clearNestedFieldValues);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      key === "field" && typeof nestedValue === "string"
        ? ""
        : clearNestedFieldValues(nestedValue),
    ])
  );
};

/**
 * Removes the old linked runtime residue from saved cards while preserving the
 * authored manual constants and styles.
 *
 * 1. Clears card-level `parentData`.
 * 2. Clears child-slot `props.parentData`.
 * 3. Clears linked `field` values inside each slot child's `props.data`.
 */
const scrubLinkedCardState = (cards: unknown): unknown => {
  if (!Array.isArray(cards)) {
    return cards;
  }

  return cards.map((card) => {
    if (!card || typeof card !== "object") {
      return card;
    }

    const cardClone = cloneValue(card) as {
      props?: {
        parentData?: unknown;
        slots?: Record<
          string,
          Array<{
            props?: {
              data?: unknown;
              parentData?: unknown;
            };
          }>
        >;
      };
    };

    if (!cardClone.props) {
      return cardClone;
    }

    delete cardClone.props.parentData;

    Object.values(cardClone.props.slots ?? {}).forEach((slotArray) => {
      slotArray.forEach((slotChild) => {
        if (!slotChild.props) {
          return;
        }

        delete slotChild.props.parentData;
        slotChild.props.data = clearNestedFieldValues(slotChild.props.data);
      });
    });

    return cardClone;
  });
};

/**
 * Converts an old section-field wrapper into the new slotted-item shape while
 * preserving authored manual cards in hidden `manualSlots`.
 *
 * 1. Initializes `manualSlots.CardSlot` from the saved visible cards.
 * 2. Rewrites the wrapper field to the repeated-child field path in linked mode.
 * 3. Installs the canonical mapping set for that section type.
 * 4. Scrubs old linked `parentData` and child-slot `field` residue in linked mode.
 */
const buildSlotMappedTransform =
  (childField: string, mappings: Record<string, unknown>) =>
  <T extends { id: string } & Record<string, any>>(props: T): T => {
    if ((props.manualSlots as { CardSlot?: unknown } | undefined)?.CardSlot) {
      return props;
    }

    const visibleCards = Array.isArray(
      (props.slots as { CardSlot?: unknown } | undefined)?.CardSlot
    )
      ? ((props.slots as { CardSlot?: unknown }).CardSlot as unknown[])
      : [];
    const isLinked =
      (
        props.data as
          | { constantValueEnabled?: boolean; field?: string }
          | undefined
      )?.constantValueEnabled === false &&
      Boolean((props.data as { field?: string } | undefined)?.field);
    const manualCards = isLinked
      ? scrubLinkedCardState(visibleCards)
      : visibleCards;

    return {
      ...props,
      data: isLinked
        ? {
            ...(props.data as Record<string, unknown>),
            field: appendChildField(
              (props.data as { field: string }).field,
              childField
            ),
            mappings,
          }
        : props.data,
      slots: {
        ...((props.slots as Record<string, unknown> | undefined) ?? {}),
        CardSlot: manualCards,
      },
      manualSlots: {
        CardSlot: manualCards,
      },
    } as T;
  };

export const slotMappedCardsMigration: Migration = {
  EventCardsWrapper: {
    action: "updated",
    propTransformation: buildSlotMappedTransform(
      "events",
      eventDefaultMappings
    ),
  },
  FAQSection: {
    action: "updated",
    propTransformation: buildSlotMappedTransform("faqs", faqDefaultMappings),
  },
  ProductCardsWrapper: {
    action: "updated",
    propTransformation: buildSlotMappedTransform(
      "products",
      productDefaultMappings
    ),
  },
  TestimonialCardsWrapper: {
    action: "updated",
    propTransformation: buildSlotMappedTransform(
      "testimonials",
      testimonialDefaultMappings
    ),
  },
  InsightCardsWrapper: {
    action: "updated",
    propTransformation: buildSlotMappedTransform(
      "insights",
      insightDefaultMappings
    ),
  },
  TeamCardsWrapper: {
    action: "updated",
    propTransformation: buildSlotMappedTransform("people", teamDefaultMappings),
  },
};
