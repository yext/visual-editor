import { msg } from "../../utils/i18n/platform.ts";
import {
  createStyledTextConfig,
  type StyledRichTextProps,
} from "./createStyledTextConfig.tsx";

export type { StyledRichTextProps };

export const StyledRichTextConfig = createStyledTextConfig({
  kind: "richText",
  label: msg("components.styledRichText", "Styled Rich Text"),
  includeColor: true,
});
