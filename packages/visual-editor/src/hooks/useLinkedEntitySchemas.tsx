import * as React from "react";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { type LinkedEntitySchemas } from "../utils/linkedEntityFieldUtils.ts";
import { isDeepEqual } from "../utils/deepEqual.ts";
import { DevLogger } from "../utils/devLogger.ts";

const devLogger = new DevLogger();

export type LinkedEntitySchemasPayload = {
  linkedEntitySchemas?: LinkedEntitySchemas;
};

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

      devLogger.logData("LINKED_ENTITY_SCHEMAS", receivedSchemas);

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

export const LinkedEntitySchemasContext = React.createContext<
  LinkedEntitySchemas | null | undefined
>(undefined);

export const useLinkedEntitySchemas = () => {
  const context = React.useContext(LinkedEntitySchemasContext);
  if (context === undefined) {
    throw new Error(
      "useLinkedEntitySchemas must be used within LinkedEntitySchemasContext.Provider"
    );
  }

  return context;
};
