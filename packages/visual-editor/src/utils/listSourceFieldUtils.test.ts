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
});
