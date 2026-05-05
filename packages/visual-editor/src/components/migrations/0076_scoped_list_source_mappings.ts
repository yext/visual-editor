import { resolveField } from "../../utils/resolveYextEntityField.ts";
import { type Migration } from "../../utils/migrate.ts";

type LegacyProps = { id: string } & Record<string, any>;

type LegacyListSourceConfig = {
  listFieldName: string;
  mappingFieldName: string;
  linkedMappings: Record<string, string>;
  extractManualItem: (card: Record<string, any>) => Record<string, unknown>;
};

/**
 * Reads a dotted props path out of a legacy component or card payload.
 */
const getPathValue = (value: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (currentValue, segment) =>
        currentValue && typeof currentValue === "object"
          ? (currentValue as Record<string, unknown>)[segment]
          : undefined,
      value
    );

/**
 * Deep-clones legacy authored values before they are moved into the new inline
 * manual-item structure.
 */
const cloneValue = <T>(value: T): T =>
  value === undefined ? value : JSON.parse(JSON.stringify(value));

/**
 * Converts an old list-valued entity field into the new scalar shape used by
 * manual team email items.
 */
const toScalarEntityField = (
  entityField: Record<string, any> | undefined
): Record<string, unknown> => ({
  ...cloneValue(entityField ?? {}),
  constantValue: Array.isArray(entityField?.constantValue)
    ? (entityField.constantValue[0] ?? "")
    : entityField?.constantValue,
});

/**
 * Preserves the authored manual-item count when the old slots are empty.
 */
const createEmptyItems = (length: number): Record<string, unknown>[] =>
  Array.from({ length }, () => ({}));

/**
 * Retargets an old parent field to the nested list source when the resolved
 * source document still uses the wrapper object shape from `origin/main`.
 */
const getNextSourceField = (
  field: string,
  streamDocument: Record<string, unknown>,
  listFieldName: string
): string => {
  const resolvedSource = resolveField<unknown>(streamDocument, field).value;

  return field.endsWith(`.${listFieldName}`) ||
    !resolvedSource ||
    typeof resolvedSource !== "object" ||
    !Array.isArray((resolvedSource as Record<string, unknown>)[listFieldName])
    ? field
    : `${field}.${listFieldName}`;
};

/**
 * Migrates one old list-backed component shape into the new itemSource contract.
 *
 * 1. In linked mode, retarget the parent field to the list source and seed the
 *    shared mapping group expected by the new wrappers.
 * 2. In manual mode, read authored values out of the legacy card slots and move
 *    them into `data.constantValue` as inline items.
 * 3. Preserve the existing slots so card styling/layout survives the upgrade.
 */
const migrateLegacyListSourceProps = (
  props: LegacyProps,
  streamDocument: Record<string, unknown>,
  {
    listFieldName,
    mappingFieldName,
    linkedMappings,
    extractManualItem,
  }: LegacyListSourceConfig
): LegacyProps => {
  if (!props.data || typeof props.data !== "object") {
    return props;
  }

  if (props.data.constantValueEnabled) {
    const cards = Array.isArray(props.slots?.CardSlot)
      ? props.slots.CardSlot
      : [];
    const fallbackLength = Array.isArray(props.data.constantValue)
      ? props.data.constantValue.length
      : 0;

    return {
      ...props,
      data: {
        ...props.data,
        constantValue: cards.length
          ? cards.map((card: Record<string, any>) => extractManualItem(card))
          : createEmptyItems(fallbackLength),
      },
    };
  }

  if (!props.data.field) {
    return props;
  }

  return {
    ...props,
    data: {
      ...props.data,
      field: getNextSourceField(
        props.data.field,
        streamDocument,
        listFieldName
      ),
    },
    [mappingFieldName]: Object.fromEntries(
      Object.entries(linkedMappings).map(([key, field]) => [
        key,
        {
          ...props[mappingFieldName]?.[key],
          field,
        },
      ])
    ),
  };
};

/**
 * Applies the list-source migration to a wrapper slot that still embeds a
 * list-backed cards component.
 */
const migrateWrapperSlot = (
  props: LegacyProps,
  streamDocument: Record<string, unknown>,
  slotName: string,
  wrapperType: string,
  config: LegacyListSourceConfig
): LegacyProps => {
  const wrapper = Array.isArray(props.slots?.[slotName])
    ? props.slots[slotName][0]
    : undefined;

  if (!wrapper || wrapper.type !== wrapperType || !wrapper.props) {
    return props;
  }

  return {
    ...props,
    slots: {
      ...props.slots,
      [slotName]: [
        {
          ...wrapper,
          props: migrateLegacyListSourceProps(
            wrapper.props,
            streamDocument,
            config
          ),
        },
      ],
    },
  };
};

const eventConfig: LegacyListSourceConfig = {
  listFieldName: "events",
  mappingFieldName: "cards",
  linkedMappings: {
    title: "title",
    date: "dateTime",
    description: "description",
    cta: "cta",
    image: "image",
  },
  extractManualItem: (card) => ({
    title: cloneValue(
      getPathValue(card, "props.slots.TitleSlot.0.props.data.text")
    ),
    date: cloneValue(
      getPathValue(card, "props.slots.DateTimeSlot.0.props.data.date")
    ),
    description: cloneValue(
      getPathValue(card, "props.slots.DescriptionSlot.0.props.data.text")
    ),
    cta: cloneValue(
      getPathValue(card, "props.slots.CTASlot.0.props.data.entityField")
    ),
    image: cloneValue(
      getPathValue(card, "props.slots.ImageSlot.0.props.data.image")
    ),
  }),
};

const insightConfig: LegacyListSourceConfig = {
  listFieldName: "insights",
  mappingFieldName: "cards",
  linkedMappings: {
    image: "image",
    name: "name",
    category: "category",
    publishTime: "publishTime",
    description: "description",
    cta: "cta",
  },
  extractManualItem: (card) => ({
    image: cloneValue(
      getPathValue(card, "props.slots.ImageSlot.0.props.data.image")
    ),
    name: cloneValue(
      getPathValue(card, "props.slots.TitleSlot.0.props.data.text")
    ),
    category: cloneValue(
      getPathValue(card, "props.slots.CategorySlot.0.props.data.text")
    ),
    publishTime: cloneValue(
      getPathValue(card, "props.slots.PublishTimeSlot.0.props.data.date")
    ),
    description: cloneValue(
      getPathValue(card, "props.slots.DescriptionSlot.0.props.data.text")
    ),
    cta: cloneValue(
      getPathValue(card, "props.slots.CTASlot.0.props.data.entityField")
    ),
  }),
};

const productConfig: LegacyListSourceConfig = {
  listFieldName: "products",
  mappingFieldName: "cards",
  linkedMappings: {
    image: "image",
    brow: "brow",
    name: "name",
    price: "price.value",
    description: "description",
    cta: "cta",
  },
  extractManualItem: (card) => ({
    image: cloneValue(
      getPathValue(card, "props.slots.ImageSlot.0.props.data.image")
    ),
    brow: cloneValue(
      getPathValue(card, "props.slots.BrowSlot.0.props.data.text")
    ),
    name: cloneValue(
      getPathValue(card, "props.slots.TitleSlot.0.props.data.text")
    ),
    price: cloneValue(
      getPathValue(card, "props.slots.PriceSlot.0.props.data.text")
    ),
    description: cloneValue(
      getPathValue(card, "props.slots.DescriptionSlot.0.props.data.text")
    ),
    cta: cloneValue(
      getPathValue(card, "props.slots.CTASlot.0.props.data.entityField")
    ),
  }),
};

const teamConfig: LegacyListSourceConfig = {
  listFieldName: "people",
  mappingFieldName: "cards",
  linkedMappings: {
    headshot: "headshot",
    name: "name",
    title: "title",
    phoneNumber: "phoneNumber",
    email: "email",
    cta: "cta",
  },
  extractManualItem: (card) => ({
    headshot: cloneValue(
      getPathValue(card, "props.slots.ImageSlot.0.props.data.image")
    ),
    name: cloneValue(
      getPathValue(card, "props.slots.NameSlot.0.props.data.text")
    ),
    title: cloneValue(
      getPathValue(card, "props.slots.TitleSlot.0.props.data.text")
    ),
    phoneNumber: cloneValue(
      getPathValue(
        card,
        "props.slots.PhoneSlot.0.props.data.phoneNumbers.0.number"
      )
    ),
    email: toScalarEntityField(
      getPathValue(card, "props.slots.EmailSlot.0.props.data.list") as
        | Record<string, any>
        | undefined
    ),
    cta: cloneValue(
      getPathValue(card, "props.slots.CTASlot.0.props.data.entityField")
    ),
  }),
};

const testimonialConfig: LegacyListSourceConfig = {
  listFieldName: "testimonials",
  mappingFieldName: "cards",
  linkedMappings: {
    description: "description",
    contributorName: "contributorName",
    contributionDate: "contributionDate",
  },
  extractManualItem: (card) => ({
    description: cloneValue(
      getPathValue(card, "props.slots.DescriptionSlot.0.props.data.text")
    ),
    contributorName: cloneValue(
      getPathValue(card, "props.slots.ContributorNameSlot.0.props.data.text")
    ),
    contributionDate: cloneValue(
      getPathValue(card, "props.slots.ContributionDateSlot.0.props.data.date")
    ),
  }),
};

const faqConfig: LegacyListSourceConfig = {
  listFieldName: "faqs",
  mappingFieldName: "faqs",
  linkedMappings: {
    question: "question",
    answer: "answer",
  },
  extractManualItem: (card) => ({
    question: cloneValue(
      getPathValue(card, "props.data.question") ??
        getPathValue(
          card,
          "props.slots.QuestionSlot.0.props.parentData.richText"
        )
    ),
    answer: cloneValue(
      getPathValue(card, "props.data.answer") ??
        getPathValue(card, "props.slots.AnswerSlot.0.props.parentData.richText")
    ),
  }),
};

export const scopedListSourceMappingsMigration: Migration = {
  EventCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateLegacyListSourceProps(props, streamDocument, eventConfig),
  },
  EventSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "EventCardsWrapper",
        eventConfig
      ),
  },
  FAQSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateLegacyListSourceProps(props, streamDocument, faqConfig),
  },
  ProductCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateLegacyListSourceProps(props, streamDocument, productConfig),
  },
  ProductSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "ProductCardsWrapper",
        productConfig
      ),
  },
  InsightCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateLegacyListSourceProps(props, streamDocument, insightConfig),
  },
  InsightSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "InsightCardsWrapper",
        insightConfig
      ),
  },
  TeamCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateLegacyListSourceProps(props, streamDocument, teamConfig),
  },
  TeamSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "TeamCardsWrapper",
        teamConfig
      ),
  },
  TestimonialCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateLegacyListSourceProps(props, streamDocument, testimonialConfig),
  },
  TestimonialSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "TestimonialCardsWrapper",
        testimonialConfig
      ),
  },
};
