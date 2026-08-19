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

/** A hidden internal Puck component that can appear in saved slot layout data. */
export type SharedComponent = {
  /** Stable Puck component ID stored in the layout data. */
  id: string;

  /** Page-set types that can render this hidden internal component. */
  pageSetTypes: PageSetType[];
};

/**
 * Static metadata from a Section Library shared registry.
 *
 * The generator uses this metadata to validate saved component IDs, register
 * their Puck configs, and omit them from editor add-component menus.
 */
export type SharedComponentRegistry = {
  /** Hidden internal components that can appear in saved layout data. */
  components: SharedComponent[];

  /** Page-set types that need the shared root config, even without components. */
  rootPageSetTypes: PageSetType[];
};

/**
 * Reads the optional `shared/componentRegistry.ts` Section Library contract.
 *
 * 1. Read the static component and root metadata. The registry is not executed,
 *    and its internal component source files are not inspected.
 * 2. Validate IDs and page-set types used by saved Puck slot data.
 * 3. Return the metadata used to register hidden internal components without
 *    adding them to editor menus.
 *
 * The file must export `sharedComponentMetadata`, `sharedComponentConfigs`,
 * `sharedRootConfigs`, `sharedRootAllowedComponentIds`, and
 * `sharedRootPageSetTypes`. It returns `undefined` only when the optional
 * registry file does not exist.
 */
export const readSharedComponentRegistry = (
  sourcePath: string
): SharedComponentRegistry | undefined => {
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
    const sharedComponentMetadata = exportedDeclarations
      .get("sharedComponentMetadata")
      ?.find(Node.isVariableDeclaration);
    const sharedComponentConfigs = exportedDeclarations
      .get("sharedComponentConfigs")
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
      !sharedComponentMetadata ||
      !sharedComponentConfigs ||
      !sharedRootConfigs ||
      !sharedRootAllowedComponentIds ||
      !sharedRootPageSetTypes
    ) {
      throw new Error(
        `${sourcePath} must export sharedComponentMetadata, sharedComponentConfigs, sharedRootConfigs, sharedRootAllowedComponentIds, and sharedRootPageSetTypes`
      );
    }
    const values = getArrayLiteral(
      sharedComponentMetadata.getInitializer()
    )?.getElements();
    if (!values) {
      throw new Error(
        `${sourcePath} sharedComponentMetadata must be an array literal`
      );
    }
    return {
      components: values.map((value, index) => {
        const metadata = value.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!metadata) {
          throw new Error(
            `${sourcePath} sharedComponentMetadata[${index}] must be an object literal`
          );
        }
        const id = getStringProperty(metadata, "id", sourcePath, index);
        const pageSetTypes = getPageSetTypes(
          metadata
            .getProperty("pageSetTypes")
            ?.asKind(SyntaxKind.PropertyAssignment)
            ?.getInitializer(),
          sourcePath,
          `sharedComponentMetadata[${index}].pageSetTypes`
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
      `${sourcePath} sharedComponentMetadata[${index}].${name} must be a non-empty string`
    );
  }
  return value;
};

/** Parses and validates a static page-set-type array. */
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

/** Returns an array literal, including one followed by an `as const` assertion. */
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
