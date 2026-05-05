import { resolveField } from "../../utils/resolveYextEntityField.ts";
import { Migration } from "../../utils/migrate.ts";

/**
 * Normalizes an old repeated-item source to the new scoped list field and seeds
 * the mapping object expected by the mapped-items runtime.
 */
const migrateScopedMappings = (
  props: { id: string } & Record<string, any>,
  streamDocument: Record<string, unknown>,
  listFieldName: string,
  mappings: Record<string, string>,
  mappingFieldName = "cards"
) => {
  if (props.data?.constantValueEnabled || !props.data?.field) {
    return props;
  }

  const sourceField = props.data.field as string;
  const resolvedSource = resolveField<unknown>(
    streamDocument,
    sourceField
  ).value;
  const nextSourceField =
    sourceField.endsWith(`.${listFieldName}`) ||
    !resolvedSource ||
    typeof resolvedSource !== "object" ||
    !Array.isArray((resolvedSource as Record<string, unknown>)[listFieldName])
      ? sourceField
      : `${sourceField}.${listFieldName}`;

  return {
    ...props,
    data: {
      ...props.data,
      field: nextSourceField,
    },
    [mappingFieldName]: Object.fromEntries(
      Object.entries(mappings).map(([key, field]) => [
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
 * Upgrades a repeated-item wrapper stored inside a section slot so old
 * section-shaped fixtures still resolve into the new mapped-wrapper contract.
 */
const migrateScopedWrapperSlot = (
  props: { id: string } & Record<string, any>,
  streamDocument: Record<string, unknown>,
  slotName: string,
  wrapperType: string,
  listFieldName: string,
  mappings: Record<string, string>,
  mappingFieldName = "cards"
) => {
  const slot = props.slots?.[slotName];
  const wrapper = Array.isArray(slot) ? slot[0] : undefined;

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
          props: migrateScopedMappings(
            wrapper.props,
            streamDocument,
            listFieldName,
            mappings,
            mappingFieldName
          ),
        },
      ],
    },
  };
};

export const scopedListSourceMappingsMigration: Migration = {
  EventCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedMappings(props, streamDocument, "events", {
        title: "title",
        date: "dateTime",
        description: "description",
        cta: "cta",
        image: "image",
      }),
  },
  EventSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "EventCardsWrapper",
        "events",
        {
          title: "title",
          date: "dateTime",
          description: "description",
          cta: "cta",
          image: "image",
        }
      ),
  },
  FAQSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      props.slots?.FAQsWrapperSlot
        ? migrateScopedWrapperSlot(
            props,
            streamDocument,
            "FAQsWrapperSlot",
            "FAQsWrapperSlot",
            "faqs",
            {
              question: "question",
              answer: "answer",
            },
            "faqs"
          )
        : migrateScopedMappings(
            props,
            streamDocument,
            "faqs",
            {
              question: "question",
              answer: "answer",
            },
            "faqs"
          ),
  },
  ProductCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedMappings(props, streamDocument, "products", {
        image: "image",
        brow: "brow",
        name: "name",
        price: "price.value",
        description: "description",
        cta: "cta",
      }),
  },
  ProductSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "ProductCardsWrapper",
        "products",
        {
          image: "image",
          brow: "brow",
          name: "name",
          price: "price.value",
          description: "description",
          cta: "cta",
        }
      ),
  },
  InsightCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedMappings(props, streamDocument, "insights", {
        image: "image",
        name: "name",
        category: "category",
        publishTime: "publishTime",
        description: "description",
        cta: "cta",
      }),
  },
  InsightSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "InsightCardsWrapper",
        "insights",
        {
          image: "image",
          name: "name",
          category: "category",
          publishTime: "publishTime",
          description: "description",
          cta: "cta",
        }
      ),
  },
  TeamCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedMappings(props, streamDocument, "people", {
        headshot: "headshot",
        name: "name",
        title: "title",
        phoneNumber: "phoneNumber",
        email: "email",
        cta: "cta",
      }),
  },
  TeamSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "TeamCardsWrapper",
        "people",
        {
          headshot: "headshot",
          name: "name",
          title: "title",
          phoneNumber: "phoneNumber",
          email: "email",
          cta: "cta",
        }
      ),
  },
  TestimonialCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedMappings(props, streamDocument, "testimonials", {
        description: "description",
        contributorName: "contributorName",
        contributionDate: "contributionDate",
      }),
  },
  TestimonialSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedWrapperSlot(
        props,
        streamDocument,
        "CardsWrapperSlot",
        "TestimonialCardsWrapper",
        "testimonials",
        {
          description: "description",
          contributorName: "contributorName",
          contributionDate: "contributionDate",
        }
      ),
  },
};
