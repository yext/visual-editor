import React from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { TemplateMetadata } from "../../types/templateMetadata.ts";
import { LayoutGenerationProvider } from "./LayoutGenerationProvider.tsx";
import { LayoutGenerationChatUiContext } from "./LayoutGenerationChatUiContext.tsx";
import { LayoutGenerationChatContext } from "./LayoutGenerationChatContext.tsx";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";

let ui: React.ContextType<typeof LayoutGenerationChatUiContext>;
const config = { components: {} };
const metadata = (overrides: Partial<TemplateMetadata> = {}) =>
  ({
    siteId: 1,
    templateId: "template",
    layoutId: 2,
    locales: ["en", "fr"],
    isThemeMode: false,
    aiPageGeneration: {
      layoutGenerationEnabled: true,
      model: "configured-model",
    },
    ...overrides,
  }) as TemplateMetadata;
const Probe = () => {
  ui = React.useContext(LayoutGenerationChatUiContext);
  const canvas = React.useContext(LayoutGenerationChatContext);
  React.useEffect(
    () =>
      canvas?.attach({
        read: () => ({ root: {}, content: [] }),
        resolve: async (data) => data,
        validate: () => {},
        commit: () => {},
      }),
    [canvas]
  );
  return <span>Editor content</span>;
};
const view = (value: TemplateMetadata) => (
  <LayoutGenerationProvider config={config} metadata={value}>
    <Probe />
  </LayoutGenerationProvider>
);
const post = () =>
  vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
const reply = (requestId: string, payload: object) =>
  window.dispatchEvent(
    new MessageEvent("message", {
      source: window.parent,
      origin: "https://dev.yext.com",
      data: {
        type: "aiPageGenerationResponse",
        payload: { requestId, ...payload },
      },
    })
  );
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  metadata({ aiPageGeneration: undefined }),
  metadata({
    aiPageGeneration: { layoutGenerationEnabled: false, model: "test" },
  }),
  metadata({ isThemeMode: true }),
])("keeps the feature inactive when disabled or in theme mode", (value) => {
  const send = post();
  const { getByText } = render(view(value));
  expect(getByText("Editor content")).toBeTruthy();
  expect(ui).toBeNull();
  expect(send).not.toHaveBeenCalled();
});

it("preserves the local shell's generation context", () => {
  const send = post();
  const canvas = new LayoutGenerationChatCanvas();
  render(
    <LayoutGenerationChatContext.Provider value={canvas}>
      <LayoutGenerationProvider config={config} metadata={metadata()} localDev>
        <Probe />
      </LayoutGenerationProvider>
    </LayoutGenerationChatContext.Provider>
  );
  expect(canvas.ready).toBe(true);
  expect(send).not.toHaveBeenCalled();
});

it("reports a missing model without sending a request", async () => {
  const send = post();
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    view(
      metadata({
        aiPageGeneration: { layoutGenerationEnabled: true, model: "" },
      })
    )
  );
  await waitFor(() => expect(ui?.chat.ready).toBe(true));
  await act(async () => {
    await ui!.chat.send("Create page");
  });
  expect(ui!.chat.error?.message).toContain("configured model");
  expect(send).not.toHaveBeenCalled();
});

it("uses metadata model/locales, preserves conversation across previews, and resets on layout changes", async () => {
  const send = post();
  vi.spyOn(console, "debug").mockImplementation(() => {});
  const { rerender, unmount } = render(view(metadata()));
  await waitFor(() => expect(ui?.chat.ready).toBe(true));
  let pending!: Promise<void>;
  act(() => {
    pending = ui!.chat.send("Create page");
  });
  await waitFor(() => expect(send).toHaveBeenCalled());
  const request = send.mock.calls
    .map(([message]) => message)
    .find((message) => message.type === "aiPageGenerationRequest");
  expect(request.payload.body.model).toBe("configured-model");
  expect(
    JSON.parse(request.payload.body.input.at(-1).content).context.locales
  ).toEqual(["en", "fr"]);
  const id = request.payload.requestId;
  await act(async () => {
    reply(id, { event: "start", contentType: "application/json" });
    reply(id, {
      event: "chunk",
      chunk: new TextEncoder().encode(
        JSON.stringify({
          status: "completed",
          output_text: JSON.stringify({
            question: "Translate?",
            translationMode: null,
            cardCounts: [],
          }),
        })
      ),
    });
    reply(id, { event: "end" });
    await pending;
  });
  expect(ui!.chat.messages.at(-1)?.text).toBe("Translate?");
  rerender(view(metadata({ entityId: 3, platformLocale: "fr" })));
  expect(ui!.chat.messages.at(-1)?.text).toBe("Translate?");
  rerender(view(metadata({ layoutId: 9 })));
  await waitFor(() => expect(ui!.chat.messages).toHaveLength(0));
  act(() => {
    pending = ui!.chat.send("Another page");
  });
  await waitFor(() =>
    expect(
      send.mock.calls.some(
        ([message]) =>
          message.type === "aiPageGenerationRequest" &&
          message.payload.requestId !== id
      )
    ).toBe(true)
  );
  unmount();
  await pending;
  expect(
    send.mock.calls.some(
      ([message]) => message.type === "aiPageGenerationCancel"
    )
  ).toBe(true);
});

it("cancels work and clears history when the configured model changes", async () => {
  const send = post();
  vi.spyOn(console, "debug").mockImplementation(() => {});
  const { rerender, getByText } = render(view(metadata()));
  const editorNode = getByText("Editor content");
  await waitFor(() => expect(ui?.chat.ready).toBe(true));
  let pending!: Promise<void>;
  act(() => {
    pending = ui!.chat.send("Create page");
  });
  await waitFor(() => expect(send).toHaveBeenCalled());
  rerender(
    view(
      metadata({
        aiPageGeneration: {
          layoutGenerationEnabled: true,
          model: "different-model",
        },
      })
    )
  );
  await pending;
  expect(ui!.chat.messages).toHaveLength(0);
  expect(getByText("Editor content")).toBe(editorNode);
  expect(
    send.mock.calls.some(
      ([message]) => message.type === "aiPageGenerationCancel"
    )
  ).toBe(true);
});
