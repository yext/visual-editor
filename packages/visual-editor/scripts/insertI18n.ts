import { Project, SyntaxKind } from "ts-morph";
import prettier from "prettier";
import fs from "fs";

// CLI flag
const isDryRun = process.argv.includes("--dry-run");

/**
 * Runs through everything under src/components and src/editor and adds i18n("...") to all appropriate strings
 */
(async () => {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
  });

  // Load all .ts/.tsx files under src/components recursively
  let sourceFiles = project.getSourceFiles([
    "src/components/**/*.{ts,tsx}",
    "src/editor/**/*.{ts,tsx}",
  ]);

  // Exclude files inside "migrations" folder or with ".test." in filename
  sourceFiles = sourceFiles.filter((sf) => {
    const filePath = sf.getFilePath();
    const fileName = sf.getBaseName();
    return !filePath.includes("/migrations/") && !fileName.includes(".test.");
  });

  for (const sourceFile of sourceFiles) {
    let modified = false;

    const hasYextFieldCall = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .some((call) => call.getExpression().getText() === "YextField");

    const hasJsx =
      sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
      sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length >
        0;

    if (!hasYextFieldCall && !hasJsx) {
      continue;
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

    // 2) Wrap displayName JSX attributes
    const jsxAttributes = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxAttribute
    );

    jsxAttributes.forEach((attr) => {
      const nameNode = attr.getFirstChildByKind(SyntaxKind.Identifier);
      const name = nameNode ? nameNode.getText() : null;
      if (!name) return;

      if (
        name === "displayName" &&
        attr.getInitializer()?.getKind() === SyntaxKind.StringLiteral &&
        !attr.getInitializer().getText().startsWith("i18n(")
      ) {
        const strValue = attr.getInitializer().getText();
        attr.getInitializer()?.replaceWithText(`{i18n(${strValue})}`);
        modified = true;
      }
    });

    // 3) Wrap label/title/description properties — exclude option arrays
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
        // Avoid wrapping if the property is inside an object in a top-level array declaration
        const parentArray = prop.getFirstAncestorByKind(
          SyntaxKind.ArrayLiteralExpression
        );
        const parentVar = parentArray?.getFirstAncestorByKind(
          SyntaxKind.VariableDeclaration
        );

        if (parentVar) {
          const varName = parentVar.getName();
          const isLikelyOptionArray = /Options$/.test(varName); // e.g., borderRadiusOptions
          if (isLikelyOptionArray) return; // skip wrapping
        }

        const strValue = initializer.getText();
        initializer.replaceWithText(`i18n(${strValue})`);
        modified = true;
      }
    });

    // 4) Wrap JSX text nodes inside JSX Elements
    const jsxText = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
    jsxText.forEach((jsxTextNode) => {
      const textValue = jsxTextNode.getText();

      // Skip if text is only whitespace or already wrapped (naive check)
      if (
        textValue.trim().length > 0 &&
        !textValue.includes("i18n(") &&
        textValue !== "|"
      ) {
        // Replace the text node with JSX expression wrapping i18n("...")
        // Note: we need to preserve the exact text, escaping quotes if necessary
        const escapedText = textValue.replace(/"/g, '\\"').trim();

        // Insert the expression {i18n("text")}
        jsxTextNode.replaceWithText(`{i18n("${escapedText}")}`);

        modified = true;
      }
    });

    // 5) Insert i18n import if needed
    if (modified) {
      const existingImport = sourceFile
        .getImportDeclarations()
        .find((imp) => imp.getModuleSpecifierValue() === "@yext/visual-editor");

      if (existingImport) {
        const namedImports = existingImport.getNamedImports();
        const hasI18n = namedImports.some(
          (named) => named.getName() === "i18n"
        );
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
        options.filepath = filePath;

        const formatted = await prettier.format(content, options);
        fs.writeFileSync(filePath, formatted);
        console.log(`Formatted: ${filePath}`);
      }
    }
  }
})();
