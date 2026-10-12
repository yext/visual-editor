import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Puck } from "@puckeditor/core";
import { chatConfig, layout, generatedContent } from "./chat/chatTestUtils.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { LocalEditorChatBridge } from "./chat/LocalEditorChatBridge.tsx";
import { LocalEditorShell } from "./LocalEditorShell.tsx";

vi.mock("../editor/Editor.tsx", () => ({
  Editor: ({
    forceThemeMode,
    document,
  }: {
    forceThemeMode: boolean;
    document: Record<string, unknown>;
  }) =>
    forceThemeMode ? (
      <p>Theme canvas</p>
    ) : (
      <Puck config={chatConfig} data={layout()} iframe={{ enabled: false }}>
        <Puck.Preview />
        <LocalEditorChatBridge />
        <span>Entity: {String(document.name)}</span>
      </Puck>
    ),
}));
vi.mock("../utils/SectionLibraryVisualEditorProvider.tsx", () => ({
  SectionLibraryVisualEditorProvider: ({
    children,
    templateProps,
  }: {
    children: React.ReactNode;
    templateProps: { document: Record<string, unknown> };
  }) => (
    <TemplatePropsContext.Provider value={templateProps}>
      {children}
    </TemplatePropsContext.Provider>
  ),
}));
vi.mock("./LocalEditorPreview.tsx", () => ({
  LocalEditorPreview: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>Close Preview</button>
  ),
}));

const manifest = {
  layouts: ["location", "other"],
  pageSetTypeByLayout: { location: "ENTITY", other: "ENTITY" },
  dataSourceByLayout: { location: "stream", other: "stream" },
  entitiesByLayout: Object.fromEntries(
    ["location", "other"].map((id) => [
      id,
      [
        { entityId: "one", displayName: "One", locales: ["en", "fr"] },
        { entityId: "two", displayName: "Two", locales: ["en", "fr"] },
      ],
    ])
  ),
  layoutDefaults: {},
  defaults: {},
  diagnostics: [],
};
let upstream: ReadableStreamDefaultController<Uint8Array>;
let generationSignal: AbortSignal | null | undefined;
const emit = (event: object) =>
  upstream.enqueue(new TextEncoder().encode(JSON.stringify(event) + "\n"));
const setup = (enabled = true) =>
  render(
    <LocalEditorShell
      apiBasePath="/local"
      routePath="/local-editor"
      componentRegistry={{ location: chatConfig, other: chatConfig }}
      tailwindConfig={{}}
      chatEnabled={enabled}
    />
  );
const submit = async () => {
  await screen.findByText("Original", { selector: "h2" });
  fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Change heading" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await waitFor(() => expect(upstream).toBeDefined());
  await act(async () =>
    emit({ type: "preview-spec", spec: generatedContent("Partial") })
  );
  await screen.findByText("Partial", { selector: "h2" });
};
beforeEach(() => {
  window.history.replaceState({}, "", "/local-editor");
  window.localStorage.clear();
  window.sessionStorage.clear();
  upstream = undefined!;
  generationSignal = undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/manifest"))
        return new Response(JSON.stringify(manifest));
      if (url.includes("/document?")) {
        const params = new URL(url, "http://localhost").searchParams;
        return new Response(
          JSON.stringify({
            document: {
              name: params.get("entityId"),
              locale: params.get("locale"),
            },
            entityFields: { fields: [], displayNames: {} },
            diagnostics: [],
          })
        );
      }
      generationSignal = init?.signal;
      return new Response(
        new ReadableStream({
          start(controller) {
            upstream = controller;
          },
        }),
        {
          headers: {
            "X-Visual-Editor-Generation": "validated-puck-content-v1",
          },
        }
      );
    })
  );
});
afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

it("keeps the normal editor available when chat is disabled", async () => {
  setup(false);
  await screen.findByText("Original", { selector: "h2" });
  expect(screen.queryByRole("button", { name: /chat/i })).toBeNull();
  expect(
    screen.getByText("Layout Editor", { selector: "button" })
  ).toBeDefined();
  expect(screen.getByRole("button", { name: "Open Preview" })).toBeDefined();
});

it("blocks editor actions during generation, then restores them on cancellation", async () => {
  setup();
  await submit();
  const frame = document.querySelector("[inert]");
  expect(frame?.textContent).toContain("Partial");
  const shortcut = new KeyboardEvent("keydown", {
    key: "z",
    ctrlKey: true,
    cancelable: true,
  });
  window.dispatchEvent(shortcut);
  expect(shortcut.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "New conversation" }));
  await screen.findByText("Original", { selector: "h2" });
  expect(document.querySelector("[inert]")).toBeNull();
  expect(generationSignal?.aborted).toBe(true);
});

it("continues when entity changes but cancels and clears chat when layout changes", async () => {
  setup();
  await submit();
  fireEvent.change(screen.getByLabelText("Entity"), {
    target: { value: "two" },
  });
  await screen.findByText("Entity: two");
  await screen.findByText("Partial", { selector: "h2" });
  expect(generationSignal?.aborted).toBe(false);
  fireEvent.change(screen.getByLabelText("Layout"), {
    target: { value: "other" },
  });
  await waitFor(() => expect(generationSignal?.aborted).toBe(true));
  await screen.findByText("Original", { selector: "h2" });
  fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
  expect(screen.queryByText("Change heading")).toBeNull();
  await act(async () => {
    emit({ type: "accepted", text: "Late", spec: generatedContent("Late") });
    upstream.close();
  });
  expect(screen.queryByText("Late", { selector: "h2" })).toBeNull();
});

it.each(["theme", "preview"])(
  "cancels active generation when opening %s",
  async (mode) => {
    setup();
    await submit();
    fireEvent.click(
      screen.getByText(mode === "theme" ? "Layout Editor" : "Open Preview", {
        selector: "button",
      })
    );
    await waitFor(() => expect(generationSignal?.aborted).toBe(true));
    expect(
      screen.queryByRole("complementary", { name: "Layout chat" })
    ).toBeNull();
    fireEvent.click(
      screen.getByText(mode === "theme" ? "Theme Editor" : "Close Preview", {
        selector: "button",
      })
    );
    await screen.findByText("Original", { selector: "h2" });
  }
);
