export * from "./hooks/index.ts";
export * from "./utils/index.ts";
export * from "./types/index.ts";
export * from "./editor/index.ts";
export * from "./components/index.ts";

// Ensure i18n is automatically initialized
import { i18nInit } from "./utils/i18n.ts";
i18nInit();
