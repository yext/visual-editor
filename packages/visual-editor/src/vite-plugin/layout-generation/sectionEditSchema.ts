import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import {
  clone,
  extractAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../internal/generation/authored.ts";
import { unwrapZodSchema as unwrap } from "../../internal/utils/unwrapZodSchema.ts";
import {
  generationFields,
  prepareSlottedSource,
} from "../../internal/generation/slottedItemSource.ts";
import {
  materializeSectionEdit,
  structuralEditResult,
} from "../../internal/generation/editMaterializer.ts";
import type {
  AuthoredValueEdit,
  NewEditComponent,
  SectionEditOperation,
  SectionEditResult,
  SectionEditTask,
} from "../../internal/generation/editProtocol.ts";
import { getEditValueContracts } from "./editCapabilities.ts";
import { validateSectionEditTask } from "./editPlanning.ts";
import { createGenerationSchemaCompiler } from "./generationSchemaCompiler.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";

/** Compile a strict response containing only planned targets and insertion types. */
export const compileSectionEditSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  data: Content,
  taskInput: SectionEditTask,
  sharedIntent = ""
) => {
  const { task, inventory, saved } = validateSectionEditTask(
    catalog,
    data,
    taskInput
  );
  const compiler = createGenerationSchemaCompiler(catalog, locales, "insert");
  const updateDecoders = new Map<
    string,
    Map<string, (input: any) => AuthoredValueEdit>
  >();
  const updateSchemas: z.ZodType[] = [];
  const removedIds = new Set(
    task.structuralOperations
      .filter((operation) => operation.kind === "remove")
      .map((operation) => operation.componentId)
  );
  if (task.generateContent !== false) {
    for (const componentId of task.targetComponentIds) {
      if (removedIds.has(componentId)) {
        continue;
      }
      const component = saved.get(componentId)!;
      const changes: z.ZodType[] = [];
      const decoders = new Map<string, (input: any) => AuthoredValueEdit>();
      for (const contract of getEditValueContracts(
        compiler,
        catalog.data.components[component.type],
        component.readOnly
      )) {
        if (contract.set) {
          const node = contract.set;
          changes.push(
            z.strictObject({
              kind: z.literal("set"),
              path: z.literal(contract.path),
              value: node.wire,
            })
          );
          decoders.set(`set:${contract.path}`, (input) => ({
            kind: "set",
            path: contract.path,
            value: node.apply(input.value, undefined),
          }));
        }
        if (contract.unset) {
          changes.push(
            z.strictObject({
              kind: z.literal("unset"),
              path: z.literal(contract.path),
            })
          );
          decoders.set(`unset:${contract.path}`, () => ({
            kind: "unset",
            path: contract.path,
          }));
        }
      }
      if (changes.length) {
        updateSchemas.push(
          z.strictObject({
            kind: z.literal("update"),
            componentId: z.literal(componentId),
            changes: z.array(compiler.union(changes)).min(1),
          })
        );
        updateDecoders.set(componentId, decoders);
      }
    }
  }
  const insertions = task.structuralOperations.filter(
    (operation) => operation.kind === "insert"
  );
  const insertionSchemas = insertions.map((operation) =>
    z.strictObject({
      insertionKey: z.literal(operation.insertionKey),
      component: compiler.element(operation.componentType).wire,
    })
  );
  const responseSchema = z.strictObject({
    taskId: z.literal(task.taskId),
    sectionId: z.literal(task.sectionId),
    updates: updateSchemas.length
      ? z.array(compiler.union(updateSchemas))
      : z.array(z.string()).max(0),
    insertions: insertionSchemas.length
      ? z.array(compiler.union(insertionSchemas))
      : z.array(z.string()).max(0),
  });
  const toNewComponent = (projected: SavedComponent): NewEditComponent => {
    const config = catalog.data.components[projected.type];
    if (!config?.generation || projected.type === "MainContent") {
      throw new Error("New descendants require editable generation contracts.");
    }
    const slots: NewEditComponent["slots"] = [];
    const unsetPaths: string[] = [];
    const project = (
      value: any,
      schema: z.ZodType,
      field: Fields[string] | undefined,
      path: string,
      collectUnset = true
    ): any => {
      if (value === undefined) {
        if (collectUnset && path && schema.safeParse(undefined).success) {
          unsetPaths.push(path);
        }
        return undefined;
      }
      if (field?.type === "slot") {
        slots.push({
          slotPath: path,
          components: value.map((component: SavedComponent) =>
            toNewComponent(component)
          ),
        });
        return undefined;
      }
      if (value === null) {
        return null;
      }
      const node = unwrap(schema);
      if (node instanceof z.ZodUnion) {
        const option = node.options.find(
          (option) => (option as z.ZodType).safeParse(value).success
        );
        if (!option) {
          throw new Error(
            "No authored union alternative matches the new value."
          );
        }
        return project(value, option as z.ZodType, field, path, collectUnset);
      }
      if (node instanceof z.ZodObject) {
        const shape = compiler.shapeFor(node, path);
        if (
          node.def.catchall &&
          (node.def.catchall as z.ZodType).def.type !== "never"
        ) {
          for (const key of Object.keys(value)) {
            shape[key] ??= node.def.catchall as z.ZodType;
          }
        }
        const result: Record<string, unknown> = {};
        for (const [key, child] of Object.entries(shape)) {
          const next = project(
            value[key],
            child,
            field?.type === "object" ? field.objectFields[key] : undefined,
            `${path}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`,
            collectUnset
          );
          if (next !== undefined) {
            result[key] = next;
          }
        }
        return result;
      }
      if (node instanceof z.ZodArray) {
        return value.map((item: any, index: number) =>
          project(
            item,
            node.element as z.ZodType,
            field?.type === "array"
              ? { type: "object", objectFields: field.arrayFields }
              : undefined,
            `${path}/${index}`,
            false
          )
        );
      }
      return clone(value);
    };
    return {
      type: projected.type,
      authoredValues: project(
        projected.props,
        config.generation.props,
        { type: "object", objectFields: generationFields(config) },
        ""
      ),
      slots,
      unsetPaths,
    };
  };
  const parseResponse = (text: string): SectionEditResult => {
    const parsed = responseSchema.parse(JSON.parse(text)) as any;
    const seenTargets = new Set<string>();
    const operations: SectionEditOperation[] = parsed.updates.map(
      (update: any) => {
        if (seenTargets.has(update.componentId)) {
          throw new Error("A section result may update each target only once.");
        }
        seenTargets.add(update.componentId);
        return {
          ...update,
          changes: update.changes.map((change: any) =>
            updateDecoders
              .get(update.componentId)!
              .get(`${change.kind}:${change.path}`)!(change)
          ),
        };
      }
    );
    const generated = new Map<string, NewEditComponent>();
    for (const insertion of parsed.insertions) {
      if (generated.has(insertion.insertionKey)) {
        throw new Error("A planned insertion may be generated only once.");
      }
      const raw = compiler
        .element(insertion.component.type)
        .apply(insertion.component, undefined);
      // Prepare the complete tree before projection loses helper-owned defaults
      // and the compiler's record of explicitly supplied card lists.
      walkAuthored(catalog, { content: [raw] }, ({ component }) => {
        const childConfig = catalog.data.components[component.type];
        if (!childConfig?.generation) {
          throw new Error(
            "New descendants require editable generation contracts."
          );
        }
        prepareSlottedSource(
          component,
          childConfig,
          compiler.explicitCardLists.has(component)
        );
      });
      const projected = extractAuthored(
        catalog,
        { content: [raw] },
        { includeIds: false }
      ).content[0];
      generated.set(insertion.insertionKey, toNewComponent(projected));
    }
    for (const operation of task.structuralOperations) {
      if (operation.kind === "insert") {
        const component = generated.get(operation.insertionKey);
        if (!component) {
          throw new Error("Section result omitted a planned insertion.");
        }
        const { componentType: _componentType, ...insertion } = operation;
        operations.push({ ...insertion, component });
      } else {
        operations.push(operation);
      }
    }
    if (task.generateContent === true && !operations.length) {
      throw new Error("Section result contains no changes.");
    }
    const result = {
      taskId: task.taskId,
      sectionId: task.sectionId,
      operations,
    };
    materializeSectionEdit(catalog, data, task, result);
    return result;
  };
  const localResult =
    task.generateContent === false ? structuralEditResult(task) : null;
  if (localResult) {
    materializeSectionEdit(catalog, data, task, localResult);
  } else if (!updateSchemas.length && !insertionSchemas.length) {
    throw new Error("Task has no generatable authored paths or insertions.");
  }
  const sectionIds = new Set(
    inventory.components
      .filter((item) => item.sectionId === task.sectionId)
      .map((item) => item.componentId)
  );
  return {
    jsonSchema: compiler.exportSchema(responseSchema),
    availableComponentNames: [
      ...new Set([
        ...compiler.nodes.keys(),
        ...task.targetComponentIds.map(
          (componentId) => saved.get(componentId)!.type
        ),
      ]),
    ],
    context: {
      task,
      sharedIntent,
      section: inventory.components.filter((item) =>
        sectionIds.has(item.componentId)
      ),
      collections: inventory.collections.filter(
        (item) => item.ownerId && sectionIds.has(item.ownerId)
      ),
    },
    localResult,
    parseResponse,
  };
};

/** Keep section execution focused on already validated targets and shared copy intent. */
export const buildSectionEditPrompt = () =>
  [
    "Execute exactly one validated section task against the supplied current authored values and section context. Return only the strict response schema.",
    "Only emit updates for the requested targets and explicitly requested fields. Omitted paths are preserved. Use kind unset to remove an optional field; null is a real value only where allowed. Do not emit default or unset markers as the value of a top-level set operation.",
    "The sharedIntent coordinates copy across sections; it does not widen this task's scope. Preserve entity bindings and untranslated locale values unless the user explicitly requests changing them. Prefer [[name]] for business identity unless the user supplies a name or requests fiction.",
    "Ordinary arrays are supplied in full, with no inheritance from existing rows or cards by index or type. Use the offered markers only within new component props or optional members of replacement arrays.",
    'Generate every planned insertion once. New component props may select library defaults with {"$default":true} or remove optional defaults with {"$unset":true}. Never generate component Ids. Native child slots contain new component descriptions, never references to existing components.',
    "Structural removal and reordering are supplied by the application from the plan. Do not emit them, invent other insertions, move cards between sections, replace whole sections, change root settings or touch opaque components.",
  ].join("\n");
