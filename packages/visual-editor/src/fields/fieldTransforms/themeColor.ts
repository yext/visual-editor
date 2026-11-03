import type { ThemeColor } from "../../utils/themeConfigOptions.ts";
import {
  getDefaultForegroundColor,
  getThemeColorCssValue,
  type ResolvedThemeColor,
} from "../../utils/colors.ts";
import type { FieldTransformContext } from "./resolveValue.ts";

/** Preserves authored tokens and resolves CSS values, deriving missing contrast from the stream document. */
export function resolveThemeColor(
  value: ThemeColor | undefined,
  context: FieldTransformContext
): ResolvedThemeColor | undefined {
  const selectedColorCss = getThemeColorCssValue(value);
  const contrastingColorCss = getThemeColorCssValue(
    getDefaultForegroundColor(value, context.streamDocument)
  );
  return value && selectedColorCss && contrastingColorCss
    ? { ...value, selectedColorCss, contrastingColorCss }
    : undefined;
}
