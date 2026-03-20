import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LAYOUT,
  generateRegistryTemplateFiles,
} from "./registryTemplateGenerator.js";

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);
const FIXTURE_ROOT = path.join(
  PACKAGE_ROOT,
  "test-fixtures",
  "registryTemplateGenerator"
);
const FIXTURE_SEED_ROOT = path.join(FIXTURE_ROOT, "seed");
const FIXTURE_WORKSPACE_ROOT = path.join(FIXTURE_ROOT, "workspace");
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

beforeEach(() => {
  prepareFixtureWorkspace();
});

afterEach(() => {
  vi.restoreAllMocks();
  resetFixtureWorkspace();
});

describe.sequential("generateRegistryTemplateFiles", () => {
  it("generates registry config, template, manifest fallback, and edit wiring", () => {
    const rootDir = getFixtureWorkspaceRoot();
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
    expect(generatedConfig).not.toContain("HeaderHeader");
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

  it("prunes stale generated outputs but preserves built-in templates", () => {
    const rootDir = getFixtureWorkspaceRoot();
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
    ).toBe(false);
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
    expect(updatedEditTemplate).not.toContain("mainConfig");
    expect(updatedEditTemplate).not.toContain('"main"');

    const manifest = readManifest(rootDir);
    expect(manifest.templates).toEqual([]);
  });

  it("refuses to overwrite a hand-authored template file", () => {
    const rootDir = getFixtureWorkspaceRoot();
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
    const rootDir = getFixtureWorkspaceRoot();
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
    const rootDir = getFixtureWorkspaceRoot();
    writeRegistryComponent(rootDir, "main", "404.tsx");

    expect(() => runGenerator(rootDir)).toThrowError(
      /Component path "src\/registry\/main\/components\/404\.tsx" must normalize to a valid TypeScript identifier/
    );
  });

  it("throws when nested folders create duplicate component names", () => {
    const rootDir = getFixtureWorkspaceRoot();
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
    const rootDir = getFixtureWorkspaceRoot();
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

function getFixtureWorkspaceRoot(): string {
  return FIXTURE_WORKSPACE_ROOT;
}

function prepareFixtureWorkspace(): void {
  resetFixtureWorkspace();

  fs.ensureDirSync(path.join(FIXTURE_WORKSPACE_ROOT, "src", "templates"));
  fs.writeFileSync(
    path.join(FIXTURE_WORKSPACE_ROOT, "src", "templates", "edit.tsx"),
    EDIT_TEMPLATE_SOURCE
  );
  fs.writeFileSync(
    path.join(FIXTURE_WORKSPACE_ROOT, "src", "templates", "directory.tsx"),
    DIRECTORY_TEMPLATE_SOURCE
  );
  fs.writeFileSync(
    path.join(FIXTURE_WORKSPACE_ROOT, "src", "templates", "locator.tsx"),
    LOCATOR_TEMPLATE_SOURCE
  );
}

function resetFixtureWorkspace(): void {
  fs.removeSync(FIXTURE_WORKSPACE_ROOT);
  fs.copySync(FIXTURE_SEED_ROOT, FIXTURE_WORKSPACE_ROOT);
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
