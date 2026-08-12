import fs from "fs-extra";
import { Node, Project, SyntaxKind } from "ts-morph";
import {
  supportedPageSetTypes,
  type PageSetType,
} from "../../sectionLibrary.ts";

export type SectionFrontmatter = {
  id?: string | null;
  displayName?: string | null;
  description?: string | null;
  category?: string | null;
  pageSetTypes?: PageSetType[];
};

const project = new Project({ compilerOptions: { allowJs: true } });

/** Reads the static SectionConfig metadata from one section source file. */
export const readSectionFrontmatter = (
  sourcePath: string,
  componentName: string
): SectionFrontmatter => {
  const sourceFile = project.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, "utf8"),
    { overwrite: true }
  );
  try {
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    const component = exportedDeclarations.get(componentName)?.find((value) => {
      return (
        Node.isFunctionDeclaration(value) || Node.isVariableDeclaration(value)
      );
    });
    if (!component) {
      throw new Error(`${sourcePath} must export '${componentName}'`);
    }

    const config = exportedDeclarations
      .get("config")
      ?.find(Node.isVariableDeclaration);
    if (!config) {
      throw new Error(`${sourcePath} must export 'config'`);
    }
    if (
      sourcePath.endsWith(".tsx") &&
      config.getTypeNode()?.getText() !== "SectionConfig"
    ) {
      throw new Error(`${sourcePath} config must use the SectionConfig type`);
    }
    const object = config
      .getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!object) {
      throw new Error(`${sourcePath} config must be an object literal`);
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
    const pageSetTypesProperty = object.getProperty("pageSetTypes");
    const pageSetTypes = pageSetTypesProperty
      ? pageSetTypesProperty
          .asKind(SyntaxKind.PropertyAssignment)
          ?.getInitializer()
          ?.asKind(SyntaxKind.ArrayLiteralExpression)
          ?.getElements()
          .map((element): PageSetType => {
            const pageSetType = element
              .asKind(SyntaxKind.StringLiteral)
              ?.getLiteralValue();
            const supportedPageSetType = supportedPageSetTypes.find(
              (value) => value === pageSetType
            );
            if (!supportedPageSetType) {
              throw new Error(
                `${sourcePath} config.pageSetTypes must contain only ENTITY, DIRECTORY, or LOCATOR`
              );
            }
            return supportedPageSetType;
          })
      : undefined;
    if (pageSetTypesProperty && !pageSetTypes) {
      throw new Error(
        `${sourcePath} config.pageSetTypes must be an array of page set types`
      );
    }

    return {
      id: getString("id"),
      displayName: getString("displayName"),
      description: getString("description"),
      category: getString("category"),
      ...(pageSetTypes ? { pageSetTypes } : {}),
    };
  } finally {
    sourceFile.forget();
  }
};
