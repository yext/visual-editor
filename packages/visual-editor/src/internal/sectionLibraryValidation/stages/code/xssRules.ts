import { Node, SyntaxKind } from "ts-morph";

type XssRule = {
  name: string;
  evaluate(node: Node): string | undefined;
};

const assignmentOperators = new Set([
  SyntaxKind.EqualsToken,
  SyntaxKind.PlusEqualsToken,
  SyntaxKind.MinusEqualsToken,
  SyntaxKind.AsteriskEqualsToken,
  SyntaxKind.AsteriskAsteriskEqualsToken,
  SyntaxKind.SlashEqualsToken,
  SyntaxKind.PercentEqualsToken,
  SyntaxKind.LessThanLessThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  SyntaxKind.AmpersandEqualsToken,
  SyntaxKind.BarEqualsToken,
  SyntaxKind.CaretEqualsToken,
  SyntaxKind.BarBarEqualsToken,
  SyntaxKind.AmpersandAmpersandEqualsToken,
  SyntaxKind.QuestionQuestionEqualsToken,
]);

export const xssRules: XssRule[] = [
  {
    name: "xss/dangerously-set-inner-html",
    evaluate: (node) =>
      Node.isJsxAttribute(node) &&
      node.getNameNode().getText() === "dangerouslySetInnerHTML"
        ? "dangerouslySetInnerHTML is not permitted in Section Library code."
        : undefined,
  },
  {
    name: "xss/html-assignment",
    evaluate: (node) => {
      if (!Node.isBinaryExpression(node)) {
        return;
      }
      const left = node.getLeft();
      const propertyName = Node.isPropertyAccessExpression(left)
        ? left.getName()
        : Node.isElementAccessExpression(left)
          ? getLiteralString(left.getArgumentExpression())
          : undefined;
      return assignmentOperators.has(node.getOperatorToken().getKind()) &&
        propertyName !== undefined &&
        ["innerHTML", "outerHTML"].includes(propertyName)
        ? `Assignment to ${propertyName} is not permitted.`
        : undefined;
    },
  },
  {
    name: "xss/insert-adjacent-html",
    evaluate: (node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }
      const expression = node.getExpression();
      return Node.isPropertyAccessExpression(expression) &&
        expression.getName() === "insertAdjacentHTML"
        ? "insertAdjacentHTML() is not permitted."
        : undefined;
    },
  },
  {
    name: "xss/document-write",
    evaluate: (node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }
      const expression = node.getExpression();
      return Node.isPropertyAccessExpression(expression) &&
        Node.isIdentifier(expression.getExpression()) &&
        expression.getExpression().getText() === "document" &&
        ["write", "writeln"].includes(expression.getName())
        ? `document.${expression.getName()}() is not permitted.`
        : undefined;
    },
  },
  {
    name: "xss/eval",
    evaluate: (node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }
      const expression = node.getExpression();
      return Node.isIdentifier(expression) && expression.getText() === "eval"
        ? "Direct eval() is not permitted."
        : undefined;
    },
  },
  {
    name: "xss/function-constructor",
    evaluate: (node) => {
      if (!Node.isNewExpression(node) && !Node.isCallExpression(node)) {
        return;
      }
      const expression = node.getExpression();
      return Node.isIdentifier(expression) &&
        expression.getText() === "Function"
        ? "Function constructor calls are not permitted."
        : undefined;
    },
  },
  {
    name: "xss/string-timer",
    evaluate: (node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }
      const expression = node.getExpression();
      return Node.isIdentifier(expression) &&
        ["setTimeout", "setInterval"].includes(expression.getText()) &&
        getLiteralString(node.getArguments()[0]) !== undefined
        ? `${expression.getText()}() must not receive a string argument.`
        : undefined;
    },
  },
  {
    name: "xss/javascript-url",
    evaluate: (node) => {
      if (!Node.isJsxAttribute(node)) {
        return;
      }
      const initializer = node.getInitializer();
      const expression = Node.isJsxExpression(initializer)
        ? initializer.getExpression()
        : initializer;
      return getLiteralString(expression)
        ?.trim()
        .toLowerCase()
        .startsWith("javascript:")
        ? "Literal javascript: URLs are not permitted in JSX attributes."
        : undefined;
    },
  },
];

const getLiteralString = (node: Node | undefined): string | undefined => {
  if (
    Node.isStringLiteral(node) ||
    Node.isNoSubstitutionTemplateLiteral(node)
  ) {
    return node.getLiteralValue();
  }
};
