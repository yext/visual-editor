import { Project, SyntaxKind } from "ts-morph";
import prettier from "prettier";
import fs from "fs";

const isDryRun = process.argv.includes("--dry-run");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

// Load all .ts/.tsx files under src/components recursively
let sourceFiles = project.getSourceFiles("src/components/**/*.{ts,tsx}");

// Exclude files inside "migrations" folder or with ".test." in filename
sourceFiles = sourceFiles.filter((sf) => {
  const filePath = sf.getFilePath();
  const fileName = sf.getBaseName();
  return !filePath.includes("/migrations/") && !fileName.includes(".test.");
});

sourceFiles.forEach(async (sourceFile) => {
  let modified = false;

  // Skip files with no YextField call and no JSX elements
  const hasYextFieldCall = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .some((call) => call.getExpression().getText() === "YextField");
  const hasJsx =
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length >
      0;

  if (!hasYextFieldCall && !hasJsx) {
    return;
  }

  // 1) Wrap first argument of YextField(...)
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .forEach((callExpr) => {
      if (callExpr.getExpression().getText() === "YextField") {
        const args = callExpr.getArguments();
        if (
          args.length > 0 &&
          args[0].getKind() === SyntaxKind.StringLiteral &&
          !args[0].getText().startsWith("i18n(")
        ) {
          const originalText = args[0].getText();
          args[0].replaceWithText(`i18n(${originalText})`);
          modified = true;
        }
      }
    });

  // 2) Wrap displayName="..." in JSX attributes with defensive check
  const jsxAttributes = sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxAttribute
  );

  jsxAttributes.forEach((attr) => {
    // Try manual name extraction:
    const nameNode = attr.getFirstChildByKind(SyntaxKind.Identifier);
    const name = nameNode ? nameNode.getText() : null;
    if (!name) {
      return;
    }

    if (
      name === "displayName" &&
      attr.getInitializer()?.getKind() === SyntaxKind.StringLiteral &&
      !attr.getInitializer().getText().startsWith("i18n(")
    ) {
      const strValue = attr.getInitializer().getText();
      attr.getInitializer().replaceWithText(`{i18n(${strValue})}`);
      modified = true;
    }
  });

  // 3) Wrap properties in i18n
  const stringKeysToWrap = new Set(["label", "title", "description"]);
  const jsxPropertyAssignments = sourceFile.getDescendantsOfKind(
    SyntaxKind.PropertyAssignment
  );

  jsxPropertyAssignments.forEach((prop) => {
    const nameNode = prop.getNameNode();
    const initializer = prop.getInitializer();

    if (
      nameNode &&
      stringKeysToWrap.has(nameNode.getText().replace(/['"]/g, "")) &&
      initializer?.getKind() === SyntaxKind.StringLiteral &&
      !initializer.getText().startsWith("i18n(")
    ) {
      const strValue = initializer.getText();
      initializer.replaceWithText(`i18n(${strValue})`);
      modified = true;
    }
  });

  // 4) If any modification was done, add i18n import if missing
  if (modified) {
    const existingImport = sourceFile
      .getImportDeclarations()
      .find((imp) => imp.getModuleSpecifierValue() === "@yext/visual-editor");

    if (existingImport) {
      const namedImports = existingImport.getNamedImports();
      const hasI18n = namedImports.some((named) => named.getName() === "i18n");
      if (!hasI18n) {
        existingImport.addNamedImport("i18n");
      }
    } else {
      sourceFile.insertImportDeclaration(0, {
        namedImports: ["i18n"],
        moduleSpecifier: "@yext/visual-editor",
      });
    }

    if (isDryRun) {
      console.log(`[DRY RUN] Would update: ${sourceFile.getFilePath()}`);
    } else {
      console.log(`Updated: ${sourceFile.getFilePath()}`);
      sourceFile.saveSync();

      const filePath = sourceFile.getFilePath();
      const content = fs.readFileSync(filePath, "utf-8");

      const options = (await prettier.resolveConfig(filePath)) || {};
      options.filepath = filePath; // so Prettier knows the parser

      const formatted = await prettier.format(content, options);
      fs.writeFileSync(filePath, formatted);

      console.log(`Formatted: ${filePath}`);
    }
  }
});
