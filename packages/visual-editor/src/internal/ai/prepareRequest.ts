import { enabledAiComponentSet } from "./enabledComponents.ts";
import {
  testCTAFieldAiDescription,
  testCTAFieldAiSchema,
  testEntityFieldAiDescription,
  testEntityFieldAiSchema,
  testImageFieldAiDescription,
  testImageFieldAiSchema,
  testRichTextFieldAiDescription,
  testRichTextFieldAiSchema,
} from "./fieldTypes.ts";
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
  type: "string",
};

const ctaSelectorFieldSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    selectedType: { type: "string" },
    constantValue: {
      type: "object",
      properties: {},
    },
  },
};

const imageFieldSchema = {
  type: "object",
  properties: {
    url: { type: "string" },
    height: { type: "number" },
    width: { type: "number" },
    alternateText: translatableStringFieldSchema,
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
    return mergeAiConfig(annotatedField, {
      schema: testEntityFieldAiSchema,
      instructions: testEntityFieldAiDescription,
    });
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
    return mergeAiConfig(annotatedField, {
      schema: testCTAFieldAiSchema,
      instructions: testCTAFieldAiDescription,
    });
  }

  if (field.type === "image") {
    return mergeAiConfig(annotatedField, { schema: imageFieldSchema });
  }

  if (field.type === "testImage") {
    return mergeAiConfig(annotatedField, {
      schema: testImageFieldAiSchema,
      instructions: testImageFieldAiDescription,
    });
  }

  if (field.type === "testRichText") {
    return mergeAiConfig(annotatedField, {
      schema: testRichTextFieldAiSchema,
      instructions: testRichTextFieldAiDescription,
    });
  }

  if (field.type === "video") {
    return mergeAiConfig(annotatedField, { schema: videoFieldSchema });
  }

  if (field.type === "custom") {
    return mergeAiConfig(annotatedField, { exclude: true });
  }

  if (field.type === "code") {
    return mergeAiConfig(annotatedField, { exclude: true });
  }

  if (field.type === "object" && field.objectFields) {
    const objectFields: Record<string, any> = {};

    for (const entry of Object.entries(field.objectFields)) {
      const nestedFieldName = entry[0];
      const nestedField = entry[1];
      objectFields[nestedFieldName] = prepareField(
        nestedField as Record<string, any>
      );
    }

    annotatedField.objectFields = objectFields;
  }

  if (field.type === "array" && field.arrayFields) {
    const arrayFields: Record<string, any> = {};

    for (const entry of Object.entries(field.arrayFields)) {
      const nestedFieldName = entry[0];
      const nestedField = entry[1];
      arrayFields[nestedFieldName] = prepareField(
        nestedField as Record<string, any>
      );
    }

    annotatedField.arrayFields = arrayFields;
  }

  return annotatedField;
};

export const preparePuckAiConfig = (
  config: Record<string, any> | undefined
): Record<string, any> | undefined => {
  if (!config?.components) {
    return config;
  }

  const components: Record<string, any> = {};

  for (const entry of Object.entries(config.components)) {
    const componentName = entry[0];
    const componentConfig = entry[1];

    if (!enabledAiComponentSet.has(componentName)) {
      continue;
    }

    const typedComponentConfig = componentConfig as Record<string, any>;
    let fields = typedComponentConfig.fields;

    if (typedComponentConfig.fields) {
      fields = {};

      for (const fieldEntry of Object.entries(typedComponentConfig.fields)) {
        const fieldName = fieldEntry[0];
        const field = fieldEntry[1];
        fields[fieldName] = prepareField(field as Record<string, any>);
      }
    }

    components[componentName] = {
      ...typedComponentConfig,
      ...(fields ? { fields } : {}),
    };
  }

  return {
    ...config,
    components,
    root: undefined,
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
      config: preparePuckAiConfig(opts.body?.config),
    },
  };
};
