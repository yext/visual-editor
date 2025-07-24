import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { normalizeLocalesInObject } from "../utils/normalizeLocale.ts";
import { useState } from "react";

export const usePlatformBridgeDocument = () => {
  const [entityDocument, setEntityDocument] = useState<any>(); // json data

  useReceiveMessage("getEntityDocument", TARGET_ORIGINS, (send, payload) => {
    setEntityDocument(normalizeLocalesInObject(payload));
    send({
      status: "success",
      payload: { message: "getEntityDocument received" },
    });
  });

  return entityDocument;
};
