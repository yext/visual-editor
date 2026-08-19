import fs from "fs-extra";
import {
  Node,
  type ArrayLiteralExpression,
  type ObjectLiteralExpression,
  Project,
  SyntaxKind,
} from "ts-morph";
import {
  supportedPageSetTypes,
  type PageSetType,
} from "../../sectionLibrary.ts";

const project = new Project({ compilerOptions: { allowJs: true } });

export type SharedSection = {
  id: string;
  pageSetTypes: PageSetType[];
};

export type SharedSectionRegistry = {
  sections: SharedSection[];
  rootPageSetTypes: PageSetType[];
};

/** Reads static shared-component metadata from a Section Library registry. */
export const readSharedSectionRegistry = (
  sourcePath: string
): SharedSectionRegistry | undefined => {
  if (!fs.existsSync(sourcePath)) {
    return undefined;
  }
  const sourceFile = project.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, "utf8"),
    { overwrite: true }
  );
  try {
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    const sharedSections = exportedDeclarations
      .get("sharedSections")
      ?.find(Node.isVariableDeclaration);
    const sharedComponents = exportedDeclarations
      .get("sharedComponents")
      ?.find(Node.isVariableDeclaration);
    const sharedRootConfigs = exportedDeclarations
      .get("sharedRootConfigs")
      ?.find(Node.isVariableDeclaration);
    const sharedRootAllowedComponentIds = exportedDeclarations
      .get("sharedRootAllowedComponentIds")
      ?.find(Node.isVariableDeclaration);
    const sharedRootPageSetTypes = exportedDeclarations
      .get("sharedRootPageSetTypes")
      ?.find(Node.isVariableDeclaration);
    if (
      !sharedSections ||
      !sharedComponents ||
      !sharedRootConfigs ||
      !sharedRootAllowedComponentIds ||
      !sharedRootPageSetTypes
    ) {
      throw new Error(
        `${sourcePath} must export sharedSections, sharedComponents, sharedRootConfigs, sharedRootAllowedComponentIds, and sharedRootPageSetTypes`
      );
    }
    const values = getArrayLiteral(
      sharedSections.getInitializer()
    )?.getElements();
    if (!values) {
      throw new Error(`${sourcePath} sharedSections must be an array literal`);
    }
    return {
      sections: values.map((value, index) => {
        const metadata = value.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!metadata) {
          throw new Error(
            `${sourcePath} sharedSections[${index}] must be an object literal`
          );
        }
        const id = getStringProperty(metadata, "id", sourcePath, index);
        const pageSetTypes = getPageSetTypes(
          metadata
            .getProperty("pageSetTypes")
            ?.asKind(SyntaxKind.PropertyAssignment)
            ?.getInitializer(),
          sourcePath,
          `sharedSections[${index}].pageSetTypes`
        );
        return { id, pageSetTypes };
      }),
      rootPageSetTypes: getPageSetTypes(
        sharedRootPageSetTypes.getInitializer(),
        sourcePath,
        "sharedRootPageSetTypes"
      ),
    };
  } finally {
    sourceFile.forget();
  }
};

const getStringProperty = (
  metadata: ObjectLiteralExpression,
  name: string,
  sourcePath: string,
  index: number
): string => {
  const value = metadata
    .getProperty(name)
    ?.asKind(SyntaxKind.PropertyAssignment)
    ?.getInitializer()
    ?.asKind(SyntaxKind.StringLiteral)
    ?.getLiteralValue();
  if (!value) {
    throw new Error(
      `${sourcePath} sharedSections[${index}].${name} must be a non-empty string`
    );
  }
  return value;
};

const getPageSetTypes = (
  value: Node | undefined,
  sourcePath: string,
  propertyPath: string
): PageSetType[] => {
  const values = getArrayLiteral(value)?.getElements();
  if (!values || values.length === 0) {
    throw new Error(`${sourcePath} ${propertyPath} must be a non-empty array`);
  }
  return values.map((value) => {
    const pageSetType = value
      .asKind(SyntaxKind.StringLiteral)
      ?.getLiteralValue();
    const supportedPageSetType = supportedPageSetTypes.find(
      (supportedValue) => supportedValue === pageSetType
    );
    if (!supportedPageSetType) {
      throw new Error(
        `${sourcePath} ${propertyPath} must contain only ENTITY, DIRECTORY, or LOCATOR`
      );
    }
    return supportedPageSetType;
  });
};

const getArrayLiteral = (
  value: Node | undefined
): ArrayLiteralExpression | undefined => {
  return (
    value?.asKind(SyntaxKind.ArrayLiteralExpression) ??
    value
      ?.asKind(SyntaxKind.AsExpression)
      ?.getExpression()
      .asKind(SyntaxKind.ArrayLiteralExpression)
  );
};
