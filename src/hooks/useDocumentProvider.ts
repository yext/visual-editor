import { useReceiveMessage } from "../internal/hooks/useMessage.ts";
import { useState } from "react";
import { TARGET_ORIGINS } from "../components/Editor.tsx";

export const useDocumentProvider = () => {
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
