const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

/**
 * Clones resolved Puck editor data before rerunning `resolveAllData` on entity
 * switches.
 *
 * This is intentionally narrower than a generic deep clone. Resolved editor
 * state can contain function props injected by component `resolveData`
 * implementations, which cause `structuredClone` to throw. Plain objects and
 * arrays are cloned deeply, while functions and other non-plain objects are
 * preserved by reference.
 */
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

  const clonedObject = Object.create(Object.getPrototypeOf(value)) as Record<
    PropertyKey,
    unknown
  >;
  seen.set(value, clonedObject);

  Reflect.ownKeys(value).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor) {
      return;
    }

    if ("value" in descriptor) {
      descriptor.value = clonePuckResolveData(descriptor.value, seen);
    }

    Object.defineProperty(clonedObject, key, descriptor);
  });

  return clonedObject as T;
};
