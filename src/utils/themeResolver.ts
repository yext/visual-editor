export type CoreStyle =
  | {
      label: string;
      type: "number";
      default: number;
    }
  | {
      label: string;
      type: "select";
      default: string;
      options: StyleSelectOption[];
    }
  | {
      label: string;
      type: "color";
      default: string;
    };

export type Style = CoreStyle & { plugin: string };

export type StyleSelectOption = {
  label: string;
  value: string;
};

export type StyleGroup = {
  label: string;
  plugin: string;
  styles: { [key: string]: CoreStyle };
};

export type ThemeConfigSection = {
  label: string;
  styles: { [key: string]: Style | StyleGroup };
};

export type ThemeConfig = {
  [key: string]: ThemeConfigSection;
};

export type TailwindConfig = {
  [key: string]: {
    [key: string]: any;
  };
};

export const convertToTailwindConfig = (
  themeConfig: ThemeConfig
): TailwindConfig => {
  const output: TailwindConfig = {};

  for (const themeSectionKey in themeConfig) {
    const themeSectionStyles = themeConfig[themeSectionKey].styles;

    for (const styleKey in themeSectionStyles) {
      const style = themeSectionStyles[styleKey];

      if (!output[style.plugin]) {
        // add theme extension to tailwindConfig if it does not exist
        output[style.plugin] = {};
      }

      if ("default" in style) {
        // If it's type Style, assign a class name and CSS variable
        output[style.plugin][`${themeSectionKey}-${styleKey}`] =
          `var(--${style.plugin}-${themeSectionKey}-${styleKey})`;
      } else if ("styles" in style) {
        // If it's type StyleGroup, construct an object with class names and CSS variables
        const styleGroupValues: Record<string, any> = {};

        for (const subkey in style.styles) {
          styleGroupValues[subkey] =
            `var(--${style.plugin}-${themeSectionKey}-${styleKey}-${subkey})`;
        }

        // add the object extension to the tailwindConfig
        output[style.plugin][`${themeSectionKey}-${styleKey}`] =
          styleGroupValues;
      }
    }
  }

  return output;
};

type PlainObject = Record<string, any>;

/**
 * Merges two objects deeply, giving priority to properties from the first object.
 */
export const deepMerge = <T extends PlainObject, U extends PlainObject>(
  obj1: T,
  obj2: U
): T & U => {
  const result: PlainObject = { ...obj2 }; // Start with a shallow copy of obj2

  for (const key in obj1) {
    if (key in obj1) {
      const value1 = obj1[key];
      const value2 = result[key];

      if (isObject(value1) && isObject(value2)) {
        // If both values are objects, merge them recursively
        result[key] = deepMerge(value1, value2);
      } else {
        // Otherwise, prioritize obj2's value
        if (value1 && value2) {
          console.warn(
            `Both theme.config.ts and tailwind.config.ts provided a value for ${key}. Using the value from theme.config.ts (${value2})`
          );
        }
        result[key] = value2 ?? value1;
      }
    }
  }

  return result as T & U;
};

const isObject = (value: any): value is PlainObject => {
  return value !== null && typeof value === "object";
};

/**
 * Merges the developer-specified theming and the marketer-specified theming,
 * giving priority to the developer-specified theming.
 */
export const themeResolver = (
  developerTheming: TailwindConfig,
  marketerTheming: ThemeConfig
): TailwindConfig => {
  const marketerTailwindConfig = convertToTailwindConfig(marketerTheming);
  return deepMerge(developerTheming, marketerTailwindConfig);
};
