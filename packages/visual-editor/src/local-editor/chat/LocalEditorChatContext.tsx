import React from "react";
import type { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";

/** Present only when the local editor shell has chat enabled. */
export const LocalEditorChatContext =
  React.createContext<LocalEditorChatCanvas | null>(null);
