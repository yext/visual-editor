export type YextEntityFields = {
  stream: YextStream;
};

export type YextStream = {
  expression?: {
    fields: YextEntityField[];
  };
  schema: YextSchema;
};

export type YextEntityField = {
  name: string;
  fullObject?: boolean;
  children?: {
    fields: YextEntityField[];
  };
};

export type YextSchema = {
  fields: YextSchemaField[];
};

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
