import type { Data } from "@puckeditor/core";
import type { Spec } from "@json-render/core";
import type { GeneratedContent } from "../../local-editor/types.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { validateGeneratedContent } from "./generationValidation.ts";

type NativeComponent = GeneratedContent["content"][number] & {
  props: Record<string, any>;
  readOnly?: Record<string, boolean>;
};
export type FlatLayoutSpec = Spec & { elements: Record<string, any> };
type FlatSidecar = {
  metadata: Record<string, Record<string, boolean>>;
  derivedCopies: Array<{ parentKey: string; path: string[]; ids: string[] }>;
};
const sidecars = new WeakMap<object, FlatSidecar>();
const componentEnvelope = (value: any): value is NativeComponent =>
  value &&
  typeof value.type === "string" &&
  value.props &&
  typeof value.props.id === "string";
const pointerEscape = (value: string) =>
  value.replace(/~/g, "~0").replace(/\//g, "~1");

/** Converts native Puck content to json-render's flat graph for generation only. */
export const puckDataToFlatSpec = (
  catalog: PuckGenerationCatalog,
  data: Data
): FlatLayoutSpec => {
  const elements: Record<string, any> = Object.create(null);
  const ids = new Set<string>();
  const metadata = new Map<string, Record<string, boolean>>();
  const derivedCopies: FlatSidecar["derivedCopies"] = [];
  const add = (
    component: NativeComponent,
    parentKey: string,
    slot?: string
  ) => {
    const id = component.props.id;
    if (ids.has(id)) throw new Error(`Duplicate authored component id ${id}`);
    ids.add(id);
    const key = pointerEscape(id);
    const props = structuredClone(component.props);
    delete props.id;
    const fields = catalog.data.components[component.type]?.fields ?? {};
    const slots: Record<string, string[]> = Object.create(null);
    const visitFields = (
      object: Record<string, any>,
      defs: any,
      path: string[]
    ) => {
      for (const [name, field] of Object.entries<any>(defs)) {
        if (!Object.hasOwn(object, name) || object[name] == null) continue;
        const next = [...path, name];
        if (field.type === "slot" && Array.isArray(object[name])) {
          if (
            catalog.data.components[component.type].derivedSlotPaths?.some(
              (derivedPath) =>
                derivedPath.length === next.length &&
                derivedPath.every((segment, index) => segment === next[index])
            )
          ) {
            derivedCopies.push({
              parentKey: key,
              path: next,
              ids: object[name]
                .map((child: NativeComponent) => child?.props?.id)
                .filter(
                  (childId: unknown): childId is string =>
                    typeof childId === "string"
                ),
            });
            continue;
          }
          slots[`/${next.map(pointerEscape).join("/")}`] = object[name].map(
            (child: NativeComponent) => {
              if (!componentEnvelope(child))
                throw new Error(`Invalid slot component at ${next.join(".")}`);
              return add(child, key, `/${next.map(pointerEscape).join("/")}`);
            }
          );
          deleteAt(props, next);
        } else if (
          field.type === "object" &&
          object[name] &&
          typeof object[name] === "object"
        ) {
          visitFields(object[name], field.objectFields ?? {}, next);
        } else if (field.type === "array" && Array.isArray(object[name])) {
          object[name].forEach((item: any, index: number) => {
            if (item && typeof item === "object" && !Array.isArray(item))
              visitFields(item, field.arrayFields ?? {}, [
                ...next,
                String(index),
              ]);
          });
        }
      }
    };
    const generationFields =
      component.type === "MainContent"
        ? Object.fromEntries(
            Object.entries(fields).filter(([name]) => name !== "content")
          )
        : fields;
    visitFields(component.props, generationFields, []);
    const children: string[] = [];
    if (
      component.type === "MainContent" &&
      Array.isArray(component.props.content)
    ) {
      for (const child of component.props.content) {
        if (!componentEnvelope(child))
          throw new Error("Invalid MainContent child");
        children.push(add(child, key));
      }
      delete props.content;
    }
    Object.defineProperty(elements, key, {
      value: {
        type: component.type,
        props,
        ...(children.length || component.type === "MainContent"
          ? { children }
          : {}),
        ...(Object.keys(slots).length ? { slots } : {}),
      },
      enumerable: true,
      configurable: true,
      writable: true,
    });
    if (component.readOnly)
      metadata.set(key, structuredClone(component.readOnly));
    return key;
  };
  const wrapperKey = uniqueRootKey(collectIds(catalog, data.content));
  elements[wrapperKey] = {
    type: "__PuckContentRoot",
    props: {},
    children: data.content.map((item: any) => {
      if (!componentEnvelope(item))
        throw new Error("Invalid top-level Puck component");
      return add(item, wrapperKey);
    }),
  };
  const spec = { root: wrapperKey, elements };
  sidecars.set(spec, { metadata: Object.fromEntries(metadata), derivedCopies });
  return spec;
};

/** Carries native editor metadata alongside a detached patch candidate. */
export const copyPuckFlatSidecar = (source: object, target: object): void => {
  const sidecar = sidecars.get(source);
  if (sidecar) sidecars.set(target, sidecar);
};

/** Rebuilds authored native content while retaining the authoritative Puck baseline. */
export const flatSpecToPuckData = (
  catalog: PuckGenerationCatalog,
  spec: FlatLayoutSpec,
  baseline: Data,
  sidecar: FlatSidecar | undefined = sidecars.get(spec),
  metadataSource?: object
): Data => {
  if (
    !spec ||
    typeof spec.root !== "string" ||
    !spec.elements ||
    typeof spec.elements !== "object" ||
    Array.isArray(spec.elements)
  )
    throw new Error("Flat layout must contain a root key and element map");
  const root = spec.elements[spec.root];
  if (
    !root ||
    root.type !== "__PuckContentRoot" ||
    !Array.isArray(root.children)
  )
    throw new Error("Flat layout has an invalid content root");
  const metadata =
    sidecar?.metadata ??
    (metadataSource ? sidecars.get(metadataSource)?.metadata : undefined) ??
    {};
  const derivedCopies =
    sidecar?.derivedCopies ??
    (metadataSource
      ? sidecars.get(metadataSource)?.derivedCopies
      : undefined) ??
    [];
  const visited = new Set<string>([spec.root]);
  const authoredByKey = new Map<string, NativeComponent>();
  const decode = (key: string, seen = new Set<string>()): NativeComponent => {
    if (seen.has(key)) throw new Error(`Cycle in flat layout at ${key}`);
    const element = spec.elements[key];
    if (!element || typeof element.type !== "string")
      throw new Error(`Missing flat element ${key}`);
    const unsupported = Object.keys(element).find(
      (name) => !["type", "props", "children", "slots"].includes(name)
    );
    if (unsupported)
      throw new Error(`Unsupported flat element property ${unsupported}`);
    if (!Object.hasOwn(catalog.data.components, element.type))
      throw new Error(`Unknown flat component ${element.type}`);
    const nextSeen = new Set(seen).add(key);
    if (visited.has(key))
      throw new Error(`Flat element ${key} has multiple parents`);
    visited.add(key);
    if (
      !element.props ||
      typeof element.props !== "object" ||
      Array.isArray(element.props)
    )
      throw new Error(`Invalid props for flat element ${key}`);
    if (Object.hasOwn(element.props, "id"))
      throw new Error(`Flat element ${key} must omit component id from props`);
    const props: Record<string, any> = {
      ...structuredClone(element.props),
      id: unescapeId(key),
    };
    if (element.type === "MainContent")
      props.content = (element.children ?? []).map((child: string) =>
        decode(child, nextSeen)
      );
    else if (Object.hasOwn(props, "content") && Array.isArray(props.content))
      throw new Error(
        `MainContent-style children must use children references for ${key}`
      );
    const elementFields = catalog.data.components[element.type].fields ?? {};
    const authoredFields =
      element.type === "MainContent"
        ? Object.fromEntries(
            Object.entries(elementFields).filter(([name]) => name !== "content")
          )
        : elementFields;
    rejectInlineDeclaredSlots(
      authoredFields,
      props,
      [],
      catalog.data.components[element.type].derivedSlotPaths ?? []
    );
    for (const [pointer, children] of Object.entries<string[]>(
      element.slots ?? {}
    )) {
      if (!Array.isArray(children))
        throw new Error(`Invalid slot references at ${pointer}`);
      const path = decodePointer(pointer);
      setDeclaredSlot(
        props,
        authoredFields,
        path,
        children.map((child) => decode(child, nextSeen))
      );
    }
    const output: any = { type: element.type, props };
    if (Object.hasOwn(metadata, key))
      output.readOnly = structuredClone(metadata[key]);
    authoredByKey.set(key, output);
    return output;
  };
  const content = root.children.map((key: string) => decode(key));
  for (const copy of derivedCopies) {
    const parent = authoredByKey.get(copy.parentKey);
    if (!parent) continue;
    const existing = getAtPath(parent.props, copy.path);
    if (!Array.isArray(existing)) continue;
    setAtPath(
      parent.props,
      copy.path,
      existing.map((child: NativeComponent, index: number) => {
        const authored = authoredByKey.get(
          pointerEscape(copy.ids[index] ?? child?.props?.id ?? "")
        );
        return authored ? structuredClone(authored) : child;
      })
    );
  }
  if (visited.size !== Object.keys(spec.elements).length)
    throw new Error(
      "Flat layout contains unreachable elements: " +
        Object.keys(spec.elements)
          .filter((key) => !visited.has(key))
          .join(", ")
    );
  const output = { ...baseline, content };
  const errors = validateGeneratedContent(catalog, { content: output.content });
  if (errors.length)
    throw new Error(`Reconstructed Puck data is invalid: ${errors.join("; ")}`);
  return output;
};

const deleteAt = (target: Record<string, any>, path: string[]) => {
  let object = target;
  for (const segment of path.slice(0, -1)) object = object?.[segment];
  if (object) delete object[path.at(-1)!];
};
const uniqueRootKey = (ids: unknown[]) => {
  const occupied = new Set(
    ids.filter((id): id is string => typeof id === "string").map(pointerEscape)
  );
  let key = "__puck_content_root__";
  while (occupied.has(key)) key = `_${key}`;
  return key;
};
const unescapeId = (key: string) => {
  if (/~(?![01])/.test(key))
    throw new Error(`Invalid encoded element id ${key}`);
  return key.replace(/~[01]/g, (part) => (part === "~1" ? "/" : "~"));
};
const decodePointer = (pointer: string) => {
  if (!pointer.startsWith("/"))
    throw new Error(`Invalid slot pointer ${pointer}`);
  return pointer
    .slice(1)
    .split("/")
    .map((segment) => {
      if (/~(?![01])/.test(segment))
        throw new Error(`Invalid JSON Pointer escape in ${pointer}`);
      const value = segment.replace(/~[01]/g, (part) =>
        part === "~1" ? "/" : "~"
      );
      if (["__proto__", "prototype", "constructor"].includes(value))
        throw new Error(`Reserved property in slot pointer ${pointer}`);
      return value;
    });
};
const setAtPath = (
  target: Record<string, any>,
  path: string[],
  value: unknown
) => {
  let current = target;
  for (const segment of path.slice(0, -1)) {
    if (!current[segment] || typeof current[segment] !== "object")
      throw new Error(`Invalid slot path ${path.join("/")}`);
    current = current[segment];
  }
  const leaf = path.at(-1);
  if (!leaf) throw new Error("Empty slot path");
  current[leaf] = value;
};
/** Validate the whole declared path before materializing missing containers. */
const setDeclaredSlot = (
  target: Record<string, any>,
  fields: any,
  path: string[],
  value: unknown
) => {
  const containers: Array<{
    key: string;
    kind: "object" | "array";
    index?: boolean;
  }> = [];
  let definitions = fields;
  let cursor = 0;
  while (cursor < path.length) {
    const name = path[cursor++];
    const field = Object.hasOwn(definitions, name)
      ? definitions[name]
      : undefined;
    if (!field) throw new Error(`Undeclared slot path ${path.join("/")}`);
    if (field.type === "slot") {
      if (cursor !== path.length)
        throw new Error(`Invalid slot path ${path.join("/")}`);
      break;
    }
    if (field.type === "object") {
      containers.push({ key: name, kind: "object" });
      definitions = field.objectFields ?? {};
    } else if (field.type === "array") {
      const index = path[cursor++];
      if (
        !index ||
        !/^(0|[1-9][0-9]*)$/.test(index) ||
        !Number.isSafeInteger(Number(index))
      )
        throw new Error(`Invalid slot array index in ${path.join("/")}`);
      containers.push(
        { key: name, kind: "array" },
        { key: index, kind: "object", index: true }
      );
      definitions = field.arrayFields ?? {};
    } else
      throw new Error(
        `Slot path must end at a declared slot: ${path.join("/")}`
      );
    if (cursor >= path.length)
      throw new Error(
        `Slot path must end at a declared slot: ${path.join("/")}`
      );
  }
  let current: any = target;
  for (const container of containers) {
    if (container.index && Number(container.key) > current.length)
      throw new Error(`Slot array index creates a gap in ${path.join("/")}`);
    if (!Object.hasOwn(current, container.key))
      current[container.key] = container.kind === "array" ? [] : {};
    const child = current[container.key];
    if (
      !child ||
      typeof child !== "object" ||
      Array.isArray(child) !== (container.kind === "array")
    )
      throw new Error(`Invalid slot parent at ${path.join("/")}`);
    current = child;
  }
  current[path.at(-1)!] = value;
};

const getAtPath = (target: Record<string, any>, path: string[]) =>
  path.reduce((value: any, key) => value?.[key], target);
const rejectInlineDeclaredSlots = (
  fields: any,
  props: Record<string, any>,
  path: string[],
  derivedPaths: readonly (readonly string[])[]
) => {
  for (const [name, field] of Object.entries<any>(fields ?? {})) {
    const value = props[name];
    if (value === undefined || value === null) continue;
    const next = [...path, name];
    const derived = derivedPaths.some(
      (derivedPath) =>
        derivedPath.length === next.length &&
        derivedPath.every((segment, index) => segment === next[index])
    );
    if (field.type === "slot" && Array.isArray(value) && !derived)
      throw new Error(
        `Declared slot ${next.join(".")} must use flat slots references`
      );
    if (
      field.type === "object" &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    )
      rejectInlineDeclaredSlots(field.objectFields, value, next, derivedPaths);
    if (field.type === "array" && Array.isArray(value))
      value.forEach(
        (item, index) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          rejectInlineDeclaredSlots(
            field.arrayFields,
            item,
            [...next, String(index)],
            derivedPaths
          )
      );
  }
};
const collectIds = (
  catalog: PuckGenerationCatalog,
  content: unknown[]
): string[] => {
  const result: string[] = [];
  const visit = (component: any) => {
    if (!componentEnvelope(component)) return;
    result.push(pointerEscape(component.props.id));
    const fields = catalog.data.components[component.type]?.fields ?? {};
    const walk = (object: any, definitions: any) => {
      for (const [name, field] of Object.entries<any>(definitions)) {
        const value = object?.[name];
        if (field.type === "slot" && Array.isArray(value)) value.forEach(visit);
        else if (field.type === "object" && value && typeof value === "object")
          walk(value, field.objectFields ?? {});
        else if (field.type === "array" && Array.isArray(value))
          value.forEach((item) => walk(item, field.arrayFields ?? {}));
      }
    };
    walk(component.props, fields);
    if (
      component.type === "MainContent" &&
      Array.isArray(component.props.content)
    )
      component.props.content.forEach(visit);
  };
  content.forEach(visit);
  return result;
};
