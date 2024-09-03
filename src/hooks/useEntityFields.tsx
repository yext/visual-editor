import * as React from "react";
import { useReceiveMessage } from "../internal/hooks/useMessage.ts";
import { useState } from "react";
import { TARGET_ORIGINS } from "../components/Editor.tsx";

/**
 * Under the hood we receive a Stream for a template, but we expose
 * hooks with a more user-friendly name.
 */
export const usePlatformBridgeEntityFields = () => {
  const [templateStream, setTemplateStream] = useState<any>(undefined);

  useReceiveMessage("getTemplateStream", TARGET_ORIGINS, (send, payload) => {
    setTemplateStream(payload);
    send({
      status: "success",
      payload: { message: "templateStream received" },
    });
  });

  return templateStream as EntityFields;
};

const EntityFieldsContext = React.createContext<EntityFields | undefined>(
  undefined
);

type EntityFieldsProviderProps = {
  entityFields: EntityFields;
  children: React.ReactNode;
};

export const EntityFieldsProvider = ({
  entityFields,
  children,
}: EntityFieldsProviderProps) => {
  return (
    <EntityFieldsContext.Provider value={entityFields}>
      {children}
    </EntityFieldsContext.Provider>
  );
};

export const useEntityFields = () => {
  const context = React.useContext(EntityFieldsContext);
  if (!context) {
    throw new Error("useEntityFields must be used within a DocumentProvider");
  }

  return context;
};

export type EntityFields = {
  stream: Stream;
};

export type Stream = {
  expression: {
    fields: Field[];
  };
};

export type Field = {
  name: string;
  children: {
    fields: Field[];
  };
};
