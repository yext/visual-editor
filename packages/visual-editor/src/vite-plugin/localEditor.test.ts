// @vitest-environment node
import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  buildLocalEditorDataTemplateName,
  buildLocalEditorDataTemplateSource,
  buildLocalEditorTemplateSource,
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  getLocalEditorDocument,
  getLocalEditorManifest,
  inferEntityFields,
  LEGACY_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  normalizeLocalEditorPagesStream,
} from "./localEditor.ts";
import { yextVisualEditorPlugin } from "./plugin.ts";
import { ConfigEnv, Plugin } from "vite";

const tempRoots: string[] = [];
const originalCwd = process.cwd();

afterEach(() => {
  process.chdir(originalCwd);
  while (tempRoots.length > 0) {
    const rootDir = tempRoots.pop();
    if (rootDir) {
      fs.removeSync(rootDir);
    }
  }
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe.sequential("localEditor plugin support", () => {
  beforeEach(() => {
    vi.spyOn(process, "on").mockImplementation((() => {
      return process;
    }) as typeof process.on);
    vi.spyOn(process, "exit").mockImplementation((() => {
      return undefined as never;
    }) as typeof process.exit);
  });

  it("generates local-editor.tsx and template-specific data templates in serve mode", async () => {
    const rootDir = createPluginFixture();
    writeLocalEditorStreamConfig(rootDir);
    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "local-editor.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("main")}.tsx`
        )
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("locator")}.tsx`
        )
      )
    ).toBe(true);
  });

  it("cleans generated local editor templates on process shutdown", async () => {
    const rootDir = createPluginFixture();
    writeLocalEditorStreamConfig(rootDir);
    process.chdir(rootDir);

    const signalHandlers = new Map<string, () => void>();
    vi.spyOn(process, "on").mockImplementation(((event, handler) => {
      if (
        typeof event === "string" &&
        (event === "SIGINT" || event === "SIGTERM")
      ) {
        signalHandlers.set(event, handler as () => void);
      }
      return process;
    }) as typeof process.on);
    vi.spyOn(process, "nextTick").mockImplementation(((
      callback: () => void
    ) => {
      callback();
      return {} as NodeJS.Immediate;
    }) as typeof process.nextTick);
    vi.spyOn(process, "exit").mockImplementation((() => {
      return undefined as never;
    }) as typeof process.exit);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "local-editor.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("main")}.tsx`
        )
      )
    ).toBe(true);

    signalHandlers.get("SIGINT")?.();

    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "local-editor.tsx"))
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("main")}.tsx`
        )
      )
    ).toBe(false);
  });

  it("does not generate local-editor.tsx during build mode", async () => {
    const rootDir = createPluginFixture();
    writeLocalEditorStreamConfig(rootDir);
    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "build", mode: "production" });
    await invokeBuildStartHook(plugin);

    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "local-editor.tsx"))
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("main")}.tsx`
        )
      )
    ).toBe(false);
  });

  it("never overwrites consumer-owned stream.config.ts", async () => {
    const rootDir = createPluginFixture();
    const streamConfigPath = path.join(
      rootDir,
      DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
    );
    fs.ensureDirSync(path.dirname(streamConfigPath));
    fs.writeFileSync(
      streamConfigPath,
      [
        "export default {",
        "  defaults: {",
        '    templateId: "main",',
        '    locale: "en",',
        "  },",
        "  templates: {",
        '    main: { stream: { fields: ["name"] } },',
        "  },",
        "};",
        "",
      ].join("\n")
    );

    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    expect(fs.readFileSync(streamConfigPath, "utf8")).toContain('"name"');
  });

  it("scaffolds a root stream.config.ts when none exists", async () => {
    const rootDir = createPluginFixture();
    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    const streamConfigPath = path.join(
      rootDir,
      DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
    );
    expect(fs.existsSync(streamConfigPath)).toBe(true);
    const scaffoldSource = fs.readFileSync(streamConfigPath, "utf8");
    expect(scaffoldSource).toContain("baseLocationStream");
    expect(scaffoldSource).toContain('templateId: "directory"');
    expect(scaffoldSource).toContain('"directory": {');
    expect(scaffoldSource).toContain(
      '//   $id: "local-editor-directory-stream",'
    );
    expect(scaffoldSource).toContain('//     "dm_directoryParents.name",');
    expect(scaffoldSource).toContain('//     "dm_directoryChildren.slug",');
    expect(scaffoldSource).toContain('"locator": {');
    expect(scaffoldSource).toContain(
      '//   $id: "local-editor-locator-stream",'
    );
  });

  it("scaffolds non-special templates as active streams", async () => {
    const rootDir = createPluginFixture();
    fs.writeFileSync(
      path.join(rootDir, ".template-manifest.json"),
      JSON.stringify(
        {
          templates: [
            {
              name: "directory",
              description: "Directory",
              exampleSiteUrl: "",
              layoutRequired: true,
            },
            {
              name: "locator",
              description: "Locator",
              exampleSiteUrl: "",
              layoutRequired: true,
            },
            {
              name: "main",
              description: "Main",
              exampleSiteUrl: "",
              layoutRequired: true,
            },
          ],
        },
        null,
        2
      )
    );

    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    const scaffoldSource = fs.readFileSync(
      path.join(rootDir, DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH),
      "utf8"
    );
    expect(scaffoldSource).toContain(
      [
        '    "main": {',
        "      stream: {",
        "        ...baseLocationStream,",
        '        $id: "local-editor-main-stream",',
      ].join("\n")
    );
  });

  it("falls back to legacy local-editor/stream.json when explicitly configured", async () => {
    const rootDir = createPluginFixture();
    const legacyStreamConfigPath = path.join(
      rootDir,
      LEGACY_LOCAL_EDITOR_STREAM_CONFIG_PATH
    );
    fs.ensureDirSync(path.dirname(legacyStreamConfigPath));
    fs.writeFileSync(
      legacyStreamConfigPath,
      JSON.stringify(
        {
          templateIds: ["main"],
          defaults: {
            templateId: "main",
            locale: "en",
          },
          stream: {
            fields: ["name"],
          },
        },
        null,
        2
      )
    );

    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
        streamConfigPath: LEGACY_LOCAL_EDITOR_STREAM_CONFIG_PATH,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("main")}.tsx`
        )
      )
    ).toBe(true);
  });

  it("removes the legacy autogenerated local-editor-data.tsx when using template-specific data templates", async () => {
    const rootDir = createPluginFixture();
    writeLocalEditorStreamConfig(rootDir);
    fs.writeFileSync(
      path.join(rootDir, "src", "templates", "local-editor-data.tsx"),
      "/** THIS FILE IS AUTOGENERATED AND SHOULD NOT BE EDITED */\nexport default null;\n"
    );
    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    expect(
      fs.existsSync(
        path.join(rootDir, "src", "templates", "local-editor-data.tsx")
      )
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("main")}.tsx`
        )
      )
    ).toBe(true);
  });

  it("only generates data templates for template-aware config entries with a stream", async () => {
    const rootDir = createPluginFixture();
    writeLocalEditorStreamConfigWithDisabledTemplates(rootDir);
    process.chdir(rootDir);

    const plugin = yextVisualEditorPlugin({
      localEditor: {
        enabled: true,
      },
    });

    invokeConfigHook(plugin, { command: "serve", mode: "development" });
    await invokeBuildStartHook(plugin);

    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("dunkin")}.tsx`
        )
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("directory")}.tsx`
        )
      )
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          rootDir,
          "src",
          "templates",
          `${buildLocalEditorDataTemplateName("locator")}.tsx`
        )
      )
    ).toBe(false);
  });
});

describe("localEditor data helpers", () => {
  it("builds template-aware manifest and document payloads from local snapshots", async () => {
    const rootDir = createLocalDataFixture();

    const manifest = await getLocalEditorManifest(rootDir);
    expect(manifest.templates).toEqual(["main", "locator"]);
    expect(manifest.entitiesByTemplate.main).toEqual([
      {
        entityId: "entity-1",
        displayName: "Entity One",
        locales: ["en", "fr"],
      },
    ]);
    expect(manifest.entitiesByTemplate.locator).toEqual([
      {
        entityId: "entity-2",
        displayName: "Entity Two",
        locales: ["en"],
      },
    ]);
    expect(manifest.defaults.templateId).toBe("main");
    expect(manifest.defaults.locale).toBe("en");

    const document = await getLocalEditorDocument(
      rootDir,
      DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
      "main",
      "entity-1",
      "fr"
    );
    expect(document.document?.locale).toBe("fr");
    expect(document.entityFields.displayNames["address.line1"]).toBe(
      "Address > Line1"
    );
  });

  it("hides template-aware config entries that omit a stream", async () => {
    const rootDir = createPluginFixture();
    fs.writeFileSync(
      path.join(rootDir, ".template-manifest.json"),
      JSON.stringify(
        {
          templates: [
            {
              name: "directory",
              description: "Directory",
              exampleSiteUrl: "",
              layoutRequired: true,
            },
            {
              name: "locator",
              description: "Locator",
              exampleSiteUrl: "",
              layoutRequired: true,
            },
            {
              name: "dunkin",
              description: "Dunkin",
              exampleSiteUrl: "",
              layoutRequired: true,
            },
          ],
        },
        null,
        2
      )
    );
    writeLocalEditorStreamConfigWithDisabledTemplates(rootDir);
    fs.ensureDirSync(path.join(rootDir, "localData"));
    fs.writeFileSync(
      path.join(rootDir, "localData", "mapping.json"),
      JSON.stringify(
        {
          [buildLocalEditorDataTemplateName("dunkin")]: [
            "dunkin-stream__en__entity-1.json",
          ],
        },
        null,
        2
      )
    );
    fs.writeFileSync(
      path.join(rootDir, "localData", "dunkin-stream__en__entity-1.json"),
      JSON.stringify(
        {
          id: "entity-1",
          locale: "en",
          name: "Entity One",
        },
        null,
        2
      )
    );

    const manifest = await getLocalEditorManifest(rootDir);

    expect(manifest.templates).toEqual(["dunkin"]);
    expect(manifest.defaults.templateId).toBe("dunkin");
    expect(manifest.entitiesByTemplate).toEqual({
      dunkin: [
        {
          entityId: "entity-1",
          displayName: "Entity One",
          locales: ["en"],
        },
      ],
    });
  });

  it("handles missing stream config and stale mapping entries gracefully", async () => {
    const rootDir = createPluginFixture();
    fs.ensureDirSync(path.join(rootDir, "localData"));
    fs.writeFileSync(
      path.join(rootDir, "localData", "mapping.json"),
      JSON.stringify(
        { [buildLocalEditorDataTemplateName("directory")]: ["missing.json"] },
        null,
        2
      )
    );

    const manifest = await getLocalEditorManifest(rootDir);
    expect(manifest.diagnostics).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Missing local editor config"),
        expect.stringContaining("missing.json"),
      ])
    );
  });

  it("reloads stream.config.ts changes without restarting the dev server", async () => {
    const rootDir = createLocalDataFixture();
    const streamConfigPath = path.join(
      rootDir,
      DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
    );

    const initialManifest = await getLocalEditorManifest(rootDir);
    expect(initialManifest.templates).toEqual(["main", "locator"]);

    fs.writeFileSync(
      streamConfigPath,
      [
        "export default {",
        "  defaults: {",
        '    templateId: "locator",',
        '    locale: "en",',
        "  },",
        "  templates: {",
        '    locator: { stream: { $id: "locator-stream", fields: ["name"] } },',
        "  },",
        "};",
        "",
      ].join("\n")
    );
    const updatedTimestamp = new Date(Date.now() + 1000);
    fs.utimesSync(streamConfigPath, updatedTimestamp, updatedTimestamp);

    const updatedManifest = await getLocalEditorManifest(rootDir);
    expect(updatedManifest.templates).toEqual(["locator"]);
    expect(updatedManifest.defaults.templateId).toBe("locator");
  });

  it("infers nested field structures from snapshot data", () => {
    const fields = inferEntityFields({
      name: "Entity One",
      hours: {
        monday: {
          isClosed: false,
        },
      },
      promos: [
        {
          title: "Deal",
          enabled: true,
        },
      ],
    });

    expect(fields.fields.map((field) => field.name)).toEqual([
      "hours",
      "name",
      "promos",
    ]);
    expect(
      fields.fields.find((field) => field.name === "hours")?.children?.fields[0]
        ?.name
    ).toBe("monday");
    expect(
      fields.fields.find((field) => field.name === "promos")?.definition.isList
    ).toBe(true);
  });

  it("replaces the local editor route placeholder in generated templates", () => {
    const source = buildLocalEditorTemplateSource(
      'const route = "__LOCAL_EDITOR_ROUTE__";',
      "/custom-editor"
    );
    expect(source).toContain('const route = "custom-editor";');
  });

  it("embeds the local editor stream into the data template source", () => {
    const source = buildLocalEditorDataTemplateSource(
      [
        'import streamConfig from "__LOCAL_EDITOR_STREAM_CONFIG_IMPORT__";',
        'const localEditorTemplateId = "__LOCAL_EDITOR_TEMPLATE_ID__";',
        'const localEditorDataTemplateName = "__LOCAL_EDITOR_DATA_TEMPLATE_NAME__";',
      ].join("\n"),
      "../../stream.config.ts",
      "main"
    );

    expect(source).toContain(
      'import streamConfig from "../../stream.config.ts";'
    );
    expect(source).toContain('const localEditorTemplateId = "main";');
    expect(source).toContain(
      `const localEditorDataTemplateName = "${buildLocalEditorDataTemplateName("main")}";`
    );
  });

  it("normalizes the local editor stream for Pages test-data generation", () => {
    const stream = normalizeLocalEditorPagesStream({
      $id: "local-editor-stream",
      fields: ["locale", "name", { name: "c_field", fullObject: true }],
      filter: {
        entityTypes: ["location"],
      },
      localization: {
        locales: ["en"],
      },
    });

    expect(stream?.fields).toEqual(["name", "c_field"]);
  });
});

function createPluginFixture(): string {
  const rootDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "visual-editor-plugin-")
  );
  tempRoots.push(rootDir);

  fs.ensureDirSync(path.join(rootDir, "src", "templates"));
  fs.writeFileSync(path.join(rootDir, "src", "index.css"), "");
  fs.writeFileSync(
    path.join(rootDir, ".template-manifest.json"),
    JSON.stringify(
      {
        templates: [
          {
            name: "directory",
            description: "Directory",
            exampleSiteUrl: "",
            layoutRequired: true,
          },
          {
            name: "locator",
            description: "Locator",
            exampleSiteUrl: "",
            layoutRequired: true,
          },
        ],
      },
      null,
      2
    )
  );

  return rootDir;
}

function invokeConfigHook(plugin: Plugin, env: ConfigEnv) {
  const configHook = plugin.config;
  if (!configHook) {
    return;
  }

  if (typeof configHook === "function") {
    configHook({}, env);
    return;
  }

  configHook.handler({}, env);
}

async function invokeBuildStartHook(plugin: Plugin) {
  const buildStartHook = plugin.buildStart;
  if (!buildStartHook) {
    return;
  }

  if (typeof buildStartHook === "function") {
    await buildStartHook.call({} as never, {} as never);
    return;
  }

  await buildStartHook.handler.call({} as never, {} as never);
}

function createLocalDataFixture(): string {
  const rootDir = createPluginFixture();
  fs.writeFileSync(
    path.join(rootDir, ".template-manifest.json"),
    JSON.stringify(
      {
        templates: [
          {
            name: "main",
            description: "Main",
            exampleSiteUrl: "",
            layoutRequired: true,
          },
          {
            name: "locator",
            description: "Locator",
            exampleSiteUrl: "",
            layoutRequired: true,
          },
        ],
      },
      null,
      2
    )
  );

  writeLocalEditorStreamConfig(rootDir);

  fs.ensureDirSync(path.join(rootDir, "localData"));
  fs.writeFileSync(
    path.join(rootDir, "localData", "mapping.json"),
    JSON.stringify(
      {
        [buildLocalEditorDataTemplateName("main")]: [
          "main-stream__en__entity-1.json",
          "main-stream__fr__entity-1.json",
        ],
        [buildLocalEditorDataTemplateName("locator")]: [
          "main-stream__en__entity-2.json",
        ],
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(rootDir, "localData", "main-stream__en__entity-1.json"),
    JSON.stringify(
      {
        id: "entity-1",
        locale: "en",
        name: "Entity One",
        address: {
          line1: "1 Main St",
        },
      },
      null,
      2
    )
  );
  fs.writeFileSync(
    path.join(rootDir, "localData", "main-stream__fr__entity-1.json"),
    JSON.stringify(
      {
        id: "entity-1",
        locale: "fr",
        name: "Entity One",
        address: {
          line1: "1 Rue Principale",
        },
      },
      null,
      2
    )
  );
  fs.writeFileSync(
    path.join(rootDir, "localData", "main-stream__en__entity-2.json"),
    JSON.stringify(
      {
        id: "entity-2",
        locale: "en",
        name: "Entity Two",
      },
      null,
      2
    )
  );

  return rootDir;
}

function writeLocalEditorStreamConfig(rootDir: string) {
  fs.writeFileSync(
    path.join(rootDir, DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH),
    [
      "export default {",
      "  defaults: {",
      '    templateId: "main",',
      '    locale: "en",',
      "  },",
      "  templates: {",
      '    main: { stream: { $id: "main-stream", fields: ["name", "address.line1"] } },',
      '    locator: { stream: { $id: "locator-stream", fields: ["name"] } },',
      "  },",
      "};",
      "",
    ].join("\n")
  );
}

function writeLocalEditorStreamConfigWithDisabledTemplates(rootDir: string) {
  fs.writeFileSync(
    path.join(rootDir, DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH),
    [
      "export default {",
      "  defaults: {",
      '    templateId: "directory",',
      '    locale: "en",',
      "  },",
      "  templates: {",
      "    directory: {},",
      "    locator: {},",
      '    dunkin: { stream: { $id: "dunkin-stream", fields: ["name"] } },',
      "  },",
      "};",
      "",
    ].join("\n")
  );
}
