import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import {
  clone,
  extractAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "./authored.ts";
import { unwrapZodSchema as unwrap } from "../utils/unwrapZodSchema.ts";
import { isDeepEqual } from "../../utils/deepEqual.ts";
import {
  normalizeGeneratedText,
  localizedTextState,
  validateLocalizedTextEdits,
} from "./localizedText.ts";
import { generationFields, prepareSlottedSource } from "./slottedItemSource.ts";
import {
  materializeSectionEdit,
  structuralEditResult,
} from "./editMaterializer.ts";
import type {
  AuthoredValueEdit,
  NewEditComponent,
  SectionEditOperation,
  SectionEditResult,
  SectionEditTask,
} from "./editProtocol.ts";
import { getEditValueContracts } from "./editCapabilities.ts";
import { validateSectionEditTask } from "./editPlanning.ts";
import { createGenerationSchemaCompiler } from "./generationSchemaCompiler.ts";
import type { PuckGenerationCatalog } from "../../utils/generationCatalog.ts";

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
  // Older saved locales remain available for preservation, not for translation.
  const savedLocales = task.targetComponentIds
    .map((id) => saved.get(id)!)
    .flatMap((component) =>
      localizedTextState(
        component.props,
        catalog.data.components[component.type],
        locales
      ).flatMap((state) => state.overrideLocales)
    );
  const compiler = createGenerationSchemaCompiler(
    catalog,
    [...new Set([...locales, ...savedLocales])],
    "insert"
  );
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
      const contracts = getEditValueContracts(
        compiler,
        catalog.data.components[component.type],
        component.readOnly
      );
      for (const contract of contracts) {
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
      collectUnset = true,
      baseline?: any
    ): any => {
      if (value === undefined) {
        if (!schema.safeParse(undefined).success) {
          throw new Error(
            `New component value at ${path} is required after normalization.`
          );
        }
        if (collectUnset && path) {
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
        return project(
          value,
          option as z.ZodType,
          field,
          path,
          collectUnset,
          baseline
        );
      }
      if (node instanceof z.ZodObject) {
        const shape = compiler.shapeFor(node, path);
        if (
          node.def.catchall &&
          (node.def.catchall as z.ZodType).def.type !== "never"
        ) {
          // Materialization patches a fresh clone of library defaults. Carry
          // removals of dynamic keys too, including locales stripped above.
          const baselineKeys =
            baseline && typeof baseline === "object" && !Array.isArray(baseline)
              ? Object.keys(baseline)
              : [];
          for (const key of new Set([...Object.keys(value), ...baselineKeys])) {
            // Catchall keys are optional even when their values are required.
            shape[key] ??= (node.def.catchall as z.ZodType).optional();
          }
        }
        const result: Record<string, unknown> = {};
        for (const [key, child] of Object.entries(shape)) {
          const next = project(
            value[key],
            child,
            field?.type === "object" ? field.objectFields[key] : undefined,
            `${path}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`,
            collectUnset,
            baseline?.[key]
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
        "",
        true,
        config.defaultProps
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
        const decoders = updateDecoders.get(update.componentId)!;
        const changes: AuthoredValueEdit[] = update.changes.map((change: any) =>
          decoders.get(`${change.kind}:${change.path}`)!(change)
        );
        const component = saved.get(update.componentId)!;
        validateLocalizedTextEdits(
          component,
          catalog.data.components[component.type],
          changes,
          locales,
          task.translationMode === "translate"
        );
        return { ...update, changes };
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
        component.props = normalizeGeneratedText(
          component.props,
          childConfig.generation.props,
          { type: "object", objectFields: generationFields(childConfig) },
          task.translationMode === "translate",
          locales
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
    const materialized = materializeSectionEdit(catalog, data, task, result);
    // Check the actual application result, not just the normalized intermediate.
    // A projection omission must never silently restore localized defaults.
    walkAuthored(catalog, materialized, ({ component }) => {
      if (saved.has(component.props.id)) return;
      const config = catalog.data.components[component.type];
      const normalized = normalizeGeneratedText(
        component.props,
        config.generation!.props,
        { type: "object", objectFields: generationFields(config) },
        task.translationMode === "translate",
        locales
      );
      if (!isDeepEqual(normalized, component.props)) {
        throw new Error(
          `${component.type}: materialization restored localized defaults removed during generation.`
        );
      }
    });
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
      locales,
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
