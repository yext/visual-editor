import { openChat } from "./chat/chatTestUtils.tsx";
import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Puck, blocksPlugin, outlinePlugin } from "@puckeditor/core";
import { LocalEditorChatUiContext } from "./chat/LocalEditorChatUiContext.tsx";
import { localEditorChatPlugin } from "./chat/localEditorChatPlugin.tsx";
import { useDocument } from "../hooks/useDocument.tsx";
import { chatConfig, layout, generatedContent } from "./chat/chatTestUtils.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { LocalEditorChatBridge } from "./chat/LocalEditorChatBridge.tsx";
import { LocalEditorShell } from "./LocalEditorShell.tsx";

vi.mock("../editor/Editor.tsx", () => {
  const ShellPuckOverride = ({ children }: { children: React.ReactNode }) => {
    const document = useDocument();
    return (
      <>
        <LocalEditorChatBridge streamDocument={document} />
        <span>Entity: {String(document.name)}</span>
        {children}
      </>
    );
  };
  const sections = { ...blocksPlugin(), label: "Sections" };
  const outline = outlinePlugin();
  return {
    Editor: ({ forceThemeMode }: { forceThemeMode: boolean }) => {
      const chatUi = React.useContext(LocalEditorChatUiContext);
      return forceThemeMode ? (
        <p>Theme canvas</p>
      ) : (
        <Puck
          config={chatConfig}
          data={layout()}
          iframe={{ enabled: false }}
          plugins={[
            sections,
            outline,
            ...(chatUi ? [localEditorChatPlugin] : []),
          ]}
          overrides={{ puck: ShellPuckOverride }}
        />
      );
    },
  };
});
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
  openChat();
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: "Describe what you want" }),
    {
      target: { value: "Change heading" },
    }
  );
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await waitFor(() => expect(upstream).toBeDefined());
  await screen.findByText("Planning changes…");
  expect(screen.getByText("Original", { selector: "h2" })).toBeTruthy();
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
      if (url.endsWith("/generate/error"))
        return new Response(JSON.stringify({ recorded: true }));
      generationSignal = init?.signal;
      return new Response(
        new ReadableStream({
          start(controller) {
            upstream = controller;
          },
        }),
        {
          headers: {
            "X-Visual-Editor-Generation": "section-edits-v1",
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
  expect(screen.queryByText("Layout assistant")).toBeNull();
  expect(
    screen.getByText("Layout Editor", { selector: "button" })
  ).toBeDefined();
  expect(screen.getByRole("button", { name: "Open Preview" })).toBeDefined();
});

it("blocks editor actions during generation, then restores them on cancellation", async () => {
  setup();
  await submit();
  const frame = document.querySelector("[data-chat-busy]");
  expect(frame?.textContent).toContain("Original");
  const shortcut = new KeyboardEvent("keydown", {
    key: "z",
    ctrlKey: true,
    cancelable: true,
  });
  window.dispatchEvent(shortcut);
  expect(shortcut.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
  await screen.findByText("Original", { selector: "h2" });
  expect(document.querySelector("[inert]")).toBeNull();
  expect(generationSignal?.aborted).toBe(true);
});

it("cancels when entity changes and clears chat when layout changes", async () => {
  setup();
  await submit();
  fireEvent.change(screen.getByLabelText("Entity"), {
    target: { value: "two" },
  });
  await screen.findByText("Entity: two");
  await waitFor(() => expect(generationSignal?.aborted).toBe(true));
  expect(screen.getByText("Original", { selector: "h2" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Layout"), {
    target: { value: "other" },
  });
  await waitFor(() => expect(generationSignal?.aborted).toBe(true));
  await screen.findByText("Original", { selector: "h2" });
  openChat();
  expect(screen.queryByText("Change heading")).toBeNull();
  expect(() =>
    emit({ type: "accepted", text: "Late", spec: generatedContent("Late") })
  ).toThrow();
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
    expect(document.querySelector("[data-local-editor-chat-rail]")).toBeNull();
    fireEvent.click(
      screen.getByText(mode === "theme" ? "Theme Editor" : "Close Preview", {
        selector: "button",
      })
    );
    await screen.findByText("Original", { selector: "h2" });
  }
);

vi.mock("./chat/chatDiagnostics.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./chat/chatDiagnostics.ts")>()),
  reportChatDiagnostic: vi.fn(),
}));

it("allows plugin navigation and cancellation while generation keeps the canvas locked", async () => {
  setup();
  await submit();
  const requestCount = () =>
    vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => String(url).endsWith("/generate")).length;
  const beforeSwitch = requestCount();
  const prompt = screen.getByRole("textbox", {
    name: "Describe what you want",
  });
  expect((prompt as HTMLTextAreaElement).disabled).toBe(false);
  expect(
    (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled
  ).toBe(true);
  expect(
    screen.getByRole("button", { name: "Stop generating" }).closest("form")
  ).toBe(prompt.closest("form"));
  fireEvent.input(prompt, { target: { value: "Refine the footer next" } });
  fireEvent.keyDown(prompt, { key: "Enter" });
  fireEvent.submit(prompt.closest("form")!);
  expect((prompt as HTMLTextAreaElement).value).toBe("Refine the footer next");
  expect(requestCount()).toBe(beforeSwitch);
  fireEvent.click(within(screen.getByRole("navigation")).getByText("Outline"));
  expect(screen.queryByRole("button", { name: "Stop generating" })).toBeNull();
  expect(generationSignal?.aborted).toBe(false);
  openChat();
  expect(screen.getByRole("textbox", { name: "Describe what you want" })).toBe(
    prompt
  );
  expect((prompt as HTMLTextAreaElement).value).toBe("Refine the footer next");
  expect(screen.getByText("Planning changes…")).toBeTruthy();
  expect(requestCount()).toBe(beforeSwitch);
  const input = screen.getByText("Original", { selector: "h2" });
  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  input.dispatchEvent(click);
  expect(click.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
  await waitFor(() => expect(generationSignal?.aborted).toBe(true));
  expect(
    (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled
  ).toBe(false);
  expect((prompt as HTMLTextAreaElement).value).toBe("Refine the footer next");
  expect(requestCount()).toBe(beforeSwitch);
  const restored = new MouseEvent("click", { bubbles: true, cancelable: true });
  input.dispatchEvent(restored);
  expect(restored.defaultPrevented).toBe(false);
});
