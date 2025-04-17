export type YextSchemaField = {
  name: string;
  displayName?: string;
  definition: YextFieldDefinition;
  children?: {
    fields: YextSchemaField[];
  };
};

export type YextFieldDefinition = {
  name: string;
  isList?: boolean;
  registryId?: string;
  typeName?: string;
  typeRegistryId?: string;
  type: Record<string, string>;
};

export type StreamFields = {
  fields: YextSchemaField[];
  displayNames?: Record<string, string>;
};
