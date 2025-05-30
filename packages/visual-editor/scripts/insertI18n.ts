import { Project, SyntaxKind } from "ts-morph";
import prettier from "prettier";
import fs from "fs";

const isDryRun = process.argv.includes("--dry-run");

/**
 * Runs through everything under src/components and src/editor and adds i18n("...") to all appropriate strings
 */
(async () => {
  const project = new Project({ tsConfigFilePath: "tsconfig.json" });

  let sourceFiles = project.getSourceFiles([
    "src/components/**/*.{ts,tsx}",
    "src/editor/**/*.{ts,tsx}",
  ]);

  const avoidFileNames: string[] = [
    "DefaultThemeConfig.ts",
    "componentTests.setup.ts",
  ];

  sourceFiles = sourceFiles.filter((sf) => {
    const filePath = sf.getFilePath();
    const fileName = sf.getBaseName();
    return (
      !filePath.includes("/migrations/") &&
      !fileName.includes(".test.") &&
      !avoidFileNames.includes(fileName)
    );
  });

  for (const sourceFile of sourceFiles) {
    let modified = false;

    const componentConfigVars = new Set<string>();
    const fieldConstVars = new Set<string>();

    // Collect ComponentConfig vars
    sourceFile.getVariableDeclarations().forEach((decl) => {
      const typeNode = decl.getTypeNode();
      const name = decl.getName();
      if (typeNode?.getText().startsWith("ComponentConfig")) {
        componentConfigVars.add(name);
      }
    });

    // Collect Fields<T> vars
    sourceFile.getVariableDeclarations().forEach((decl) => {
      const typeNode = decl.getTypeNode();
      const name = decl.getName();
      if (typeNode?.getText()?.startsWith("Fields<")) {
        fieldConstVars.add(name);
      }
    });

    // 1) JSX attributes
    const attributesToWrap = new Set(["displayName", "aria-label"]);
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach((attr) => {
      const nameNode = attr.getFirstChildByKind(SyntaxKind.Identifier);
      const name = nameNode?.getText();
      const init = attr.getInitializer();

      if (
        attributesToWrap.has(name || "") &&
        init?.getKind() === SyntaxKind.StringLiteral &&
        !init.getText().startsWith("i18n(")
      ) {
        const raw = init.getText().slice(1, -1);
        const key = toCamelCase(raw);
        attr.setInitializer(
          `{i18n("${key}", { defaultValue: "${escapeString(raw)}" })}`
        );
        modified = true;
      }
    });

    // 2) Object props like label/title/description — but skip ComponentConfig + Fields<T>
    const keysToWrap = new Set(["label", "title", "description"]);
    sourceFile
      .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
      .forEach((prop) => {
        const nameNode = prop.getNameNode();
        const initializer = prop.getInitializer();
        const keyName = nameNode?.getText().replace(/['"]/g, "");

        if (
          !keysToWrap.has(keyName || "") ||
          initializer?.getKind() !== SyntaxKind.StringLiteral ||
          initializer.getText().startsWith("i18n(")
        ) {
          return;
        }

        // Check if inside ComponentConfig
        const varDecl = prop.getFirstAncestorByKind(
          SyntaxKind.VariableDeclaration
        );
        if (varDecl && componentConfigVars.has(varDecl.getName())) return;

        // Check if inside Fields<T>
        if (varDecl && fieldConstVars.has(varDecl.getName())) return;

        // Avoid constants like ThemeOptions
        const parentArray = prop.getFirstAncestorByKind(
          SyntaxKind.ArrayLiteralExpression
        );
        const parentVar = parentArray?.getFirstAncestorByKind(
          SyntaxKind.VariableDeclaration
        );
        if (parentVar && /Options$/.test(parentVar.getName())) return;

        const raw = initializer.getText().slice(1, -1);
        if (/^\d+$/.test(raw) || /^\d+:\d+$/.test(raw)) return;

        const key = toCamelCase(raw);
        initializer.replaceWithText(
          `i18n("${key}", { defaultValue: "${escapeString(raw)}" })`
        );
        modified = true;
      });

    // 3) Wrap raw JSX text
    sourceFile
      .getDescendantsOfKind(SyntaxKind.JsxText)
      .forEach((jsxTextNode) => {
        const raw = jsxTextNode.getText().trim();
        if (raw && !raw.includes("i18n(") && raw !== "|") {
          const key = toCamelCase(raw);
          const escaped = escapeString(raw);
          jsxTextNode.replaceWithText(
            `{i18n("${key}", { defaultValue: "${escaped}" })}`
          );
          modified = true;
        }
      });

    // 4) Ensure i18n import exists
    if (modified) {
      const existingImport = sourceFile
        .getImportDeclarations()
        .find((imp) => imp.getModuleSpecifierValue() === "@yext/visual-editor");
      if (existingImport) {
        const hasI18n = existingImport
          .getNamedImports()
          .some((n) => n.getName() === "i18n");
        if (!hasI18n) existingImport.addNamedImport("i18n");
      } else {
        sourceFile.insertImportDeclaration(0, {
          namedImports: ["i18n"],
          moduleSpecifier: "@yext/visual-editor",
        });
      }

      const filePath = sourceFile.getFilePath();
      console.log(
        `${isDryRun ? "[DRY RUN] Would update" : "Updated"}: ${filePath}`
      );

      if (!isDryRun) {
        sourceFile.saveSync();
        const content = fs.readFileSync(filePath, "utf-8");
        const options = (await prettier.resolveConfig(filePath)) || {};
        const formatted = await prettier.format(content, {
          ...options,
          filepath: filePath,
        });
        fs.writeFileSync(filePath, formatted);
        console.log(`Formatted: ${filePath}`);
      }
    }
  }
})();

function toCamelCase(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .replace(/[^a-zA-Z0-9 ]+/g, "")
    .split(/[\s-_]+/)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
}

function escapeString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
