/**
 * Performs a minimal, shallow-to-deep comparison of two values (objects, arrays, or primitives).
 * It is not exhaustive for all JavaScript types (like functions, Symbols, Maps, etc.)
 * but is highly efficient for comparing plain data structures (like state objects).
 *
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns True if the values are structurally and deeply equal, false otherwise.
 */
export function isDeepEqual(a: any, b: any): boolean {
  // 1. Primitive comparison (fastest check)
  if (a === b) {
    return true;
  }

  // 2. Type/Null check (a more robust check than just a === b)
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  // 3. Check if they are arrays (important for handling key iteration later)
  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);

  if (isArrayA !== isArrayB) {
    return false;
  }

  // 4. Get keys and check count (short-circuit on different property counts)
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // 5. Deep property comparison
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];

    // Check if the property exists in both, and if the property values are equal (recursively)
    // Note: This relies on Object.keys being consistent, which is standard for modern JS engines
    // and safe for plain objects.
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !isDeepEqual(a[key], b[key])
    ) {
      return false;
    }
  }

  return true;
}
