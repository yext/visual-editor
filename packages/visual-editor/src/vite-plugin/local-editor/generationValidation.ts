import {
  applySpecPatch,
  createMixedStreamParser,
  getByPath,
  resolveElementProps,
  resolveRepeatStatePath,
  validateSpec,
  type Catalog,
  type PropResolutionContext,
  type Spec,
} from "@json-render/core";
import { z } from "zod";

/** Read the original Zod schemas, independent of json-render's lossy formatter. */
export const buildGenerationPrompt = (catalog: Catalog): string => {
  const data = catalog.data as {
    components: Record<
      string,
      { props: z.ZodType; description?: string; slots?: string[] }
    >;
  };
  const schemas = Object.fromEntries(
    Object.entries(data.components).map(([name, component]) => [
      name,
      {
        description: component.description,
        slots: component.slots,
        props: z.toJSONSchema(component.props, {
          io: "input",
          reused: "ref",
          unrepresentable: "any",
        }),
      },
    ])
  );
  return (
    catalog.prompt({
      mode: "inline",
      customRules: [
        ...(catalog.componentNames.includes("MainContent")
          ? [
              "For multiple sections, use MainContent as the root and put the sections in its children in display order. Section components are leaves, never containers.",
            ]
          : []),
        "Emit text first, then spec.root, spec.state (if needed), and spec.elements. Emit the MainContent container before its sections. Always include children: [] on leaf sections.",
        "For revisions, use the previous specs in the conversation as context and preserve content the user did not ask to change.",
        "Each assistant response starts with an empty spec. When generating or revising UI, emit the complete resulting spec in the response spec object, not patches relative to a previous response.",
        'Always include "puck": { "isEditing": false } in section props. Generate exactly this puck object, with no other keys. Never generate runtime callbacks.',
      ],
    }) +
    '\n\nOUTPUT FORMAT: Return a single JSON object {"text":"short explanation","spec":{...complete spec...}}. Use spec: null for prose-only answers. The spec contains root, elements, and optional state. Do not emit Markdown fences or JSON Patch lines; the server serializes the spec. This output format overrides the catalog streaming instructions above. Puck slot arrays belong inside section props.slots; they are not json-render element slots. Omit optional fields you do not need.' +
    "\n\nCOMPONENT FIELD SCHEMAS (authoritative constraints and field guidance):\n" +
    JSON.stringify(schemas, null, 2)
  );
};

const specShape = z
  .object({
    root: z.string(),
    state: z.record(z.string(), z.unknown()).optional(),
    elements: z.record(
      z.string(),
      z
        .object({
          type: z.string(),
          props: z.record(z.string(), z.unknown()),
          children: z.array(z.string()),
          slots: z.record(z.string(), z.array(z.string())).optional(),
          repeat: z
            .object({
              statePath: z.union([z.string(), z.object({ $item: z.string() })]),
              key: z.string().optional(),
            })
            .optional(),
        })
        .passthrough()
    ),
  })
  .passthrough();

/** Validate concrete render instances while retaining expressions in the accepted spec. */
export const validateGeneratedText = (
  catalog: Catalog,
  text: string
): string[] => {
  const spec: Spec = { root: "", elements: {} };
  let patches = 0;
  try {
    // The dependency parser silently skips malformed lines. Reject them before
    // parsing so a damaged response cannot be accepted as a partial spec.
    let inFence = false;
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("```spec")) {
        inFence = true;
        continue;
      }
      if (inFence && trimmed === "```") {
        inFence = false;
        continue;
      }
      if (inFence && trimmed) {
        const patch = JSON.parse(trimmed);
        if (
          !["add", "replace", "remove", "move", "copy", "test"].includes(
            patch.op
          ) ||
          typeof patch.path !== "string"
        ) {
          return ["Invalid spec patch"];
        }
      }
    }
    if (inFence) return ["Unclosed spec fence"];
    const parser = createMixedStreamParser({
      onText() {},
      onPatch(patch) {
        applySpecPatch(spec, patch);
        patches++;
      },
    });
    parser.push(text);
    parser.flush();
    // Prose-only answers remain valid chat turns. A spec fence must produce a spec.
    if (!patches && !/`{3,}spec/.test(text)) return [];
    const shape = specShape.safeParse(spec);
    if (!shape.success) return [shape.error.message];
    const structure = validateSpec(spec);
    if (!structure.valid)
      return structure.issues
        .filter((issue) => issue.severity === "error")
        .map((issue) => issue.message);
    const errors: string[] = [];
    const components = (
      catalog.data as {
        components: Record<string, { props: z.ZodType; slots?: string[] }>;
      }
    ).components;
    // Check names even in currently empty repeat scopes and unused elements.
    for (const [key, element] of Object.entries(spec.elements)) {
      if (!catalog.componentNames.includes(element.type))
        errors.push(`${key}: Unknown component ${element.type}`);
      if (
        components[element.type]?.slots?.length === 0 &&
        ((element.children?.length ?? 0) > 0 ||
          Object.values(element.slots ?? {}).some(
            (children) => children.length > 0
          ))
      ) {
        errors.push(
          `${key}: ${element.type} is a leaf section; use MainContent to contain multiple sections`
        );
      }
      if ("puck" in element.props) {
        const puck = element.props.puck;
        if (
          !puck ||
          typeof puck !== "object" ||
          Array.isArray(puck) ||
          Object.keys(puck).length !== 1 ||
          !("isEditing" in puck) ||
          puck.isEditing !== false
        ) {
          errors.push(`${key}: puck must be exactly { "isEditing": false }`);
        }
      }
    }
    const visit = (
      key: string,
      ctx: PropResolutionContext,
      ancestors: Set<string>
    ) => {
      if (ancestors.has(key)) {
        errors.push(`${key}: cyclic element references`);
        return;
      }
      const element = spec.elements[key];
      const next = new Set(ancestors).add(key);
      const resolved = {
        ...element,
        props: resolveElementProps(element.props, ctx),
      };
      const result = catalog.validate({
        ...spec,
        root: key,
        elements: { [key]: resolved },
      });
      const propsResult = components[element.type]?.props.safeParse(
        resolved.props
      );
      if (propsResult && !propsResult.success)
        errors.push(`${key}: ${propsResult.error.message}`);
      if (!result.success)
        errors.push(
          `${key}: ${result.error?.message ?? "Invalid component props"}`
        );
      let contexts = [ctx];
      if (element.repeat) {
        const basePath = resolveRepeatStatePath(
          element.repeat.statePath,
          ctx.repeatBasePath
        );
        const items = basePath
          ? getByPath(ctx.stateModel, basePath)
          : undefined;
        if (!Array.isArray(items)) {
          errors.push(`${key}: repeat state must resolve to an array`);
          return;
        }
        contexts = items.map((repeatItem, repeatIndex) => ({
          ...ctx,
          repeatItem,
          repeatIndex,
          repeatBasePath: `${basePath}/${repeatIndex}`,
        }));
      }
      for (const child of [
        ...(element.children ?? []),
        ...Object.values(element.slots ?? {}).flat(),
      ]) {
        for (const context of contexts) visit(child, context, next);
      }
    };
    visit(spec.root, { stateModel: spec.state ?? {} }, new Set());
    return errors;
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
};

/** Only omitted children on catalog-declared leaves have an unambiguous default. */
export const normalizeGeneratedElement = (
  catalog: Catalog,
  value: unknown
): unknown => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const element = value as Record<string, unknown>;
  const components = (
    catalog.data as { components: Record<string, { slots?: string[] }> }
  ).components;
  if (
    typeof element.type === "string" &&
    components[element.type]?.slots?.length === 0 &&
    !("children" in element)
  ) {
    return { ...element, children: [] };
  }
  return element;
};

export const isGeneratedElementShape = (
  key: string,
  element: unknown
): boolean =>
  specShape.safeParse({ root: key, elements: { [key]: element } }).success;
