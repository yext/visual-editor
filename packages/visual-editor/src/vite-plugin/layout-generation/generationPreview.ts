import type { GeneratedContent } from "../../local-editor/types.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import {
  parseGenerationResponse,
  validateGeneratedContent,
} from "./generationValidation.ts";

/** Complete sections can render while the enclosing MainContent array is open. */
export const createPuckGenerationPreview = (
  catalog: PuckGenerationCatalog,
  emit: (data: GeneratedContent) => void,
  normalize: (data: GeneratedContent) => GeneratedContent = (data) => data
) => {
  const partial: Record<string, any> = Object.create(null);
  const completed = new Set<string>();
  let previous = "";
  const valid = (data: GeneratedContent) => {
    try {
      return !validateGeneratedContent(catalog, normalize(data)).length;
    } catch {
      return false;
    }
  };
  return (path: string[], value: unknown) => {
    if (path[0] !== "spec" || (path.length > 1 && path[1] !== "content"))
      return;
    let target = partial;
    const segments = path.slice(1);
    if (!segments.length) {
      try {
        const data = parseGenerationResponse(
          JSON.stringify({ text: "", spec: value })
        ).spec;
        if (
          data &&
          valid(data) &&
          JSON.stringify(normalize(data)) !== previous
        ) {
          previous = JSON.stringify(normalize(data));
          emit(normalize(data));
        }
      } catch {
        /* Incomplete or malformed data stays provisional until final validation. */
      }
      return;
    }
    segments.forEach((key, index) => {
      if (index === segments.length - 1) {
        Object.defineProperty(target, key, {
          value,
          enumerable: true,
          writable: true,
          configurable: true,
        });
      } else {
        if (
          !Object.hasOwn(target, key) ||
          !target[key] ||
          typeof target[key] !== "object"
        )
          Object.defineProperty(target, key, {
            value: /^\d+$/.test(segments[index + 1]) ? [] : Object.create(null),
            enumerable: true,
            writable: true,
            configurable: true,
          });
        target = target[key];
      }
    });
    completed.add(JSON.stringify(segments));
    const content: GeneratedContent["content"] = [];
    if (!Array.isArray(partial.content)) return;
    for (const [index, item] of partial.content.entries()) {
      if (!item || typeof item !== "object") continue;
      const isComplete = completed.has(
        JSON.stringify(["content", String(index)])
      );
      let candidate = item;
      if (item.type === "MainContent" && typeof item.props?.id === "string") {
        if (
          item.props.content !== undefined &&
          !Array.isArray(item.props.content)
        )
          continue;
        const children: GeneratedContent["content"] = [];
        for (const [childIndex, child] of (
          item.props.content ?? []
        ).entries()) {
          if (
            !isComplete &&
            !completed.has(
              JSON.stringify([
                "content",
                String(index),
                "props",
                "content",
                String(childIndex),
              ])
            )
          )
            continue;
          const main = {
            type: "MainContent",
            props: { id: item.props.id, content: [...children, child] },
          };
          if (
            valid({
              content: [...content, main],
            })
          )
            children.push(child);
        }
        // This shell is only used for preview; accepted data always comes from final JSON.
        candidate = {
          type: "MainContent",
          props: { id: item.props.id, content: children },
        };
      } else if (!isComplete) continue;
      const next = { content: [...content, candidate] };
      if (valid(next)) content.push(candidate);
    }
    const data = { content };
    if (!content.length || !valid(data)) return;
    const normalized = normalize(data);
    const serialized = JSON.stringify(normalized);
    if (serialized !== previous) {
      previous = serialized;
      emit(normalized);
    }
  };
};
