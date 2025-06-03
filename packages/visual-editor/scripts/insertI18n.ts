import {
  Project,
  SyntaxKind,
  Node,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunction,
} from "ts-morph";
import prettier from "prettier";
import fs from "fs";

const isDryRun = process.argv.includes("--dry-run");

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

    sourceFile.getVariableDeclarations().forEach((decl) => {
      const typeNode = decl.getTypeNode();
      const name = decl.getName();
      if (typeNode?.getText().startsWith("ComponentConfig")) {
        componentConfigVars.add(name);
      }
    });

    sourceFile.getVariableDeclarations().forEach((decl) => {
      const typeNode = decl.getTypeNode();
      const name = decl.getName();
      if (typeNode?.getText()?.startsWith("Fields<")) {
        fieldConstVars.add(name);
      }
    });

    // We will collect all nodes to modify + their function ancestors here
    type FuncNode = FunctionDeclaration | FunctionExpression | ArrowFunction;

    const functionsToAddT = new Set<FuncNode>();

    // 1) JSX attributes to wrap
    const attributesToWrap = new Set(["displayName", "aria-label"]);
    const jsxAttrsToModify: {
      attr: Node;
      raw: string;
      funcAncestor: FuncNode | undefined;
    }[] = [];

    sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach((attr) => {
      const nameNode = attr.getFirstChildByKind(SyntaxKind.Identifier);
      const name = nameNode?.getText();
      const init = attr.getInitializer();

      if (
        attributesToWrap.has(name || "") &&
        init?.getKind() === SyntaxKind.StringLiteral &&
        !init.getText().startsWith("t(")
      ) {
        const raw = init.getText().slice(1, -1);
        const funcAncestor = attr.getFirstAncestor(
          (a) =>
            Node.isFunctionDeclaration(a) ||
            Node.isFunctionExpression(a) ||
            Node.isArrowFunction(a)
        ) as FuncNode | undefined;
        jsxAttrsToModify.push({ attr, raw, funcAncestor });
      }
    });

    // 2) Object props like label/title/description — skip ComponentConfig + Fields<T>
    const keysToWrap = new Set(["label", "title", "description"]);
    const objectPropsToModify: {
      prop: Node;
      raw: string;
      funcAncestor: FuncNode | undefined;
    }[] = [];

    sourceFile
      .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
      .forEach((prop) => {
        const nameNode = prop.getNameNode();
        const initializer = prop.getInitializer();
        const keyName = nameNode?.getText().replace(/['"]/g, "");

        if (
          !keysToWrap.has(keyName || "") ||
          initializer?.getKind() !== SyntaxKind.StringLiteral ||
          initializer.getText().startsWith("t(")
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

        const funcAncestor = prop.getFirstAncestor(
          (a) =>
            Node.isFunctionDeclaration(a) ||
            Node.isFunctionExpression(a) ||
            Node.isArrowFunction(a)
        ) as FuncNode | undefined;

        objectPropsToModify.push({ prop, raw, funcAncestor });
      });

    // 3) Wrap raw JSX text
    const jsxTextToModify: {
      node: Node;
      raw: string;
      funcAncestor: FuncNode | undefined;
    }[] = [];
    sourceFile
      .getDescendantsOfKind(SyntaxKind.JsxText)
      .forEach((jsxTextNode) => {
        const raw = jsxTextNode.getText().trim();
        if (raw && !raw.includes("t(") && raw !== "|") {
          const funcAncestor = jsxTextNode.getFirstAncestor(
            (a) =>
              Node.isFunctionDeclaration(a) ||
              Node.isFunctionExpression(a) ||
              Node.isArrowFunction(a)
          ) as FuncNode | undefined;
          jsxTextToModify.push({ node: jsxTextNode, raw, funcAncestor });
        }
      });

    // Now modify all collected nodes and track functions to add t()
    for (const { attr, raw, funcAncestor } of jsxAttrsToModify) {
      const key = toCamelCase(raw);
      attr.setInitializer(
        `{t("${key}", { defaultValue: "${escapeString(raw)}" })}`
      );
      modified = true;
      if (funcAncestor) functionsToAddT.add(funcAncestor);
    }

    for (const { prop, raw, funcAncestor } of objectPropsToModify) {
      const key = toCamelCase(raw);
      const initializer = prop.getInitializer();
      if (initializer) {
        initializer.replaceWithText(
          `t("${key}", { defaultValue: "${escapeString(raw)}" })`
        );
        modified = true;
        if (funcAncestor) functionsToAddT.add(funcAncestor);
      }
    }

    for (const { node, raw, funcAncestor } of jsxTextToModify) {
      const key = toCamelCase(raw);
      const escaped = escapeString(raw);
      node.replaceWithText(`{t("${key}", { defaultValue: "${escaped}" })}`);
      modified = true;
      if (funcAncestor) functionsToAddT.add(funcAncestor);
    }

    // Insert `const { t } = useTranslation();` at top of each function that needs it
    for (const func of functionsToAddT) {
      const body = func.getBody();
      if (!body) continue;
      // Check if already has this exact statement
      if (
        body
          .getStatements()
          .some((stmt) =>
            stmt.getText().includes("const { t } = useTranslation()")
          )
      )
        continue;

      body.insertStatements(0, "const { t } = useTranslation();");
      modified = true;
    }

    // Ensure react-i18next import exists if modified
    if (modified) {
      const existingImport = sourceFile
        .getImportDeclarations()
        .find((imp) => imp.getModuleSpecifierValue() === "react-i18next");
      if (existingImport) {
        const hasI18n = existingImport
          .getNamedImports()
          .some((n) => n.getName() === "useTranslation");
        if (!hasI18n) existingImport.addNamedImport("useTranslation");
      } else {
        sourceFile.insertImportDeclaration(0, {
          namedImports: ["useTranslation"],
          moduleSpecifier: "react-i18next",
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
