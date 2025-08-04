import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const project = new Project({
  tsConfigFilePath: path.resolve(
    __dirname,
    "../../packages/visual-editor/tsconfig.json",
  ),
  skipAddingFilesFromTsConfig: true,
});

const componentCategoriesPath = path.resolve(
  __dirname,
  "../../packages/visual-editor/src/components/_componentCategories.ts",
);

const componentSchemas: { [key: string]: any } = {};

/**
 * Cleans up a code string by removing extra whitespace.
 * @param codeString The string of code to clean.
 * @returns The cleaned code string.
 */
function cleanCodeString(codeString: string): string {
  // Replace newlines and tabs with a single space, then trim and collapse multiple spaces.
  return codeString
    .replace(/[\n\t]/g, " ")
    .trim()
    .replace(/\s\s+/g, " ");
}

/**
 * Extracts the default string from a msg(...) call.
 * @param codeString The string containing the msg(...) call.
 * @returns The default string, or the original string if no msg call is found.
 */
function extractMsgDefault(codeString: string): string {
  // Updated regex to capture only the content inside the quotes
  const match = codeString.match(/msg\(["'].*?["']\s*,\s*["'](.*?)["']\)/);
  if (match && match[1]) {
    return match[1];
  }
  return codeString;
}

async function generateComponentSchemas() {
  if (!fs.existsSync(componentCategoriesPath)) {
    console.error(
      `Error: Could not find '_componentCategories.ts' at ${componentCategoriesPath}`,
    );
    process.exit(1);
  }

  const componentCategoriesSourceFile = project.addSourceFileAtPath(
    componentCategoriesPath,
  );

  // Define the output path for the generated file
  const outputDir = path.resolve(__dirname, "../generated");
  const outputPath = path.join(outputDir, "component-schemas.json");

  // Clear the existing file
  try {
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath);
      console.log(`Cleared existing file: ${outputPath}`);
    }
  } catch (error) {
    console.error(`Failed to clear existing file: ${error}`);
  }

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Find all import declarations from pageSections, etc.
  const imports = componentCategoriesSourceFile.getImportDeclarations();

  for (const importDeclaration of imports) {
    const namedImports = importDeclaration.getNamedImports();
    const moduleSpecifier = importDeclaration
      .getModuleSpecifier()
      .getLiteralValue();

    if (moduleSpecifier.startsWith("./")) {
      for (const namedImport of namedImports) {
        const componentName = namedImport.getName();
        const componentFilePath = path.resolve(
          path.dirname(componentCategoriesPath),
          moduleSpecifier,
        );

        if (fs.existsSync(componentFilePath)) {
          const componentSourceFile =
            project.addSourceFileAtPath(componentFilePath);

          const componentDeclaration =
            componentSourceFile.getVariableDeclaration(componentName);

          if (componentDeclaration) {
            const initializer = componentDeclaration.getInitializer();

            if (
              initializer &&
              initializer.getKind() === SyntaxKind.ObjectLiteralExpression
            ) {
              const labelProp = initializer
                .getProperty("label")
                ?.getInitializer();
              const fieldsProp = initializer
                .getProperty("fields")
                ?.getInitializer();
              const defaultPropsProp = initializer
                .getProperty("defaultProps")
                ?.getInitializer();

              if (labelProp && fieldsProp && defaultPropsProp) {
                const label = extractMsgDefault(
                  cleanCodeString(labelProp.getText()),
                );
                const fields = cleanCodeString(fieldsProp.getText());
                const defaultProps = cleanCodeString(
                  defaultPropsProp.getText(),
                );

                componentSchemas[componentName] = {
                  label,
                  fields,
                  defaultProps,
                };
              }
            } else {
              console.warn(
                `Warning: Skipped component '${componentName}' because its initializer is not an ObjectLiteralExpression.`,
              );
            }
          }
        }
      }
    }
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(componentSchemas, null, 2),
    "utf8",
  );

  console.log("Component schemas successfully generated!");
  console.log(`Output saved to: ${outputPath}`);
}

generateComponentSchemas().catch(console.error);
