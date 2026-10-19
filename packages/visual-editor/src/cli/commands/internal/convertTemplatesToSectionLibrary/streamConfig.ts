/**
 * Rewrites statically identifiable legacy stream configuration keys and IDs
 * using source ranges so streams, settings, and comments remain intact.
 */
import path from "node:path";
import ts from "typescript";
import type { Conversion } from "./types.ts";

/** Converts only statically identifiable legacy config keys and values, preserving surrounding text and comments. */
export const convertStreamConfig = (
  content: string,
  sourcePath: string,
  conversion: Conversion
): string => {
  const source = ts.createSourceFile(
    sourcePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  const declaration = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => Array.from(statement.declarationList.declarations))
    .find((item) => ts.isIdentifier(item.name) && item.name.text === "config");
  const expression = declaration?.initializer;
  const config =
    expression && ts.isSatisfiesExpression(expression)
      ? expression.expression
      : expression;
  if (!config || !ts.isObjectLiteralExpression(config)) {
    throw new Error(
      `Cannot safely map stream config without a config object literal: ${sourcePath}`
    );
  }
  /** Returns a static object property name when it can be mapped safely. */
  const nameOf = (
    property: ts.ObjectLiteralElementLike
  ): string | undefined => {
    if (!ts.isPropertyAssignment(property)) return undefined;
    return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
      ? property.name.text
      : undefined;
  };
  const properties = config.properties;
  const legacyLayouts = properties.find(
    (property) => nameOf(property) === "templates"
  );
  const modernLayouts = properties.find(
    (property) => nameOf(property) === "layouts"
  );
  if (legacyLayouts && modernLayouts) {
    throw new Error(
      `Stream config contains both templates and layouts: ${sourcePath}`
    );
  }
  const defaults = properties.find(
    (property) => nameOf(property) === "defaults"
  );
  const defaultObject =
    defaults &&
    ts.isPropertyAssignment(defaults) &&
    ts.isObjectLiteralExpression(defaults.initializer)
      ? defaults.initializer
      : undefined;
  if (defaults && !defaultObject) {
    throw new Error(`Cannot safely map dynamic defaults in ${sourcePath}`);
  }
  const defaultTemplate = defaultObject?.properties.find(
    (property) => nameOf(property) === "templateId"
  );
  if (
    (legacyLayouts &&
      defaultObject?.properties.some(
        (property) => nameOf(property) === "layoutId"
      )) ||
    (modernLayouts && defaultTemplate)
  ) {
    throw new Error(
      `Stream config mixes legacy and current layout keys: ${sourcePath}`
    );
  }
  if (!legacyLayouts && !defaultTemplate) return content;
  for (const [object, label] of [
    [config, "config"],
    [defaultObject, "defaults"],
  ] as const) {
    if (!object) continue;
    const seen = new Set<string>();
    for (const property of object.properties) {
      const name = nameOf(property);
      if (!name || seen.has(name)) {
        throw new Error(
          `Cannot safely map dynamic or duplicate ${label} key in ${sourcePath}`
        );
      }
      seen.add(name);
    }
  }
  if (
    defaultObject?.properties.some(
      (property) => nameOf(property) === "layoutId"
    ) &&
    defaultTemplate
  ) {
    throw new Error(
      `Stream config contains both templateId and layoutId: ${sourcePath}`
    );
  }
  const layoutIds = new Map<string, string>([
    ...conversion.templates.map(
      (template) => [template.templateId, template.templateId] as const
    ),
    ...conversion.templates.map(
      (template) =>
        [path.basename(template.directory), template.templateId] as const
    ),
    ["directory", conversion.directoryLayoutId],
    ["locator", conversion.locatorLayoutId],
    [conversion.directoryLayoutId, conversion.directoryLayoutId],
    [conversion.locatorLayoutId, conversion.locatorLayoutId],
  ]);
  const edits: { start: number; end: number; value: string }[] = [];
  if (legacyLayouts) {
    if (
      !ts.isPropertyAssignment(legacyLayouts) ||
      !ts.isObjectLiteralExpression(legacyLayouts.initializer)
    ) {
      throw new Error(`Cannot safely map dynamic templates in ${sourcePath}`);
    }
    edits.push({
      start: legacyLayouts.name.getStart(source),
      end: legacyLayouts.name.end,
      value: "layouts",
    });
    const seen = new Set<string>();
    for (const property of legacyLayouts.initializer.properties) {
      const oldId = nameOf(property);
      if (!oldId || !ts.isPropertyAssignment(property)) {
        throw new Error(
          `Cannot safely map dynamic template entry in ${sourcePath}`
        );
      }
      const newId = layoutIds.get(oldId);
      if (!newId || seen.has(newId)) {
        throw new Error(
          `Cannot uniquely map template entry ${JSON.stringify(oldId)} in ${sourcePath}`
        );
      }
      seen.add(newId);
      if (newId !== oldId) {
        edits.push({
          start: property.name.getStart(source),
          end: property.name.end,
          value: JSON.stringify(newId),
        });
      }
    }
  }
  if (defaultTemplate) {
    if (!ts.isPropertyAssignment(defaultTemplate))
      throw new Error(`Cannot safely map templateId in ${sourcePath}`);
    if (
      !ts.isStringLiteral(defaultTemplate.initializer) &&
      !ts.isNoSubstitutionTemplateLiteral(defaultTemplate.initializer)
    ) {
      throw new Error(`Cannot safely map dynamic template ID in ${sourcePath}`);
    }
    const mappedId = layoutIds.get(defaultTemplate.initializer.text);
    if (!mappedId) {
      throw new Error(
        `Cannot map template ID ${JSON.stringify(defaultTemplate.initializer.text)} in ${sourcePath}`
      );
    }
    edits.push({
      start: defaultTemplate.name.getStart(source),
      end: defaultTemplate.name.end,
      value: "layoutId",
    });
    edits.push({
      start: defaultTemplate.initializer.getStart(source),
      end: defaultTemplate.initializer.end,
      value: JSON.stringify(mappedId),
    });
  }
  return edits
    .sort((left, right) => right.start - left.start)
    .reduce(
      (updated, edit) =>
        `${updated.slice(0, edit.start)}${edit.value}${updated.slice(edit.end)}`,
      content
    );
};
