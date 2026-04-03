import os from "node:os";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LAYOUT,
  generateRegistryTemplateFiles,
} from "./registryTemplateGenerator.js";

const TEMPLATES_DIRECTORY = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "templates"
);
const BASE_TEMPLATE_SOURCE = readFileSync(
  path.join(TEMPLATES_DIRECTORY, "base.tsx"),
  "utf8"
);
const EDIT_TEMPLATE_SOURCE = readFileSync(
  path.join(TEMPLATES_DIRECTORY, "edit.tsx"),
  "utf8"
);
const DIRECTORY_TEMPLATE_SOURCE = readFileSync(
  path.join(TEMPLATES_DIRECTORY, "directory.tsx"),
  "utf8"
);
const LOCATOR_TEMPLATE_SOURCE = readFileSync(
  path.join(TEMPLATES_DIRECTORY, "locator.tsx"),
  "utf8"
);

const tempRoots: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  while (tempRoots.length > 0) {
    const rootDir = tempRoots.pop();
    if (rootDir) {
      fs.removeSync(rootDir);
    }
  }
});

describe.sequential("generateRegistryTemplateFiles", () => {
  it("restores fallback main for an otherwise-empty starter", () => {
    const rootDir = createStarterFixture();

    runGenerator(rootDir);

    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "main.tsx"))
    ).toBe(true);

    const generatedTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "main.tsx"),
      "utf8"
    );
    expect(generatedTemplate).toContain('from "@yext/visual-editor";');
    expect(generatedTemplate).toContain("mainConfig");
    expect(generatedTemplate).toContain(
      "const Main: Template<TemplateRenderProps>"
    );
    expect(generatedTemplate).toContain("config={mainConfig}");

    const updatedEditTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "edit.tsx"),
      "utf8"
    );
    expect(updatedEditTemplate).toContain("mainConfig,");
    expect(updatedEditTemplate).toContain('"main": mainConfig');

    const manifest = readManifest(rootDir);
    expect(manifest.templates).toEqual([
      expect.objectContaining({
        name: "main",
        defaultLayoutData: DEFAULT_LAYOUT,
      }),
    ]);
  });

  it("generates registry config, template, manifest fallback, and edit wiring", () => {
    const rootDir = createStarterFixture();
    writeRegistryComponent(
      rootDir,
      "main",
      "Hero.tsx",
      "export const Hero = {};\n"
    );
    writeRegistryComponent(
      rootDir,
      "main",
      "header/Header.tsx",
      "export const Header = {};\n"
    );

    runGenerator(rootDir);

    const generatedConfig = fs.readFileSync(
      path.join(rootDir, "src", "registry", "main", "config.tsx"),
      "utf8"
    );
    expect(generatedConfig).toContain("export const MainConfig: Config = {");
    expect(generatedConfig).toContain("import { Hero as MainComponentHero }");
    expect(generatedConfig).toContain(
      "import { Header as MainComponentHeader }"
    );
    expect(generatedConfig).toContain('"title": "Components"');
    expect(generatedConfig).toMatch(
      /"title": "Components"[\s\S]*"components": \[\s*"Hero"\s*\]/
    );
    expect(generatedConfig).toContain('"title": "Header"');
    expect(generatedConfig).toMatch(
      /"title": "Header"[\s\S]*"components": \[\s*"Header"\s*\]/
    );

    const generatedTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "main.tsx"),
      "utf8"
    );
    expect(generatedTemplate).toContain(
      'import { MainConfig } from "../registry/main/config";'
    );
    expect(generatedTemplate).toContain(
      "const Main: Template<TemplateRenderProps>"
    );
    expect(generatedTemplate).toContain("config={MainConfig}");
    expect(generatedTemplate).toContain("export default Main;");

    const manifest = readManifest(rootDir);
    expect(manifest.templates).toEqual([
      expect.objectContaining({
        name: "main",
        defaultLayoutData: DEFAULT_LAYOUT,
      }),
    ]);

    const updatedEditTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "edit.tsx"),
      "utf8"
    );
    expect(updatedEditTemplate).toContain(
      'import { MainConfig as mainConfig } from "../registry/main/config";'
    );
    expect(updatedEditTemplate).toContain('"main": mainConfig');

    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "edit.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "directory.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "locator.tsx"))
    ).toBe(true);
  });

  it("falls back to package main after explicit registry main is removed", () => {
    const rootDir = createStarterFixture();
    const componentPath = writeRegistryComponent(
      rootDir,
      "main",
      "Hero.tsx",
      "export const Hero = {};\n"
    );

    runGenerator(rootDir);

    fs.removeSync(componentPath);
    runGenerator(rootDir);

    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "main.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(rootDir, "src", "registry", "main", "config.tsx"))
    ).toBe(false);
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "edit.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "directory.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "locator.tsx"))
    ).toBe(true);

    const updatedEditTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "edit.tsx"),
      "utf8"
    );
    expect(updatedEditTemplate).toContain("mainConfig,");
    expect(updatedEditTemplate).toContain('"main": mainConfig');

    const manifest = readManifest(rootDir);
    expect(manifest.templates).toEqual([
      expect.objectContaining({
        name: "main",
        defaultLayoutData: DEFAULT_LAYOUT,
      }),
    ]);
  });

  it("suppresses fallback main when a custom template exists", () => {
    const rootDir = createStarterFixture();
    writeRegistryComponent(
      rootDir,
      "demo-shop",
      "Hero.tsx",
      "export const Hero = {};\n"
    );

    runGenerator(rootDir);

    const updatedEditTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "edit.tsx"),
      "utf8"
    );
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "main.tsx"))
    ).toBe(false);
    expect(updatedEditTemplate).toContain(
      'import { DemoShopConfig as demoShopConfig } from "../registry/demo-shop/config";'
    );
    expect(updatedEditTemplate).toContain('"demo-shop": demoShopConfig');
    expect(updatedEditTemplate).not.toContain('"main": mainConfig');

    const manifest = readManifest(rootDir);
    expect(manifest.templates).toEqual([
      expect.objectContaining({
        name: "demo-shop",
        defaultLayoutData: DEFAULT_LAYOUT,
      }),
    ]);
  });

  it("keeps explicit hand-authored main when custom templates exist", () => {
    const rootDir = createStarterFixture();
    fs.writeFileSync(
      path.join(rootDir, "src", "templates", "main.tsx"),
      "export default function Main() { return null; }\n"
    );
    writeRegistryComponent(
      rootDir,
      "demo-shop",
      "Hero.tsx",
      "export const Hero = {};\n"
    );

    runGenerator(rootDir);

    const updatedEditTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "edit.tsx"),
      "utf8"
    );
    expect(updatedEditTemplate).toContain("mainConfig,");
    expect(updatedEditTemplate).toContain('"main": mainConfig');
    expect(updatedEditTemplate).toContain(
      'import { DemoShopConfig as demoShopConfig } from "../registry/demo-shop/config";'
    );
    expect(updatedEditTemplate).toContain('"demo-shop": demoShopConfig');
  });

  it("refuses to overwrite a hand-authored template file", () => {
    const rootDir = createStarterFixture();
    writeRegistryComponent(
      rootDir,
      "main",
      "Hero.tsx",
      "export const Hero = {};\n"
    );

    const handAuthoredTemplatePath = path.join(
      rootDir,
      "src",
      "templates",
      "main.tsx"
    );
    const handAuthoredSource =
      "export default function Main() { return null; }\n";
    fs.writeFileSync(handAuthoredTemplatePath, handAuthoredSource);

    expect(() => runGenerator(rootDir)).toThrowError(
      /Refusing to overwrite hand-authored template "main".*buildTemplateSource/
    );
    expect(fs.readFileSync(handAuthoredTemplatePath, "utf8")).toBe(
      handAuthoredSource
    );
  });

  it("rejects template names that do not normalize to valid identifiers", () => {
    const rootDir = createStarterFixture();
    writeRegistryComponent(
      rootDir,
      "404",
      "Hero.tsx",
      "export const Hero = {};\n"
    );

    expect(() => runGenerator(rootDir)).toThrowError(
      /Template name "404" must normalize to a valid TypeScript identifier/
    );
  });

  it("rejects component paths that do not normalize to valid identifiers", () => {
    const rootDir = createStarterFixture();
    writeRegistryComponent(rootDir, "main", "404.tsx");

    expect(() => runGenerator(rootDir)).toThrowError(
      /Component path "src\/registry\/main\/components\/404\.tsx" must normalize to a valid TypeScript identifier/
    );
  });

  it("throws when nested folders create duplicate component names", () => {
    const rootDir = createStarterFixture();
    writeRegistryComponent(
      rootDir,
      "main",
      "Header.tsx",
      "export const Header = {};\n"
    );
    writeRegistryComponent(
      rootDir,
      "main",
      "header/Header.tsx",
      "export const Header = {};\n"
    );

    expect(() => runGenerator(rootDir)).toThrowError(
      /both normalize to "Header"/
    );
  });

  it("skips reserved registry template names", () => {
    const rootDir = createStarterFixture();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    writeRegistryComponent(
      rootDir,
      "directory",
      "Hero.tsx",
      "export const Hero = {};\n"
    );

    runGenerator(rootDir);

    expect(warnSpy).toHaveBeenCalledWith(
      'Skipping registry template "directory" because it conflicts with a reserved componentRegistry key'
    );
    expect(
      fs.existsSync(
        path.join(rootDir, "src", "registry", "directory", "config.tsx")
      )
    ).toBe(false);
    expect(
      fs.readFileSync(
        path.join(rootDir, "src", "templates", "edit.tsx"),
        "utf8"
      )
    ).not.toContain("../registry/directory/config");
  });
});

function runGenerator(rootDir: string): void {
  generateRegistryTemplateFiles({
    rootDir,
    generatedBaseTemplateSource: BASE_TEMPLATE_SOURCE,
  });
}

function createStarterFixture(): string {
  const rootDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "visual-editor-registry-generator-")
  );
  tempRoots.push(rootDir);

  fs.ensureDirSync(path.join(rootDir, "src", "registry"));
  fs.ensureDirSync(path.join(rootDir, "src", "templates"));
  fs.writeFileSync(path.join(rootDir, "src", "index.css"), "");
  fs.writeFileSync(
    path.join(rootDir, ".template-manifest.json"),
    `${JSON.stringify({ templates: [] }, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(rootDir, "src", "templates", "edit.tsx"),
    EDIT_TEMPLATE_SOURCE
  );
  fs.writeFileSync(
    path.join(rootDir, "src", "templates", "directory.tsx"),
    DIRECTORY_TEMPLATE_SOURCE
  );
  fs.writeFileSync(
    path.join(rootDir, "src", "templates", "locator.tsx"),
    LOCATOR_TEMPLATE_SOURCE
  );

  return rootDir;
}

function writeRegistryComponent(
  rootDir: string,
  templateName: string,
  relativePath: string,
  source = "export const PlaceholderComponent = {};\n"
): string {
  const componentPath = path.join(
    rootDir,
    "src",
    "registry",
    templateName,
    "components",
    relativePath
  );
  fs.ensureDirSync(path.dirname(componentPath));
  fs.writeFileSync(componentPath, source);
  return componentPath;
}

function readManifest(rootDir: string): { templates: unknown[] } {
  return JSON.parse(
    fs.readFileSync(path.join(rootDir, ".template-manifest.json"), "utf8")
  ) as { templates: unknown[] };
}
