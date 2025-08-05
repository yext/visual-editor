import { msg } from "../utils/i18n/platform";
import { ThemeOptions } from "../utils/themeConfigOptions";

/**
 * getMaxWidthOptions returns a list of options including the theme max width,
 * any widths greater than the theme value, or full width.
 */
export const getMaxWidthOptions = () => {
  const maxWidthOptions = ThemeOptions.MAX_WIDTH;
  if (typeof window === "undefined") {
    // return all options if no variable provided, or not in browser
    return maxWidthOptions;
  }

  // get the theme values
  const styleElement = window.document?.getElementById(
    "visual-editor-theme"
  ) as HTMLStyleElement;

  if (!styleElement) {
    return maxWidthOptions;
  }

  const { options, themeValue } = filterMaxWidths(styleElement);

  return [
    {
      label: msg(
        "fields.options.matchOtherSections",
        `Match Other Sections ({{value}})`,
        { value: themeValue }
      ),
      value: "theme",
    },
    ...options,
    {
      label: msg("fields.options.fullWidth", "Full Width"),
      value: "fullWidth",
    },
  ];
};

/**
 * filterMaxWidths extracts the theme max width and filters ThemeOptions.MAX_WIDTH
 * to options greater than the theme value
 * @param styleElement the "visual-editor-theme" style tag
 * @returns the current theme value in the form "1000px" and the ThemeOptions.MAX_WIDTH
 * that are greater than that value
 */
export const filterMaxWidths = (
  styleElement: HTMLStyleElement
): {
  themeValue: string | undefined;
  options: typeof ThemeOptions.MAX_WIDTH;
} => {
  const cssVariable = "--maxWidth-pageSection-contentWidth";
  const maxWidthOptions = ThemeOptions.MAX_WIDTH;
  const styleContent = styleElement?.textContent || styleElement?.innerHTML;

  if (!styleContent) {
    return { themeValue: undefined, options: maxWidthOptions };
  }

  const regex = new RegExp(
    `${cssVariable.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*:\\s*(\\d+)px`,
    "i"
  );
  const maxWidthValue = Number(styleContent.match(regex)?.[1]);

  if (!maxWidthValue || isNaN(maxWidthValue)) {
    return { themeValue: undefined, options: maxWidthOptions };
  }

  return {
    themeValue: maxWidthValue + "px",
    options: maxWidthOptions.filter((o) => {
      return Number(o.value.replace("px", "")) > maxWidthValue;
    }),
  };
};
