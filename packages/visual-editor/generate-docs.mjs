import fs from "fs";
import path from "path";
import { ApiModel } from "@microsoft/api-extractor-model";

const API_JSON_PATH = path.join("temp", "visual-editor.api.json");
const OUTPUT_PATH = path.join("src", "docs", "components.md");
const SCREENSHOTS_BASE_DIR = path.join(
  "src",
  "components",
  "testing",
  "screenshots"
);

function renderTsDocNode(docNode) {
  if (!docNode) {
    return "";
  }

  switch (docNode.kind) {
    case "PlainText":
      return docNode.text;
    case "SoftBreak":
      return "\n";
    case "Section":
      return docNode.getChildNodes().map(renderTsDocNode).join("\n\n");
    default:
      return docNode.getChildNodes().map(renderTsDocNode).join("");
  }
}

function getSummary(apiItem) {
  if (!apiItem?.tsdocComment) {
    return "";
  }
  return renderTsDocNode(apiItem.tsdocComment.summarySection).trim();
}

function getCustomTagValue(apiItem, tagName) {
  if (!apiItem?.tsdocComment) {
    return "";
  }
  const block = apiItem.tsdocComment.customBlocks.find(
    (b) => b.blockTag.tagName.toUpperCase() === tagName.toUpperCase()
  );
  return block ? renderTsDocNode(block.content).trim() : "";
}

function getDefaultValue(apiItem) {
  return getCustomTagValue(apiItem, "@defaultValue");
}

function formatType(apiProperty) {
  return apiProperty.propertyTypeExcerpt.text
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function getComponentImageMarkdown(componentName) {
  const screenshotsDir = path.join(SCREENSHOTS_BASE_DIR, componentName);

  if (!fs.existsSync(screenshotsDir)) {
    return "";
  }

  try {
    const files = fs.readdirSync(screenshotsDir);
    const firstPng = files.find((file) => file.toLowerCase().endsWith(".png"));

    if (firstPng) {
      const fullImagePath = path.join(screenshotsDir, firstPng);
      const relativePath = path
        .relative(path.dirname(OUTPUT_PATH), fullImagePath)
        .replace(/\\/g, "/");

      return `![Preview of the ${componentName} component](${encodeURI(relativePath)})\n\n`;
    }
  } catch {
    // do nothing
  }

  return "";
}

function generatePropsTableMarkdown(propsTypeName, allInterfaces) {
  const propsInterface = allInterfaces.get(propsTypeName);
  if (!propsInterface) {
    return "";
  }

  const intro = getSummary(propsInterface);
  let markdown = `### Props\n\n`;
  if (intro) {
    markdown += `${intro}\n\n`;
  }

  // This map will hold props grouped by their @propCategory tag.
  const categories = new Map();

  for (const prop of propsInterface.members) {
    if (prop.kind !== "PropertySignature") {
      continue;
    }

    const category = getCustomTagValue(prop, "@propCategory") || "Other Props";
    if (!categories.has(category)) {
      // Use the summary from the first prop found in a category as the category description.
      categories.set(category, { description: getSummary(prop), props: [] });
    }
    categories.get(category).props.push(prop);
  }

  // Sort categories putting "Other Props" last.
  const sortedCategories = Array.from(categories.entries()).sort(([a], [b]) => {
    if (a === "Other Props") {
      return 1;
    }
    if (b === "Other Props") {
      return -1;
    }
    return a.localeCompare(b);
  });

  for (const [categoryName, { description, props }] of sortedCategories) {
    markdown += `#### ${categoryName}\n\n`;

    if (description) {
      markdown += `${description}\n\n`;
    }

    markdown += "| Prop | Type | Description | Default |\n";
    markdown += "|:-----|:-----|:------------|:--------|\n";

    for (const prop of props) {
      // e.g., the 'data' or 'liveVisibility' prop
      const propType = formatType(prop);
      const subInterface = allInterfaces.get(propType.replace(/\[|\]/g, ""));

      // We check for a subInterface that doesn't end in 'Props' to avoid expanding the main component props interface itself.
      if (subInterface && !subInterface.name.endsWith("Props")) {
        // It's an expandable interface like 'BannerSectionData'. Loop through its members.
        for (const subProp of subInterface.members) {
          if (subProp.kind !== "PropertySignature") {
            continue;
          }

          // Create the prefixed name, e.g., "data.text"
          const qualifiedName = `${prop.displayName}.${subProp.displayName}`;

          const row = `| \`${qualifiedName}\` | \`${formatType(subProp)}\` | ${getSummary(subProp)} | ${getDefaultValue(subProp) ? `\`${getDefaultValue(subProp)}\`` : ""} |\n`;
          markdown += row;
        }
      } else {
        // It's a simple prop like 'liveVisibility'. Render a single row for it.
        const row = `| \`${prop.displayName}\` | \`${propType}\` | ${getSummary(prop)} | ${getDefaultValue(prop) ? `\`${getDefaultValue(prop)}\`` : ""} |\n`;
        markdown += row;
      }
    }
    markdown += "\n";
  }

  return markdown;
}

function generateMarkdown() {
  const apiModel = new ApiModel();
  const apiPackage = apiModel.loadPackage(API_JSON_PATH);
  const entryPoint = apiPackage.members[0];

  const allInterfaces = new Map(
    entryPoint.members
      .filter((m) => m.kind === "Interface")
      .map((i) => [i.displayName, i])
  );

  // for vitepress document
  let markdown = `---\ntitle: Pre-Built Components\noutline: 2\n---\n\n`;

  for (const apiMember of entryPoint.members) {
    if (
      apiMember.kind !== "Variable" ||
      !apiMember.variableTypeExcerpt.text.startsWith("ComponentConfig")
    ) {
      continue;
    }

    const match = /<(\w+)>/.exec(apiMember.variableTypeExcerpt.text);
    const propsTypeName = match?.[1];
    if (!propsTypeName || !allInterfaces.has(propsTypeName)) {
      continue;
    }

    const componentName = apiMember.displayName;
    const summary = getSummary(apiMember);
    const imageMarkdown = getComponentImageMarkdown(componentName);
    const propsTableMarkdown = generatePropsTableMarkdown(
      propsTypeName,
      allInterfaces
    );

    markdown += `## ${componentName}\n\n`;
    if (summary) {
      markdown += `${summary}\n\n`;
    }
    markdown += imageMarkdown;
    markdown += propsTableMarkdown;
    markdown += "\n---\n\n";
  }

  fs.writeFileSync(OUTPUT_PATH, markdown);
  console.log(`✅ Successfully created API documentation at ${OUTPUT_PATH}`);
}

function cleanup() {
  console.log("🧹 Cleaning up intermediate build files...");
  try {
    for (const dir of ["temp"]) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    console.log("👍 Cleanup complete.");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

try {
  generateMarkdown();
} finally {
  cleanup();
}
