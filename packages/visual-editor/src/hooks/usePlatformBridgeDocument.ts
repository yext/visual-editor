import {
  useReceiveMessage,
  TARGET_ORIGINS,
} from "../internal/hooks/useMessage.ts";
import { useState } from "react";

export const usePlatformBridgeDocument = () => {
  const [entityDocument, setEntityDocument] = useState<any>(); // json data

  useReceiveMessage("getEntityDocument", TARGET_ORIGINS, (send, payload) => {
    setEntityDocument(payload);
    send({
      status: "success",
      payload: { message: "getEntityDocument received" },
    });
  });

  return entityDocument;
};
