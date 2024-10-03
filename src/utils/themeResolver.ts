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
    [key: string]: string | { [key: string]: string };
  };
};

const extractDefaults = (styles: {
  [key: string]: Style | ParentStyle;
}): { [key: string]: string | { [key: string]: string } } => {
  const result: any = {};

  for (const key in styles) {
    const style = styles[key];

    if ("default" in style) {
      // It's a Style, extract the default
      result[key] = style.default;
    } else if ("styles" in style) {
      // It's a ParentStyle, recurse to extract defaults
      result[key] = extractDefaults(style.styles);
    }
  }

  return result;
};

const convertToTailwindConfig = (input: ThemeConfig): TailwindConfig => {
  const output: TailwindConfig = {};

  for (const category in input) {
    const categoryData = input[category];
    output[category] = extractDefaults(categoryData.styles);
  }

  return output;
};

type PlainObject = Record<string, any>;

/**
 * Merges two objects deeply, giving priority to properties from the first object.
 */
const deepMerge = <T extends PlainObject, U extends PlainObject>(
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
        // Otherwise, prioritize obj1's value
        result[key] = value1;
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
export const themeResolver = <T extends PlainObject>(
  deverloperTheming: T,
  marketerTheming: ThemeConfig
) => {
  const marketerTailwindConfig = convertToTailwindConfig(marketerTheming);
  return deepMerge(deverloperTheming, marketerTailwindConfig);
};
