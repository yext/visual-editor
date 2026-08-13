import fs from "fs-extra";
import { Node, Project, SyntaxKind } from "ts-morph";
import {
  supportedPageSetTypes,
  type PageSetType,
  type SectionConfig,
} from "../../sectionLibrary.ts";

const project = new Project({ compilerOptions: { allowJs: true } });

/** Reads the static SectionConfig metadata from one section source file. */
export const readSectionFrontmatter = (
  sourcePath: string,
  componentName: string
): SectionConfig => {
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
    if (!pageSetTypes || pageSetTypes.length === 0) {
      throw new Error(
        `${sourcePath} config.pageSetTypes must be a non-empty array of page set types`
      );
    }

    const id = getString("id");
    if (!id) {
      throw new Error(`${sourcePath} config must define a valid id`);
    }
    const displayName = getString("displayName");
    if (!displayName) {
      throw new Error(
        `${sourcePath} config must define a non-empty displayName`
      );
    }
    const description = getString("description");
    if (!description) {
      throw new Error(
        `${sourcePath} config must define a non-empty description`
      );
    }
    const category = getString("category");
    if (category !== undefined && !category) {
      throw new Error(
        `${sourcePath} config category must be a non-empty string`
      );
    }

    return {
      id,
      displayName,
      description,
      pageSetTypes,
      ...(category === undefined ? {} : { category }),
    };
  } finally {
    sourceFile.forget();
  }
};
