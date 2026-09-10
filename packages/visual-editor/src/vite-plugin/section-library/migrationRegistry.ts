import fs from "fs-extra";
import { Node, Project, SyntaxKind } from "ts-morph";

const project = new Project();

export class MigrationRegistryValidationError extends Error {
  constructor(
    readonly rule: string,
    message: string
  ) {
    super(message);
  }
}

/** Validates the section library's migration registry. */
export const readMigrationRegistryIds = (
  sourcePath: string
): string[] | undefined => {
  if (!fs.existsSync(sourcePath)) {
    return undefined;
  }

  const sourceFile = project.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, "utf8"),
    { overwrite: true }
  );
  try {
    const declaration = sourceFile
      .getExportedDeclarations()
      .get("migrationRegistry")
      ?.find(Node.isVariableDeclaration);
    if (!declaration) {
      throw new MigrationRegistryValidationError(
        "migrations/export",
        `${sourcePath} must export migrationRegistry`
      );
    }

    const initializer = declaration.getInitializer();
    const array =
      initializer?.asKind(SyntaxKind.ArrayLiteralExpression) ??
      initializer
        ?.asKind(SyntaxKind.AsExpression)
        ?.getExpression()
        .asKind(SyntaxKind.ArrayLiteralExpression);
    if (!array) {
      throw new MigrationRegistryValidationError(
        "migrations/shape",
        `${sourcePath} migrationRegistry must be an array literal`
      );
    }

    const ids = array.getElements().map((element, index) => {
      const entry = element.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!entry) {
        throw new MigrationRegistryValidationError(
          "migrations/shape",
          `${sourcePath} migrationRegistry[${index}] must be an object literal`
        );
      }
      const id = entry
        .getProperty("id")
        ?.asKind(SyntaxKind.PropertyAssignment)
        ?.getInitializer()
        ?.asKind(SyntaxKind.StringLiteral)
        ?.getLiteralValue();
      if (!id?.trim()) {
        throw new MigrationRegistryValidationError(
          "migrations/id",
          `${sourcePath} migrationRegistry[${index}].id must be a non-empty string literal`
        );
      }
      if (!entry.getProperty("migration")) {
        throw new MigrationRegistryValidationError(
          "migrations/shape",
          `${sourcePath} migrationRegistry[${index}] must define migration`
        );
      }
      return id;
    });

    if (new Set(ids).size !== ids.length) {
      throw new MigrationRegistryValidationError(
        "migrations/duplicate-id",
        `${sourcePath} migration IDs must be unique`
      );
    }
    return ids;
  } finally {
    sourceFile.forget();
  }
};
