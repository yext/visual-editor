import { msg } from "../../utils/i18n/platform.ts";
import {
  createStyledTextConfig,
  type StyledPlainTextProps,
} from "./createStyledTextConfig.tsx";

export type { StyledPlainTextProps };

export const StyledPlainTextConfig = createStyledTextConfig({
  kind: "plain",
  label: msg("components.styledPlainText", "Styled Plain Text"),
  includeColor: true,
  tagOptions: [
    "span",
    "p",
    "strong",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ],
});
