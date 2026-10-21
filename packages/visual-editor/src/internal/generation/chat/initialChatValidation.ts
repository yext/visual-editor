import type { PuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import {
  buildEditInventory,
  validateAuthored,
  type Content,
} from "../authored.ts";

/** Give existing-layout validation failures an actionable section name. */
export const validateInitialChatLayout = (
  catalog: PuckGenerationCatalog,
  data: Content,
  sectionLabel: (type: string) => string
) => {
  try {
    validateAuthored(catalog, data);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    let sectionType: string | undefined;
    try {
      const { components } = buildEditInventory(catalog, data);
      const invalid = components.find(
        (item) =>
          message.includes(`(${item.componentId})`) ||
          message.includes(`, ${item.componentId})`)
      );
      sectionType = components.find(
        (item) => item.componentId === invalid?.sectionId
      )?.type;
    } catch {
      // Malformed trees may not provide enough information to name a section.
    }
    if (sectionType) {
      throw new Error(
        `${message}\n\nTry deleting the ${sectionLabel(sectionType)} section.`
      );
    }
    throw cause;
  }
};
