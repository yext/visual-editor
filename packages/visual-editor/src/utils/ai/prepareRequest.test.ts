import { describe, expect, it } from "vitest";
import { createPreparePuckAiRequest } from "./prepareRequest.ts";
import { puckAiSystemContext } from "./systemPrompt.ts";
import type { StreamFields } from "../../types/entityFields.ts";

describe("createPreparePuckAiRequest", () => {
  it("adds entityContext with only non-empty fields and nested dot paths", async () => {
    const streamDocument = {
      name: "Acme",
      c_promo: {
        title: "Spring Sale",
        description: "",
      },
      c_emptyObject: {},
      c_emptyList: [],
    };
    const entityFields: StreamFields = {
      fields: [
        {
          name: "name",
          definition: {
            name: "name",
            typeName: "type.string",
            type: {},
          },
        },
        {
          name: "c_promo",
          definition: {
            name: "c_promo",
            typeName: "type.promo_section",
            type: {},
          },
          children: {
            fields: [
              {
                name: "title",
                definition: {
                  name: "title",
                  typeName: "type.string",
                  type: {},
                },
              },
              {
                name: "description",
                definition: {
                  name: "description",
                  typeName: "type.string",
                  type: {},
                },
              },
            ],
          },
        },
        {
          name: "c_emptyObject",
          definition: {
            name: "c_emptyObject",
            typeName: "type.string",
            type: {},
          },
        },
        {
          name: "c_emptyList",
          definition: {
            name: "c_emptyList",
            typeName: "type.string",
            type: {},
            isList: true,
          },
        },
      ],
    };

    const prepareRequest = createPreparePuckAiRequest({
      streamDocument,
      entityFields,
    });
    const result = await prepareRequest({
      body: {
        messages: [],
        config: {
          components: {
            BannerSection: {},
            FakeSection: {},
          } as any,
        },
      },
    });

    expect(result.body?.systemPrompt).toBe(puckAiSystemContext);
    expect(result.body?.entityContext).toEqual({
      fields: [
        {
          name: "c_promo",
          type: "type.promo_section",
          isList: false,
          value: { title: "Spring Sale", description: "" },
        },
        {
          name: "c_promo.title",
          type: "type.string",
          isList: false,
          value: "Spring Sale",
        },
        {
          name: "name",
          type: "type.string",
          isList: false,
          value: "Acme",
        },
      ],
    });
    expect(result.body?.config?.components).toEqual({
      BannerSection: {},
    });
  });

  it("still sets system prompt and entityContext when no config is provided", async () => {
    const prepareRequest = createPreparePuckAiRequest({
      streamDocument: { name: "Acme" },
      entityFields: {
        fields: [
          {
            name: "name",
            definition: {
              name: "name",
              typeName: "type.string",
              type: {},
            },
          },
        ],
      },
    });
    const result = await prepareRequest({ body: { messages: [] } });

    expect(result.body?.systemPrompt).toBe(puckAiSystemContext);
    expect(result.body?.entityContext).toEqual({
      fields: [
        {
          name: "name",
          type: "type.string",
          isList: false,
          value: "Acme",
        },
      ],
    });
  });

  it("treats rich text fields as terminal and does not include .html child paths", async () => {
    const prepareRequest = createPreparePuckAiRequest({
      streamDocument: {
        c_examplePromo: {
          description: {
            html: "<p>Promo description</p>",
          },
        },
      },
      entityFields: {
        fields: [
          {
            name: "c_examplePromo",
            definition: {
              name: "c_examplePromo",
              typeRegistryId: "type.promo_section",
              type: {},
            },
            children: {
              fields: [
                {
                  name: "description",
                  definition: {
                    name: "description",
                    typeRegistryId: "type.rich_text_v2",
                    type: {},
                  },
                  children: {
                    fields: [
                      {
                        name: "html",
                        definition: {
                          name: "html",
                          type: { stringType: "STRING_TYPE_HTML" },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const result = await prepareRequest({ body: { messages: [] } });
    const fieldNames = result.body?.entityContext?.fields.map(
      (field: { name: string }) => field.name
    );

    expect(fieldNames).toContain("c_examplePromo.description");
    expect(fieldNames).not.toContain("c_examplePromo.description.html");
  });
});
