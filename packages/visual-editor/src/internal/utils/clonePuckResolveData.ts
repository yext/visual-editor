const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const clonePuckResolveData = <T>(
  value: T,
  seen = new WeakMap<object, unknown>()
): T => {
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return seen.get(value) as T;
    }

    const clonedArray: unknown[] = [];
    seen.set(value, clonedArray);
    value.forEach((item, index) => {
      clonedArray[index] = clonePuckResolveData(item, seen);
    });
    return clonedArray as T;
  }

  if (typeof value === "function" || typeof value !== "object" || !value) {
    return value;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value) as T;
  }

  const clonedObject: Record<string, unknown> = {};
  seen.set(value, clonedObject);

  Object.entries(value).forEach(([key, entryValue]) => {
    clonedObject[key] = clonePuckResolveData(entryValue, seen);
  });

  return clonedObject as T;
};
