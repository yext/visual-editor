export type YextSchemaField = {
  name: string;
  displayName?: string;
  definition: YextSchemaFieldDefinition;
  children?: {
    fields: YextSchemaField[];
  };
  optionFormat?: "OPTION_FORMAT_EXPANDED";
};

export type YextSchemaFieldDefinition = {
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
