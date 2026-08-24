import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { convertTemplatesToSectionLibrary } from "./convertTemplatesToSectionLibrary.ts";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("convertTemplatesToSectionLibrary", () => {
  it("accepts root metadata while validating content section references", () => {
    const targetDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "convert-templates-")
    );
    temporaryDirectories.push(targetDirectory);
    const templateDirectory = path.join(
      targetDirectory,
      "src",
      "registry",
      "example"
    );
    const componentsDirectory = path.join(templateDirectory, "components");
    fs.mkdirSync(componentsDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(templateDirectory, "template.json"),
      JSON.stringify({
        displayName: "Example",
        previewImageUrl: "",
      })
    );
    fs.writeFileSync(
      path.join(templateDirectory, "defaultLayout.json"),
      JSON.stringify({
        root: { type: "root", props: {} },
        zones: {},
        content: [{ type: "ExampleSection", props: {} }],
      })
    );
    fs.writeFileSync(
      path.join(componentsDirectory, "ExampleSection.tsx"),
      [
        'import { type YextComponentConfig } from "@yext/visual-editor";',
        "",
        "export const ExampleSection: YextComponentConfig = {",
        '  label: "Example Section",',
        "};",
      ].join("\n")
    );

    expect(() =>
      convertTemplatesToSectionLibrary({
        apply: false,
        deleteSource: false,
        targetDirectory,
        write: () => {},
      })
    ).not.toThrow();
  });
});
