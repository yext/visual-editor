import type { ThemeColorField } from "../ThemeColorField.tsx";
import type { ThemeColor } from "../../utils/themeConfigOptions.ts";
import {
  getSurfaceColorStyle,
  getThemeColorCssValue,
  type ResolvedSurfaceColor,
} from "../../utils/colors.ts";
import type { FieldTransformContext } from "./resolveValue.ts";

/** Resolves an authored theme color as CSS or as a surface with foreground. */
export function resolveThemeColor(
  field: ThemeColorField,
  value: ThemeColor | undefined,
  context: FieldTransformContext
): string | ResolvedSurfaceColor | undefined {
  if (field.options === "BACKGROUND_COLOR" && field.format === "surface") {
    return value?.selectedColor
      ? {
          themeColor: { ...value },
          ...getSurfaceColorStyle(value, context.streamDocument),
        }
      : undefined;
  }
  return getThemeColorCssValue(value);
}
