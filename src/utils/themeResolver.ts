export type Style =
  | {
      label: string;
      plugin: string;
      type: "number";
      default: number;
    }
  | {
      label: string;
      plugin: string;
      type: "select";
      default: string;
      options: StyleSelectOption[];
    }
  | {
      label: string;
      plugin: string;
      type: "color";
      default: string;
    };

export type StyleSelectOption = {
  label: string;
  value: string;
};

export type ParentStyle = {
  label: string;
  styles: { [key: string]: Style | ParentStyle };
};

export type ThemeConfig = {
  [key: string]: {
    label: string;
    styles: { [key: string]: Style | ParentStyle };
  };
};

export type TailwindConfig = {
  [key: string]: {
    [key: string]: any;
  };
};

export type SavedTheme = Record<string, string | number>;

const extractDefaults = (
  styles: {
    [key: string]: Style | ParentStyle;
  },
  parentKey = ""
): { [key: string]: string | { [key: string]: string } } => {
  const result: any = {};

  for (const key in styles) {
    const style = styles[key];

    if ("default" in style) {
      // It's a Style, give it a CSS variable
      result[key] = `var(--${parentKey}-${key})`;
    } else if ("styles" in style) {
      // It's a ParentStyle, recurse to children
      result[key] = extractDefaults(style.styles, `${parentKey}-${key}`);
    }
  }

  return result;
};

export const convertToTailwindConfig = (input: ThemeConfig): TailwindConfig => {
  const output: TailwindConfig = {};

  for (const category in input) {
    const categoryData = input[category];
    output[category] = extractDefaults(categoryData.styles, category);
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
  deverloperTheming: TailwindConfig,
  marketerTheming: ThemeConfig
): TailwindConfig => {
  const marketerTailwindConfig = convertToTailwindConfig(marketerTheming);
  return deepMerge(deverloperTheming, marketerTailwindConfig);
};
