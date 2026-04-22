import * as React from "react";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { type LinkedEntitySchemas } from "../utils/linkedEntityFieldUtils.ts";
import { isDeepEqual } from "../utils/deepEqual.ts";

export type LinkedEntitySchemasPayload = {
  linkedEntitySchemas?: LinkedEntitySchemas;
};

/**
 * Receives linked entity schemas from the platform bridge and keeps them in a
 * dedicated store separate from the base entity schema.
 */
export const usePlatformBridgeLinkedEntitySchemas = () => {
  const [linkedEntitySchemas, setLinkedEntitySchemas] =
    React.useState<LinkedEntitySchemas | null>(null);

  useReceiveMessage(
    "getLinkedEntitySchemas",
    TARGET_ORIGINS,
    (send, payload: LinkedEntitySchemasPayload) => {
      const receivedSchemas =
        payload.linkedEntitySchemas &&
        Object.keys(payload.linkedEntitySchemas).length > 0
          ? payload.linkedEntitySchemas
          : null;

      setLinkedEntitySchemas((prev) =>
        isDeepEqual(receivedSchemas, prev) ? prev : receivedSchemas
      );

      send({
        status: "success",
        payload: { message: "getLinkedEntitySchemas received" },
      });
    }
  );

  return linkedEntitySchemas;
};

const LinkedEntitySchemasContext = React.createContext<
  LinkedEntitySchemas | null | undefined
>(undefined);

const useLinkedEntitySchemas = () => {
  const context = React.useContext(LinkedEntitySchemasContext);
  if (context === undefined) {
    throw new Error(
      "useLinkedEntitySchemas must be used within LinkedEntitySchemasContext.Provider"
    );
  }

  return context;
};

export { useLinkedEntitySchemas, LinkedEntitySchemasContext };
