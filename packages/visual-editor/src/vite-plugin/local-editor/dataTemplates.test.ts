// @vitest-environment node
import os from "node:os";
import path from "node:path";
import { runInNewContext } from "node:vm";
import fs from "fs-extra";
import { Project, ts } from "ts-morph";
import { afterEach, describe, expect, it } from "vitest";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
import localEditorDataTemplate from "../templates/local-editor-data.tsx?raw";
import { createLocalEditorArtifactsManager } from "./artifacts.ts";
import { readResolvedLayoutConfigs } from "./config.ts";
import { buildLocalEditorDataTemplateSource } from "./generatedFiles.ts";

const rootDirs: string[] = [];

afterEach(() => {
  while (rootDirs.length > 0) {
    fs.removeSync(rootDirs.pop()!);
  }
});

const readTemplateConfig = (source: string) => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports: {
    config?: { name: string; stream?: { $id: string; fields: string[] } };
  } = {};
  runInNewContext(outputText, { exports });
  return exports.config;
};

describe("local editor data templates", () => {
  it("generates Entity and Directory templates that compile within src", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);
    fs.outputFileSync(
      path.join(rootDir, "stream.config.ts"),
      `export default {
        env: { PRIVATE_VALUE: "do-not-embed" },
        pageSetTypes: {
          ENTITY: { stream: { fields: ["id", { name: "name" }, "locale", "id", "$&"] } },
          DIRECTORY: { stream: { $id: "directory-stream", fields: ["id"] } }
        },
        layouts: {
          "yext-standard-library-directory": {
            stream: { $id: "directory-override", fields: ["id", "name"] }
          }
        }
      };`
    );
    const layouts: SectionLibraryLayout[] = [
      {
        metadata: {
          id: "yext-standard-library",
          displayName: "Entity",
          pageSetType: "ENTITY",
        },
        defaultLayout: {},
      },
      {
        metadata: {
          id: "yext-standard-library-directory",
          displayName: "Directory",
          pageSetType: "DIRECTORY",
        },
        defaultLayout: {},
      },
    ];
    const diagnostics: string[] = [];
    const resolved = await readResolvedLayoutConfigs(
      rootDir,
      layouts,
      diagnostics
    );
    expect(diagnostics).toEqual([]);
    const artifacts = createLocalEditorArtifactsManager({
      localEditorTemplateSource: "",
      localEditorDataTemplateSource: localEditorDataTemplate,
    });
    artifacts.syncLocalEditorDataTemplates(layouts, rootDir, resolved.layouts);

    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        strict: true,
        rootDir: "/src",
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });
    // Pages is not a dependency of this package. Model the relevant Pages
    // contracts, including the required stream $id and Template generic.
    project.createSourceFile(
      "/src/pages.d.ts",
      `declare module "@yext/pages" {
        export type TemplateProps = { document: Record<string, unknown> };
        export type GetPath<T> = (props: T) => string;
        export type Template<T> = (props: T) => unknown;
        export type TemplateConfig = {
          name?: string;
          stream?: { $id: string; fields: string[] };
        };
      }`
    );
    // A static import of this root file would violate rootDir.
    project
      .getFileSystem()
      .writeFileSync("/stream.config.ts", "export default {};");
    for (const layout of layouts) {
      const name = `local-editor-data-${layout.metadata.id}.tsx`;
      const source = fs.readFileSync(
        path.join(rootDir, "src", "templates", name),
        "utf8"
      );
      expect(source).not.toContain("stream.config.ts");
      expect(source).not.toContain("do-not-embed");
      project.createSourceFile(`/src/templates/${name}`, source);
      expect(
        project.getPreEmitDiagnostics().map((d) => d.getMessageText())
      ).toEqual([]);
      expect(readTemplateConfig(source)).toEqual({
        name: `local-editor-data-${layout.metadata.id}`,
        stream:
          layout.metadata.pageSetType === "ENTITY"
            ? {
                $id: "local-editor-data-yext-standard-library-stream",
                fields: ["id", "name", "$&"],
              }
            : { $id: "directory-override", fields: ["id", "name"] },
      });
    }
  });

  it.each([undefined, "", "   ", 42])(
    "supplies a stream id when $id is %s",
    ($id) => {
      const source = buildLocalEditorDataTemplateSource(
        localEditorDataTemplate,
        { $id, fields: ["id"] },
        "entity",
        "ENTITY"
      );
      expect(readTemplateConfig(source)?.stream?.$id).toBe(
        "local-editor-data-entity-stream"
      );
    }
  );

  it("omits the stream when none is configured", () => {
    const source = buildLocalEditorDataTemplateSource(
      localEditorDataTemplate,
      undefined,
      "directory",
      "DIRECTORY"
    );
    expect(readTemplateConfig(source)).toEqual({
      name: "local-editor-data-directory",
    });
  });
});
