/** Short wire references never replace saved identities or authored content. */
export const createRequestLocalIds = (componentIds: string[]) => {
  const saved = new Set(componentIds);
  const encoded = new Map<string, string>();
  const decoded = new Map<string, string>();
  let index = 0;
  for (const id of saved) {
    let alias: string;
    do {
      alias = `c${index++}`;
    } while (saved.has(alias));
    encoded.set(id, alias);
    decoded.set(alias, id);
  }
  const encode = <T extends string | null>(id: T): T =>
    (id === null ? null : (encoded.get(id) ?? id)) as T;
  const decode = (id: string): string => decoded.get(id) ?? id;
  const referenceFields = new Set(["componentId", "sectionId", "ownerId"]);

  // Planning responses contain references and prose, never authored prop values.
  const references = (value: unknown, map: (id: string) => string): unknown => {
    if (Array.isArray(value)) {
      return value.map((item) => references(item, map));
    }
    if (!value || typeof value !== "object") {
      return value;
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        referenceFields.has(key) && typeof child === "string"
          ? map(child)
          : key === "targetComponentIds" && Array.isArray(child)
            ? child.map((id) => (typeof id === "string" ? map(id) : id))
            : references(child, map),
      ])
    );
  };

  return { encode, decode, references };
};
