import { resolveField } from "../../utils/resolveYextEntityField.ts";
import { Migration } from "../../utils/migrate.ts";

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
  FAQSection: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedMappings(
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
  TestimonialCardsWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) =>
      migrateScopedMappings(props, streamDocument, "testimonials", {
        description: "description",
        contributorName: "contributorName",
        contributionDate: "contributionDate",
      }),
  },
};
