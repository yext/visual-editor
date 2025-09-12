/**
 * @fileoverview
 * This script generates a trimmed .d.ts file containing only the types
 * that are used by the specified entry points. It uses the TypeScript Compiler API
 * to parse the bundled .d.ts file, extract the type definitions for the entry points,
 * and recursively find all referenced types. The resulting types are written to
 * a new .d.ts file, preserving import statements as needed.
 */

import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const inputFilepath = path.resolve("dist/index.d.ts");
const outputFilepath = path.resolve("src/docs/ai/components.d.ts");
const entryPoints = new Set([
  "PageSectionCategoryProps",
  "ExpandedHeaderProps",
  "ExpandedFooterProps",
]);

/**
 * Parses file content using the TypeScript Compiler API to extract all
 * type, interface, and class definitions.
 * @param content The string content of a .d.ts file.
 * @returns An object mapping type names to their full definition and a Set of all type names.
 */
const parseTypes = (
  content: string
): {
  definitions: Map<string, string>;
  allTypeNames: Set<string>;
} => {
  const definitions = new Map<string, string>();
  const allTypeNames = new Set<string>();

  const sourceFile = ts.createSourceFile(
    "temp.d.ts",
    content,
    ts.ScriptTarget.ES2020,
    true
  );

  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isClassDeclaration(node)
    ) {
      const typeName = node.name?.getText(sourceFile);
      if (!typeName) {
        return;
      }

      const fullDefinition = node.getFullText(sourceFile);
      definitions.set(typeName, fullDefinition);
      allTypeNames.add(typeName);
    }
  });

  return { definitions, allTypeNames };
};

/**
 * Finds all referenced type names within a given definition by walking its AST node.
 * @param node The AST node of the definition.
 * @param sourceFile The SourceFile object for the file.
 * @param allTypeNames A Set of all known type names in the file.
 * @param importedTypes A map of all imported type names.
 * @returns An array of referenced type names.
 */
const findReferencedTypes = (
  node: ts.Node,
  sourceFile: ts.SourceFile,
  allTypeNames: Set<string>,
  importedTypes: Set<string>
): string[] => {
  const referenced = new Set<string>();

  const checkNode = (child: ts.Node) => {
    // Check for a TypeReference, which indicates a reference to another type.
    if (ts.isTypeReferenceNode(child)) {
      const typeName = child.typeName.getText(sourceFile);
      if (allTypeNames.has(typeName) || importedTypes.has(typeName)) {
        referenced.add(typeName);
      }
    }
    // Also check for a simple Identifier, as some types are just a single name.
    if (
      ts.isIdentifier(child) &&
      (allTypeNames.has(child.getText(sourceFile)) ||
        importedTypes.has(child.getText(sourceFile)))
    ) {
      referenced.add(child.getText(sourceFile));
    }

    ts.forEachChild(child, checkNode);
  };

  ts.forEachChild(node, checkNode);

  return Array.from(referenced);
};

/**
 * Parses the file content for import statements and maps imported type names to the
 * full import string.
 * @param content The string content of a .d.ts file.
 * @returns A map from imported type name to its full import string.
 */
const parseImports = (content: string): Map<string, string> => {
  const importedTypes = new Map<string, string>();
  const sourceFile = ts.createSourceFile(
    "temp.d.ts",
    content,
    ts.ScriptTarget.ES2020,
    true
  );

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      if (
        node.importClause &&
        node.importClause.namedBindings &&
        ts.isNamedImports(node.importClause.namedBindings)
      ) {
        const importString = node.getText(sourceFile);
        for (const element of node.importClause.namedBindings.elements) {
          const typeName = element.name.getText(sourceFile);
          importedTypes.set(typeName, importString);
        }
      }
    }
  });

  return importedTypes;
};

const main = () => {
  console.log("Generating ", outputFilepath);
  try {
    const fileContent = readFileSync(inputFilepath, "utf8");
    const sourceFile = ts.createSourceFile(
      "temp.d.ts",
      fileContent,
      ts.ScriptTarget.ES2020,
      true
    );

    const { definitions, allTypeNames } = parseTypes(fileContent);
    const importedTypesMap = parseImports(fileContent);
    const importedTypesSet = new Set(importedTypesMap.keys());

    const typesToKeep = new Set<string>(entryPoints);
    const importsToKeep = new Set<string>();
    let newTypesFound = true;

    // Iteratively find and add referenced types until no new ones are found.
    while (newTypesFound) {
      newTypesFound = false;
      const typesToAdd = new Set<string>();

      for (const typeName of typesToKeep) {
        const node = sourceFile.statements.find((stmt) => {
          return (
            (ts.isTypeAliasDeclaration(stmt) ||
              ts.isInterfaceDeclaration(stmt) ||
              ts.isClassDeclaration(stmt)) &&
            stmt?.name?.getText(sourceFile) === typeName
          );
        });

        if (node) {
          const referencedTypes = findReferencedTypes(
            node,
            sourceFile,
            allTypeNames,
            importedTypesSet
          );

          for (const referencedType of referencedTypes) {
            if (importedTypesSet.has(referencedType)) {
              const importStatement = importedTypesMap.get(referencedType);
              if (importStatement && !importsToKeep.has(importStatement)) {
                importsToKeep.add(importStatement);
              }
            } else if (!typesToKeep.has(referencedType)) {
              typesToAdd.add(referencedType);
              newTypesFound = true;
            }
          }
        }
      }

      for (const type of typesToAdd) {
        typesToKeep.add(type);
      }
    }

    // Construct the final output
    const output: string[] = [];
    for (const importString of importsToKeep) {
      output.push(importString);
    }

    for (const typeName of typesToKeep) {
      const definition = definitions.get(typeName);
      if (definition) {
        output.push(definition);
      }
    }

    writeFileSync(outputFilepath, output.join("\n"), "utf8");
    console.log(outputFilepath, "generated successfully.");
  } catch (error) {
    console.error(`An error occurred:`, error);
  }
};

// Execute the main function
main();
