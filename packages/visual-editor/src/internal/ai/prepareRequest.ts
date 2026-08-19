import { enabledAiComponentSet } from "./enabledComponents.ts";
import { puckAiSystemContext } from "./systemPrompt.ts";

const entityFieldSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    constantValue: {
      type: "object",
      properties: {},
    },
  },
};

const basicSelectorFieldSchema = {
  anyOf: [
    { type: "string" },
    {
      type: "object",
      properties: {
        selectedColor: { type: "string" },
        contrastingColor: { type: "string" },
        isDarkColor: { type: "boolean" },
      },
    },
  ],
};

const translatableStringFieldSchema = {
  anyOf: [
    { type: "string" },
    {
      type: "object",
      properties: {
        hasLocalizedValue: { type: "string" },
        defaultValue: { type: "string" },
        en: { type: "string" },
        es: { type: "string" },
        fr: { type: "string" },
      },
    },
  ],
};

const ctaSelectorFieldSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    selectedType: {
      enum: ["textAndLink", "getDirections", "presetImage"],
    },
    constantValue: {
      anyOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            ctaType: {
              enum: ["textAndLink", "getDirections", "presetImage"],
            },
            label: translatableStringFieldSchema,
            link: translatableStringFieldSchema,
          },
        },
      ],
    },
  },
};

const imageFieldSchema = {
  anyOf: [
    {
      type: "object",
      properties: {
        url: { type: "string" },
        height: { type: "number" },
        width: { type: "number" },
        alternateText: translatableStringFieldSchema,
      },
    },
    {
      type: "object",
      properties: {
        hasLocalizedValue: { type: "string" },
        defaultValue: {
          type: "object",
          properties: {
            url: { type: "string" },
            height: { type: "number" },
            width: { type: "number" },
            alternateText: translatableStringFieldSchema,
          },
        },
        en: {
          type: "object",
          properties: {
            url: { type: "string" },
            height: { type: "number" },
            width: { type: "number" },
            alternateText: translatableStringFieldSchema,
          },
        },
        es: {
          type: "object",
          properties: {
            url: { type: "string" },
            height: { type: "number" },
            width: { type: "number" },
            alternateText: translatableStringFieldSchema,
          },
        },
        fr: {
          type: "object",
          properties: {
            url: { type: "string" },
            height: { type: "number" },
            width: { type: "number" },
            alternateText: translatableStringFieldSchema,
          },
        },
      },
    },
  ],
};

const testImageFieldSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    constantValue: imageFieldSchema,
  },
};

const videoFieldSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    videoDescription: { type: "string" },
    video: {
      type: "object",
      properties: {
        url: { type: "string" },
        id: { type: "string" },
        title: { type: "string" },
        thumbnail: { type: "string" },
        duration: { type: "string" },
        embeddedUrl: { type: "string" },
      },
    },
  },
};

const mergeAiConfig = (
  field: Record<string, any>,
  ai: Record<string, unknown>
) => {
  return {
    ...field,
    ai: { ...field.ai, ...ai },
  };
};

const prepareField = (field: Record<string, any>): Record<string, any> => {
  const annotatedField = { ...field };

  if (field.type === "entityField") {
    return mergeAiConfig(annotatedField, { schema: entityFieldSchema });
  }

  if (field.type === "testEntityField") {
    return mergeAiConfig(annotatedField, { schema: entityFieldSchema });
  }

  if (field.type === "basicSelector") {
    return mergeAiConfig(annotatedField, { schema: basicSelectorFieldSchema });
  }

  if (field.type === "translatableString") {
    return mergeAiConfig(annotatedField, {
      schema: translatableStringFieldSchema,
    });
  }

  if (field.type === "ctaSelector") {
    return mergeAiConfig(annotatedField, { schema: ctaSelectorFieldSchema });
  }

  if (field.type === "testCTA") {
    return mergeAiConfig(annotatedField, { schema: ctaSelectorFieldSchema });
  }

  if (field.type === "image") {
    return mergeAiConfig(annotatedField, { schema: imageFieldSchema });
  }

  if (field.type === "testImage") {
    return mergeAiConfig(annotatedField, { schema: testImageFieldSchema });
  }

  if (field.type === "video") {
    return mergeAiConfig(annotatedField, { schema: videoFieldSchema });
  }

  if (field.type === "custom") {
    return mergeAiConfig(annotatedField, { exclude: true });
  }

  if (field.type === "object" && field.objectFields) {
    annotatedField.objectFields = Object.fromEntries(
      Object.entries(field.objectFields).map(
        ([nestedFieldName, nestedField]) => {
          return [
            nestedFieldName,
            prepareField(nestedField as Record<string, any>),
          ];
        }
      )
    );
  }

  if (field.type === "array" && field.arrayFields) {
    annotatedField.arrayFields = Object.fromEntries(
      Object.entries(field.arrayFields).map(
        ([nestedFieldName, nestedField]) => {
          return [
            nestedFieldName,
            prepareField(nestedField as Record<string, any>),
          ];
        }
      )
    );
  }

  return annotatedField;
};

const prepareConfig = (
  config: Record<string, any> | undefined
): Record<string, any> | undefined => {
  if (!config?.components) {
    return config;
  }

  const components = Object.fromEntries(
    Object.entries(config.components)
      .filter(([componentName]) => enabledAiComponentSet.has(componentName))
      .map(([componentName, componentConfig]) => {
        const typedComponentConfig = componentConfig as Record<string, any>;
        const fields = typedComponentConfig.fields
          ? Object.fromEntries(
              Object.entries(typedComponentConfig.fields).map(
                ([fieldName, field]) => [
                  fieldName,
                  prepareField(field as Record<string, any>),
                ]
              )
            )
          : typedComponentConfig.fields;

        return [
          componentName,
          {
            ...typedComponentConfig,
            ...(fields ? { fields } : {}),
          },
        ];
      })
  );

  const root = config.root
    ? {
        ...config.root,
        fields: config.root.fields
          ? Object.fromEntries(
              Object.entries(config.root.fields).map(([fieldName, field]) => {
                return [fieldName, prepareField(field as Record<string, any>)];
              })
            )
          : config.root.fields,
      }
    : config.root;

  return {
    ...config,
    components,
    root,
  };
};

/** Transform the chat request before sending it to the backend. */
export const preparePuckAiRequest = async <
  T extends {
    body?: {
      config?: Record<string, any>;
      systemPrompt?: string;
    };
  },
>(
  opts: T
): Promise<T> => {
  return {
    ...opts,
    body: {
      ...opts.body,
      systemPrompt: puckAiSystemContext,
      config: prepareConfig(opts.body?.config),
    },
  };
};
