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

/** Validates the section library's migration registry and returns its length. */
export const readMigrationRegistryLength = (
  sourcePath: string
): number | undefined => {
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
    if (array.getElements().some(Node.isSpreadElement)) {
      throw new MigrationRegistryValidationError(
        "migrations/shape",
        `${sourcePath} migrationRegistry must not contain spread elements`
      );
    }

    return array.getElements().length;
  } finally {
    sourceFile.forget();
  }
};
