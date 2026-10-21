import type { Content } from "../shared/authoredValues.ts";

/** Only an empty page or a single empty MainContent scaffold can be generated. */
export const isBlankGenerationPage = (data: Content): boolean =>
  !Object.values(data.zones ?? {}).some(
    (items) => !Array.isArray(items) || items.length
  ) &&
  (data.content.length === 0 ||
    (data.content.length === 1 &&
      data.content[0]?.type === "MainContent" &&
      Array.isArray(data.content[0].props?.content) &&
      data.content[0].props.content.length === 0));
