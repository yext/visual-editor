import React from "react";
import type { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";

/** Present only while layout generation is enabled. */
export const LayoutGenerationChatContext =
  React.createContext<LayoutGenerationChatCanvas | null>(null);
