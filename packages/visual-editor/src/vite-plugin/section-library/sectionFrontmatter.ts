import fs from "fs-extra";
import { Project, SyntaxKind } from "ts-morph";

export type SectionFrontmatter = {
  hasSectionConfigType: boolean;
  isConfigObject: boolean;
  displayName?: string | null;
  description?: string | null;
  category?: string | null;
  pageSetTypes?: string[];
};

const project = new Project();

/** Reads the static SectionConfig metadata from one section source file. */
export const readSectionFrontmatter = (
  sourcePath: string,
  id: string
): SectionFrontmatter => {
  const sourceFile = project.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, "utf8"),
    { overwrite: true }
  );
  try {
    const component =
      sourceFile.getFunction(id) ?? sourceFile.getVariableDeclaration(id);
    if (!component?.isExported()) {
      throw new Error(`${sourcePath} must named-export ${id}`);
    }

    const config = sourceFile.getVariableDeclaration("config");
    if (!config?.isExported()) {
      throw new Error(`${sourcePath} must named-export config`);
    }
    const object = config
      .getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!object) {
      return {
        hasSectionConfigType:
          config.getTypeNode()?.getText() === "SectionConfig",
        isConfigObject: false,
      };
    }

    const getString = (name: string): string | null | undefined => {
      const value = object
        .getProperty(name)
        ?.asKind(SyntaxKind.PropertyAssignment)
        ?.getInitializer();
      if (!value) {
        return undefined;
      }
      return value.asKind(SyntaxKind.StringLiteral)?.getLiteralValue() ?? null;
    };
    const pageSetTypes = object
      .getProperty("pageSetTypes")
      ?.asKind(SyntaxKind.PropertyAssignment)
      ?.getInitializer()
      ?.asKind(SyntaxKind.ArrayLiteralExpression)
      ?.getElements()
      .map((element) => {
        return element.asKind(SyntaxKind.StringLiteral)?.getLiteralValue();
      });

    return {
      hasSectionConfigType: config.getTypeNode()?.getText() === "SectionConfig",
      isConfigObject: true,
      displayName: getString("displayName"),
      description: getString("description"),
      category: getString("category"),
      ...(pageSetTypes?.every((pageSetType) => pageSetType !== undefined)
        ? { pageSetTypes: pageSetTypes as string[] }
        : {}),
    };
  } finally {
    sourceFile.forget();
  }
};
