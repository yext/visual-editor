export type YextSchemaField = {
  name: string;
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
