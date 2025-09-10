import { StringLiteral } from "ts-morph";
import { defaultThemeConfig } from "../src/components/DefaultThemeConfig";
import { generateCssVariablesFromThemeConfig } from "../src/internal/utils/internalThemeResolver";
import path from "path";
import {
  Project,
  SourceFile,
  SyntaxKind,
  PropertyAssignment,
  ObjectLiteralExpression,
} from "ts-morph";

// Set up a ts-morph project to analyze the defaultThemeConfig object
const project = new Project();
const sourceFile: SourceFile = project.addSourceFileAtPath(
  path.resolve("src/components/DefaultThemeConfig.ts")
);
const defaultThemeConfigSrcObject = sourceFile
  .getVariableDeclarationOrThrow("defaultThemeConfig")
  .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

const allComments: Record<string, string> = {};

/**
 * A recursive function to get the leading comments from an object literal and its nested properties.
 */
function extractCommentsFromObject(
  objLiteral: ObjectLiteralExpression,
  path: string = ""
) {
  // Loop through each property in the object literal
  for (const property of objLiteral.getProperties()) {
    if (property instanceof PropertyAssignment) {
      const propertyName = property.getName();
      const currentPath = `${path}.${propertyName}`;
      const initializer2 = property.getInitializer();

      // Check the kind of the child node to get its value
      if (initializer2?.getKind() === SyntaxKind.StringLiteral) {
        const stringLiteral = initializer2 as StringLiteral;

        // TODO: fix this so that we only get the .plugin child
        // and then construct the CSS variable name

        const value = stringLiteral.getLiteralValue(); // This gets the string value
        console.log(`The value of myProperty is: ${value}`);
      }

      // Get the leading comments
      const comments = property.getLeadingCommentRanges();
      if (comments.length > 0) {
        comments.forEach((comment) => {
          // strip /** */ or // style markers
          const text = comment
            .getText()
            .replace(/^\/\*\*?|\*\/$/g, "")
            .trim();
          allComments[currentPath] = text;
        });
      }

      // Recurse on nested objects
      const initializer = property.getInitializer();
      if (initializer?.isKind(SyntaxKind.ObjectLiteralExpression)) {
        extractCommentsFromObject(initializer, currentPath);
      }
    }
  }
}

// Start the recursive process to find and log all JSDoc
extractCommentsFromObject(defaultThemeConfigSrcObject);

console.log(generateCssVariablesFromThemeConfig(defaultThemeConfig));
console.log(allComments);
