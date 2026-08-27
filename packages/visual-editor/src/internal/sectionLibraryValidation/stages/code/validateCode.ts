import path from "node:path";
import fs from "fs-extra";
import { Node, Project, type SourceFile, SyntaxKind } from "ts-morph";
import {
  evaluateDeniedPackages,
  evaluateForNodeBuiltins,
  evaluateUnsupportedPackageImports,
  type ImportReference,
  type ImportSyntaxKind,
} from "./importRules.ts";
import { xssRules } from "./xssRules.ts";
import type { ValidationIssue } from "../../types.ts";

/**
 * validateCode validates the section library's source code for obvious bad patterns.
 * The goal is a fast-running, best-effort security check rather than a comprehensive scan.
 * YextCI will perform the authoritative code scanning after upload.
 */
export const validateCode = (rootDir: string): ValidationIssue[] => {
  const project = new Project({
    compilerOptions: { allowJs: true, jsx: 4 },
    skipAddingFilesFromTsConfig: true,
  });

  const sourcePaths = discoverSourceFiles(path.join(rootDir, "src", "library"));

  const sourceFiles = sourcePaths.map((sourcePath) =>
    project.createSourceFile(sourcePath, fs.readFileSync(sourcePath, "utf8"), {
      overwrite: true,
    })
  );

  return sourceFiles.flatMap((sourceFile) => {
    const filePath = path.relative(rootDir, sourceFile.getFilePath());
    const references = extractImportReferences(sourceFile, filePath);
    return [
      ...references.flatMap((reference) => [
        ...evaluateUnsupportedPackageImports(reference),
        ...evaluateForNodeBuiltins(reference),
        ...evaluateDeniedPackages(reference),
      ]),
      ...findXssIssues(sourceFile, filePath),
    ];
  });
};

/** discoverSourceFiles gathers all js/jsx/ts/tsx file under the give directory. */
const discoverSourceFiles = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry): string[] => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return entry.name === ".generated"
          ? []
          : discoverSourceFiles(entryPath);
      }
      return entry.isFile() && /\.(?:js|jsx|ts|tsx)$/.test(entry.name)
        ? [entryPath]
        : [];
    });
};

export const extractImportReferences = (
  sourceFile: SourceFile,
  filePath: string
): ImportReference[] => {
  const references: ImportReference[] = [];

  const addReference = (
    moduleSpecifier: Node,
    syntaxKind: ImportSyntaxKind,
    isTypeOnly: boolean
  ): void => {
    const value = getLiteralString(moduleSpecifier);
    if (value === undefined) {
      return;
    }
    const position = sourceFile.getLineAndColumnAtPos(
      moduleSpecifier.getStart()
    );
    references.push({
      moduleSpecifier: value,
      syntaxKind,
      isTypeOnly,
      filePath,
      line: position.line,
      column: position.column,
    });
  };

  sourceFile.forEachDescendant((node) => {
    // Extract static imports, including side-effect and type-only imports.
    if (Node.isImportDeclaration(node)) {
      const clause = node.getImportClause();
      const namedImports = clause?.getNamedImports() ?? [];
      const runtime =
        !clause ||
        (!clause.isTypeOnly() &&
          (!!clause.getDefaultImport() ||
            !!clause.getNamespaceImport() ||
            namedImports.length === 0 ||
            namedImports.some((specifier) => !specifier.isTypeOnly())));

      addReference(node.getModuleSpecifier(), "import", !runtime);
      return;
    }

    // Extract module references from re-export declarations.
    if (Node.isExportDeclaration(node) && node.getModuleSpecifier()) {
      const runtime =
        !node.isTypeOnly() &&
        (node.getNamedExports().length === 0 ||
          node.getNamedExports().some((specifier) => !specifier.isTypeOnly()));

      addReference(node.getModuleSpecifier()!, "export", !runtime);
      return;
    }

    // Extract CommonJS require calls and dynamic imports.
    if (Node.isCallExpression(node)) {
      const expression = node.getExpression();
      const argument = node.getArguments()[0];

      if (
        argument &&
        Node.isIdentifier(expression) &&
        expression.getText() === "require"
      ) {
        addReference(argument, "require", false);
      } else if (
        argument &&
        expression.getKind() === SyntaxKind.ImportKeyword
      ) {
        addReference(argument, "dynamic-import", false);
      }
    }
  });

  return references;
};

const findXssIssues = (
  sourceFile: SourceFile,
  filePath: string
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const addIssue = (node: Node, rule: string, message: string): void => {
    const position = sourceFile.getLineAndColumnAtPos(node.getStart());
    issues.push({
      category: "code",
      filePath,
      line: position.line,
      column: position.column,
      message,
      rule,
    });
  };

  sourceFile.forEachDescendant((node) => {
    for (const rule of xssRules) {
      const message = rule.evaluate(node);
      if (message) {
        addIssue(node, rule.name, message);
      }
    }
  });

  return issues;
};

const getLiteralString = (node: Node | undefined): string | undefined => {
  if (!node) {
    return;
  }
  if (
    Node.isStringLiteral(node) ||
    Node.isNoSubstitutionTemplateLiteral(node)
  ) {
    return node.getLiteralValue();
  }
};
