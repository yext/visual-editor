import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalEditorShell } from "./LocalEditorShell.tsx";

let editorMountCount = 0;

vi.mock("../editor/Editor.tsx", () => {
  return {
    Editor: ({
      localDevOptions,
    }: {
      localDevOptions?: Record<string, unknown>;
    }) => {
      React.useEffect(() => {
        editorMountCount += 1;
      }, []);

      return (
        <div data-testid="editor">{JSON.stringify(localDevOptions ?? {})}</div>
      );
    },
  };
});

vi.mock("../utils/VisualEditorProvider.tsx", () => {
  return {
    VisualEditorProvider: ({ children }: React.PropsWithChildren) => {
      return <div data-testid="provider">{children}</div>;
    },
  };
});

describe("LocalEditorShell", () => {
  beforeEach(() => {
    editorMountCount = 0;
    window.history.replaceState({}, "", "/local-editor");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes from query params and renders the selected template, entity, and locale", async () => {
    window.history.replaceState(
      {},
      "",
      "/local-editor?templateId=locator&entityId=entity-2&locale=fr"
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/manifest")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                templates: ["main", "locator"],
                entitiesByTemplate: {
                  main: [
                    {
                      entityId: "entity-1",
                      displayName: "Entity One",
                      locales: ["en"],
                    },
                  ],
                  locator: [
                    {
                      entityId: "entity-2",
                      displayName: "Entity Two",
                      locales: ["en", "fr"],
                    },
                  ],
                },
                templateDefaults: {
                  main: {
                    locale: "en",
                    defaultLayoutData: { content: ["main"] },
                  },
                  locator: {
                    locale: "fr",
                    defaultLayoutData: { content: ["locator"] },
                  },
                },
                defaults: {
                  templateId: "main",
                  locale: "en",
                },
                diagnostics: [],
                streamConfigPath: "stream.config.ts",
                localDataPath: "localData",
              }),
              { status: 200 }
            )
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              document: {
                id: "entity-2",
                locale: "fr",
                name: "Entity Two",
              },
              entityFields: {
                fields: [],
                displayNames: {},
              },
              diagnostics: [],
            }),
            { status: 200 }
          )
        );
      })
    );

    render(
      <LocalEditorShell
        apiBasePath="/api/local-editor"
        routePath="local-editor"
        componentRegistry={{ main: {} as never, locator: {} as never }}
        tailwindConfig={{}}
      />
    );

    const editor = await screen.findByTestId("editor");
    expect(editor.textContent).toContain('"templateId":"locator"');
    expect(editor.textContent).toContain('"entityId":"entity-2"');
    expect(editor.textContent).toContain('"locale":"fr"');
    expect(editor.textContent).toContain('"layoutScopeKey":"locator:fr"');
    expect(editor.textContent).toContain(
      '"initialLayoutData":{"content":["locator"]}'
    );
  });

  it("filters entities by template and updates query params when controls change", async () => {
    const fetchSpy = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/manifest")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              templates: ["main", "locator"],
              entitiesByTemplate: {
                main: [
                  {
                    entityId: "entity-1",
                    displayName: "Entity One",
                    locales: ["en", "fr"],
                  },
                ],
                locator: [
                  {
                    entityId: "entity-2",
                    displayName: "Entity Two",
                    locales: ["en"],
                  },
                ],
              },
              templateDefaults: {
                main: {
                  locale: "en",
                  defaultLayoutData: { content: ["main"] },
                },
                locator: {
                  locale: "en",
                  defaultLayoutData: { content: ["locator"] },
                },
              },
              defaults: {
                templateId: "main",
                locale: "en",
              },
              diagnostics: [],
              streamConfigPath: "stream.config.ts",
              localDataPath: "localData",
            }),
            { status: 200 }
          )
        );
      }

      const requestUrl = new URL(url, "http://localhost");
      return Promise.resolve(
        new Response(
          JSON.stringify({
            document: {
              id: requestUrl.searchParams.get("entityId"),
              locale: requestUrl.searchParams.get("locale"),
              name: "Entity",
            },
            entityFields: {
              fields: [],
              displayNames: {},
            },
            diagnostics: [],
          }),
          { status: 200 }
        )
      );
    });
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <LocalEditorShell
        apiBasePath="/api/local-editor"
        routePath="local-editor"
        componentRegistry={{ main: {} as never, locator: {} as never }}
        tailwindConfig={{}}
      />
    );

    await screen.findByTestId("editor");
    expect(screen.getByLabelText("Entity").textContent).toContain("Entity One");
    expect(screen.getByLabelText("Entity").textContent).not.toContain(
      "Entity Two"
    );

    fireEvent.change(screen.getByLabelText("Template"), {
      target: { value: "locator" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Entity").textContent).toContain(
        "Entity Two"
      );
      expect(window.location.search).toContain("templateId=locator");
      expect(window.location.search).toContain("entityId=entity-2");
      expect(window.location.search).toContain("locale=en");
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("templateId=locator")
    );
  });

  it("keeps the same editor instance when switching entities in the same template and locale", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/manifest")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                templates: ["main"],
                entitiesByTemplate: {
                  main: [
                    {
                      entityId: "entity-1",
                      displayName: "Entity One",
                      locales: ["en"],
                    },
                    {
                      entityId: "entity-2",
                      displayName: "Entity Two",
                      locales: ["en"],
                    },
                  ],
                },
                templateDefaults: {
                  main: {
                    locale: "en",
                    defaultLayoutData: { content: ["main"] },
                  },
                },
                defaults: {
                  templateId: "main",
                  locale: "en",
                },
                diagnostics: [],
                streamConfigPath: "stream.config.ts",
                localDataPath: "localData",
              }),
              { status: 200 }
            )
          );
        }

        const requestUrl = new URL(url, "http://localhost");
        return Promise.resolve(
          new Response(
            JSON.stringify({
              document: {
                id: requestUrl.searchParams.get("entityId"),
                locale: "en",
                name: "Entity",
              },
              entityFields: {
                fields: [],
                displayNames: {},
              },
              diagnostics: [],
            }),
            { status: 200 }
          )
        );
      })
    );

    render(
      <LocalEditorShell
        apiBasePath="/api/local-editor"
        routePath="local-editor"
        componentRegistry={{ main: {} as never }}
        tailwindConfig={{}}
      />
    );

    await screen.findByTestId("editor");
    expect(editorMountCount).toBe(1);

    fireEvent.change(screen.getByLabelText("Entity"), {
      target: { value: "entity-2" },
    });

    await waitFor(() => {
      expect(window.location.search).toContain("entityId=entity-2");
    });

    expect(editorMountCount).toBe(1);
  });

  it("renders setup guidance when snapshots are missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/manifest")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                templates: ["main"],
                entitiesByTemplate: {
                  main: [],
                },
                templateDefaults: {
                  main: {},
                },
                defaults: {},
                diagnostics: [
                  "Missing local editor config at stream.config.ts",
                ],
                streamConfigPath: "stream.config.ts",
                localDataPath: "localData",
              }),
              { status: 200 }
            )
          );
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({
              document: null,
              entityFields: {
                fields: [],
                displayNames: {},
              },
              diagnostics: [],
            }),
            { status: 200 }
          )
        );
      })
    );

    render(
      <LocalEditorShell
        apiBasePath="/api/local-editor"
        routePath="local-editor"
        componentRegistry={{ main: {} as never }}
        tailwindConfig={{}}
      />
    );

    expect(await screen.findByText("Setup Required")).toBeTruthy();
    expect(screen.getAllByText(/stream\.config\.ts/).length).toBe(2);
  });
});
