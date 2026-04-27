import { describe, expect, it } from "vitest";
import {
  getListSourceSelectorOptions,
  resolveMappedListItems,
} from "./listSourceFieldUtils.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { type LinkedEntitySchemas } from "./linkedEntityFieldUtils.ts";

const entityFields: StreamFields = {
  fields: [
    {
      name: "c_faqSection",
      displayName: "FAQ Section",
      definition: {
        name: "c_faqSection",
        typeName: "type.faq_section",
        type: {
          objectType: "OBJECT_TYPE_DEFAULT",
        },
      },
    },
  ],
};

const productEntityFields: StreamFields = {
  fields: [
    {
      name: "c_productSection",
      displayName: "Product Section",
      definition: {
        name: "c_productSection",
        typeName: "type.products_section",
        type: {
          objectType: "OBJECT_TYPE_DEFAULT",
        },
      },
    },
  ],
};

const linkedEntitySchemas: LinkedEntitySchemas = {
  c_linkedLocation: {
    displayName: "Linked Location",
    fields: [
      {
        name: "linkedFAQs",
        displayName: "Linked FAQs",
        definition: {
          name: "linkedFAQs",
          isList: true,
          type: {
            documentType: "DOCUMENT_TYPE_ENTITY",
          },
        },
        children: {
          fields: [
            {
              name: "question",
              displayName: "Question",
              definition: {
                name: "question",
                typeName: "type.string",
                type: {},
              },
            },
            {
              name: "answerV2",
              displayName: "Answer",
              definition: {
                name: "answerV2",
                typeName: "type.rich_text_v2",
                type: {},
              },
            },
          ],
        },
      },
      {
        name: "linkedProducts",
        displayName: "Linked Products",
        definition: {
          name: "linkedProducts",
          isList: true,
          type: {
            documentType: "DOCUMENT_TYPE_ENTITY",
          },
        },
        children: {
          fields: [
            {
              name: "name",
              displayName: "Name",
              definition: {
                name: "name",
                typeName: "type.string",
                type: {},
              },
            },
            {
              name: "description",
              displayName: "Description",
              definition: {
                name: "description",
                typeName: "type.rich_text_v2",
                type: {},
              },
            },
            {
              name: "image",
              displayName: "Image",
              definition: {
                name: "image",
                typeName: "type.image",
                type: {},
              },
            },
          ],
        },
      },
    ],
  },
};

describe("getListSourceSelectorOptions", () => {
  it("includes linked list sources alongside legacy section fields", () => {
    const result = getListSourceSelectorOptions({
      entityFields,
      linkedEntitySchemas,
      legacySourceFilter: {
        types: ["type.faq_section"],
      },
      mappingConfigs: [
        {
          key: "question",
          label: "Question",
          types: ["type.string", "type.rich_text_v2"],
        },
        {
          key: "answer",
          label: "Answer",
          types: ["type.rich_text_v2"],
        },
      ],
    });

    expect(result.listSourceFieldNames.has("c_linkedLocation.linkedFAQs")).toBe(
      true
    );
    expect(
      result.mappingOptionsBySourceField["c_linkedLocation.linkedFAQs"]
    ).toEqual({
      question: [
        {
          label: "Linked Location > Linked FAQs > Answer",
          value: "answerV2",
        },
        {
          label: "Linked Location > Linked FAQs > Question",
          value: "question",
        },
      ],
      answer: [
        {
          label: "Linked Location > Linked FAQs > Answer",
          value: "answerV2",
        },
      ],
    });
  });

  it("includes product-shaped linked list sources with required and optional mappings", () => {
    const result = getListSourceSelectorOptions({
      entityFields: productEntityFields,
      linkedEntitySchemas,
      legacySourceFilter: {
        types: ["type.products_section"],
      },
      mappingConfigs: [
        {
          key: "name",
          label: "Name",
          types: ["type.string"],
        },
        {
          key: "description",
          label: "Description",
          required: false,
          types: ["type.rich_text_v2"],
        },
        {
          key: "image",
          label: "Image",
          required: false,
          types: ["type.image"],
        },
      ],
    });

    expect(
      result.listSourceFieldNames.has("c_linkedLocation.linkedProducts")
    ).toBe(true);
    expect(
      result.mappingOptionsBySourceField["c_linkedLocation.linkedProducts"]
    ).toEqual({
      name: [
        {
          label: "Linked Location > Linked Products > Name",
          value: "name",
        },
      ],
      description: [
        {
          label: "Linked Location > Linked Products > Description",
          value: "description",
        },
      ],
      image: [
        {
          label: "Linked Location > Linked Products > Image",
          value: "image",
        },
      ],
    });
  });
});

describe("resolveMappedListItems", () => {
  it("maps relative fields against each resolved list item", () => {
    const result = resolveMappedListItems(
      {
        c_linkedLocation: [
          {
            linkedFAQs: [
              { question: "One", answerV2: { html: "<p>First</p>" } },
              { question: "Two", answerV2: { html: "<p>Second</p>" } },
            ],
          },
        ],
      },
      "c_linkedLocation.linkedFAQs",
      {
        question: "question",
        answer: "answerV2",
      },
      (resolvedItemFields) => ({
        question: resolvedItemFields.question,
        answer: resolvedItemFields.answer,
      })
    );

    expect(result).toEqual([
      {
        question: "One",
        answer: { html: "<p>First</p>" },
      },
      {
        question: "Two",
        answer: { html: "<p>Second</p>" },
      },
    ]);
  });

  it("maps product-shaped relative fields against each resolved list item", () => {
    const result = resolveMappedListItems(
      {
        c_linkedLocation: [
          {
            linkedProducts: [
              {
                name: "One",
                description: { html: "<p>First</p>" },
                image: { url: "https://example.com/1.jpg" },
              },
              {
                name: "Two",
                description: { html: "<p>Second</p>" },
                image: { url: "https://example.com/2.jpg" },
              },
            ],
          },
        ],
      },
      "c_linkedLocation.linkedProducts",
      {
        name: "name",
        description: "description",
        image: "image",
      },
      (resolvedItemFields) => ({
        name: resolvedItemFields.name,
        description: resolvedItemFields.description,
        image: resolvedItemFields.image,
      })
    );

    expect(result).toEqual([
      {
        name: "One",
        description: { html: "<p>First</p>" },
        image: { url: "https://example.com/1.jpg" },
      },
      {
        name: "Two",
        description: { html: "<p>Second</p>" },
        image: { url: "https://example.com/2.jpg" },
      },
    ]);
  });
});
