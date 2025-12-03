import { useState } from "react";
import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { normalizeLocalesInObject } from "../utils/normalizeLocale.ts";
import { isDeepEqual } from "../utils/deepEqual.ts";

export const usePlatformBridgeDocument = () => {
  const [entityDocument, setEntityDocument] = useState<any>(); // json data

  useReceiveMessage("getEntityDocument", TARGET_ORIGINS, (send, payload) => {
    const receivedDocument = normalizeLocalesInObject(payload);
    if (!isDeepEqual(entityDocument, receivedDocument)) {
      setEntityDocument(receivedDocument);
    }

    send({
      status: "success",
      payload: { message: "getEntityDocument received" },
    });
  });

  return entityDocument;
};
