/** Share identical wire schemas without changing their accepted values or annotations. */
export const compactGenerationSchema = (
  schema: Record<string, any>
): Record<string, any> => {
  const names = new Map(
    Object.keys(schema.$defs ?? {}).map((name, index) => [name, `d${index}`])
  );
  const children = (
    node: Record<string, any>,
    visit: (child: Record<string, any>) => Record<string, any>
  ) => {
    const result = { ...node };
    if (node.properties)
      result.properties = Object.fromEntries(
        Object.entries(node.properties).map(([key, child]) => [
          key,
          visit(child as Record<string, any>),
        ])
      );
    if (node.items) result.items = visit(node.items);
    if (node.anyOf) result.anyOf = node.anyOf.map(visit);
    return result;
  };
  const normalize = (node: Record<string, any>): Record<string, any> => {
    const result = children(node, normalize);
    if (result.$ref?.startsWith("#/$defs/")) {
      const name = result.$ref
        .slice("#/$defs/".length)
        .replaceAll("~1", "/")
        .replaceAll("~0", "~");
      if (names.has(name)) result.$ref = `#/$defs/${names.get(name)}`;
    }
    if (result.anyOf) {
      // A bare nested anyOf adds no constraint. Keep annotated branches intact.
      const branches = result.anyOf.flatMap((child: Record<string, any>) =>
        Object.keys(child).length === 1 && child.anyOf ? child.anyOf : [child]
      );
      result.anyOf = [
        ...new Map(
          branches.map((child: Record<string, any>) => [
            JSON.stringify(child),
            child,
          ])
        ).values(),
      ];
    }
    return result;
  };
  const { $defs, ...root } = schema;
  const normalizedRoot = normalize(root);
  const definitions = Object.fromEntries(
    Object.entries($defs ?? {}).map(([name, node]) => [
      names.get(name)!,
      normalize(node as Record<string, any>),
    ])
  );
  const counts = new Map<string, number>();
  const count = (
    node: Record<string, any>,
    inline = false
  ): Record<string, any> => {
    if (inline) {
      const key = JSON.stringify(node);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    children(node, (child) => count(child, true));
    return node;
  };
  count(normalizedRoot);
  Object.values(definitions).forEach((node) => count(node));
  const shared = new Map<string, string>();
  const factor = (
    node: Record<string, any>,
    inline = false
  ): Record<string, any> => {
    const key = JSON.stringify(node);
    const reusable = inline && key.length > 96 && (counts.get(key) ?? 0) > 1;
    if (reusable && shared.has(key))
      return { $ref: `#/$defs/${shared.get(key)}` };
    const result = children(node, (child) => factor(child, true));
    if (!reusable) return result;
    const name = `s${shared.size}`;
    shared.set(key, name);
    definitions[name] = result;
    return { $ref: `#/$defs/${name}` };
  };
  const result = factor(normalizedRoot);
  // Snapshot entries because factoring adds new shared definitions.
  for (const [name, node] of Object.entries(definitions))
    definitions[name] = factor(node);
  return Object.keys(definitions).length
    ? { ...result, $defs: definitions }
    : result;
};
