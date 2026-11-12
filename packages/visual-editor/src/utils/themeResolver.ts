export type StyleSelectOption = { label: string; value: string };

export type TailwindConfig = {
  [key: string]: {
    [key: string]: any;
  };
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
        result[key] = value1 ?? value2;
      }
    }
  }

  return result as T & U;
};

const isObject = (value: any): value is PlainObject => {
  return value !== null && typeof value === "object";
};
