import { createAiPlugin } from "@puckeditor/plugin-ai";
import { enabledAiComponents } from "./enabledComponents.ts";
import { puckAiSystemContext } from "./systemPrompt.ts";
import { getFilteredEntityFields } from "../../internal/utils/getFilteredEntityFields.ts";
import type {
  StreamFields,
  YextSchemaField,
} from "../../types/entityFields.ts";

type PrepareRequestFn = NonNullable<
  Exclude<Parameters<typeof createAiPlugin>[0], undefined>["prepareRequest"]
>;

type EntityContextField = {
  name: string;
  type: string;
  isList: boolean;
  value: unknown;
};

type EntityContext = {
  fields: EntityContextField[];
};

type CreatePreparePuckAiRequestParams = {
  streamDocument?: Record<string, any> | null;
  entityFields?: StreamFields | null;
};

const resolvePath = (
  obj: Record<string, any> | null | undefined,
  path: string
): unknown => {
  if (!obj || !path) {
    return undefined;
  }

  return path.split(".").reduce<unknown>((current, level) => {
    if (current && typeof current === "object" && level in current) {
      return (current as Record<string, unknown>)[level];
    }
    return undefined;
  }, obj);
};

const isEmptyValue = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
};

const getFieldType = (field: YextSchemaField): string | undefined => {
  return (
    field.definition.typeName ||
    field.definition.typeRegistryId ||
    (field.definition.type &&
      Object.entries(field.definition.type)[0]?.[1]?.toString())
  );
};

const getSchemaFieldsForEntityContext = (
  entityFields?: StreamFields | null
): YextSchemaField[] => {
  if (!entityFields) {
    return [];
  }

  const fieldsByName = new Map<string, YextSchemaField>();
  const pendingListParents: string[] = [];
  const queuedListParents = new Set<string>();

  const collect = (fields: YextSchemaField[]) => {
    for (const field of fields) {
      if (!fieldsByName.has(field.name)) {
        fieldsByName.set(field.name, field);
      }

      if (field.definition.isList && !queuedListParents.has(field.name)) {
        queuedListParents.add(field.name);
        pendingListParents.push(field.name);
      }
    }
  };

  collect(getFilteredEntityFields<Record<string, any>>(entityFields, {}));
  collect(
    getFilteredEntityFields<Record<string, any>>(entityFields, {
      includeListsOnly: true,
    })
  );

  while (pendingListParents.length > 0) {
    const listParentName = pendingListParents.shift();
    if (!listParentName) {
      continue;
    }

    collect(
      getFilteredEntityFields<Record<string, any>>(entityFields, {
        directChildrenOf: listParentName,
      })
    );
    collect(
      getFilteredEntityFields<Record<string, any>>(entityFields, {
        directChildrenOf: listParentName,
        includeListsOnly: true,
      })
    );
  }

  const richTextFieldNames = new Set(
    Array.from(fieldsByName.values())
      .filter((field) => getFieldType(field) === "type.rich_text_v2")
      .map((field) => field.name)
  );

  return Array.from(fieldsByName.values()).filter((field) => {
    for (const richTextFieldName of richTextFieldNames) {
      if (
        field.name !== richTextFieldName &&
        field.name.startsWith(`${richTextFieldName}.`)
      ) {
        return false;
      }
    }
    return true;
  });
};

const buildEntityContext = ({
  entityFields,
  streamDocument,
}: CreatePreparePuckAiRequestParams): EntityContext => {
  const collectedFields: EntityContextField[] = [];

  for (const field of getSchemaFieldsForEntityContext(entityFields)) {
    const type = getFieldType(field);
    if (!type) {
      continue;
    }

    const value = resolvePath(streamDocument ?? null, field.name);
    if (isEmptyValue(value)) {
      continue;
    }

    collectedFields.push({
      name: field.name,
      type,
      isList: !!field.definition.isList,
      value,
    });
  }

  collectedFields.sort((a, b) => a.name.localeCompare(b.name));

  return { fields: collectedFields };
};

/** Transform the Chat request before sending it to the backend */
export const createPreparePuckAiRequest =
  ({
    streamDocument,
    entityFields,
  }: CreatePreparePuckAiRequestParams = {}): PrepareRequestFn =>
  (opts) => {
    let updatedOpts = { ...opts };

    if (!updatedOpts.body) {
      updatedOpts.body = {};
    }

    updatedOpts.body.systemPrompt = puckAiSystemContext;
    updatedOpts.body.entityContext = buildEntityContext({
      streamDocument,
      entityFields,
    });

    if (!updatedOpts.body?.config?.components) {
      return updatedOpts;
    }

    updatedOpts.body.config.components = Object.fromEntries(
      Object.entries(updatedOpts.body.config.components).filter(([component]) =>
        (enabledAiComponents as string[]).includes(component)
      )
    );

    return updatedOpts;
  };
