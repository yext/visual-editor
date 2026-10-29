import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import type { TemplateMetadata } from "../../types/templateMetadata.ts";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { LayoutGenerationProvider } from "./LayoutGenerationProvider.tsx";
import { LayoutGenerationChat } from "./LayoutGenerationChat.tsx";
import {
  LayoutGenerationChatContext,
  LayoutGenerationChatUiContext,
} from "./contexts.tsx";

let ui: React.ContextType<typeof LayoutGenerationChatUiContext>;
const config = { components: {} };
const metadata = (overrides: Partial<TemplateMetadata> = {}) =>
  ({
    siteId: 1,
    templateId: "template",
    layoutId: "2",
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
        preview: () => {},
        materializeRegeneration: (data) => data,
        preserveSectionResolution: (_resolved, candidate) => candidate,
        commit: () => {},
      }),
    [canvas]
  );
  return <span>Editor content</span>;
};
const ChatPanel = () => {
  const context = React.useContext(LayoutGenerationChatUiContext);
  return context ? <LayoutGenerationChat {...context} active /> : null;
};

it("shows interrupted generation recovery and disables restart until persistence acknowledges it", async () => {
  const send = post();
  const value = metadata({
    assignment: "ALL",
    aiPageGeneration: {
      layoutGenerationEnabled: true,
      model: "model",
      intentPageGeneration: {
        prompt: "Retained prompt",
        status: "RUNNING",
        attemptId: "old",
      },
    },
  });
  const panel = () => (
    <LayoutGenerationProvider config={config} metadata={{ ...value }}>
      <Probe />
      <ChatPanel />
    </LayoutGenerationProvider>
  );
  const result = render(panel());
  await waitFor(() => expect(ui?.chat.ready).toBe(true));
  expect(result.getByRole("status").textContent).toBe(
    "Generation may have been interrupted. You can restart it here."
  );
  const description = result.getByText(
    "Restarting will replace the previous attempt."
  );
  const restart = result.getByRole("button", {
    name: "Restart generation",
  }) as HTMLButtonElement;
  expect(restart.getAttribute("aria-describedby")).toBe(description.id);
  expect(restart.disabled).toBe(false);
  expect(send).not.toHaveBeenCalled();
  fireEvent.click(restart);
  fireEvent.click(restart);
  result.rerender(panel());
  expect(restart.disabled).toBe(true);
  // The transport may post to more than one allowed origin.
  const requests = () => [
    ...new Map(
      send.mock.calls.map(([message]) => [message.payload.attemptId, message])
    ).values(),
  ];
  expect(requests()).toHaveLength(1);
  const start = requests()[0];
  expect(start).toMatchObject({
    type: "updateIntentPageGeneration",
    payload: { layoutId: "2", action: "start", explicitRetry: true },
  });
  expect(start.payload.attemptId).not.toBe("old");
  act(() =>
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: "https://dev.yext.com",
        data: {
          type: "updateIntentPageGeneration",
          status: "error",
          payload: {
            attemptId: start.payload.attemptId,
            message: "Persistence failed",
          },
        },
      })
    )
  );
  await waitFor(() =>
    expect(result.getByRole("alert").textContent).toContain(
      "Unable to restart generation"
    )
  );
  expect(restart.disabled).toBe(false);
  expect(
    send.mock.calls.every(
      ([message]) => message.type === "updateIntentPageGeneration"
    )
  ).toBe(true);
  result.rerender(panel());
  fireEvent.click(restart);
  expect(requests()).toHaveLength(2);
  expect(requests()[1].payload.attemptId).not.toBe(start.payload.attemptId);
});
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

it("reports an already failed intent without a retry button or blocked composer", async () => {
  const send = post();
  const value = metadata({
    assignment: "ALL",
    aiPageGeneration: {
      layoutGenerationEnabled: true,
      model: "model",
      intentPageGeneration: {
        prompt: "Chicken menu",
        status: "FAILED",
        attemptId: "previous-attempt",
      },
    },
  });
  const result = render(
    <LayoutGenerationProvider config={config} metadata={value}>
      <Probe />
      <ChatPanel />
    </LayoutGenerationProvider>
  );
  const chat = result.getByRole("log", { name: "Generation conversation" });
  expect(within(chat).getByRole("status").textContent).toBe(
    "Page generation failed."
  );
  expect(within(chat).queryByRole("button", { name: /retry/i })).toBeNull();
  await waitFor(() => expect(ui?.chat.ready).toBe(true));
  expect(ui!.disabled).toBe(false);
  expect(send).not.toHaveBeenCalled();
});

it("releases the chat after a refused intent start without offering generation retry", async () => {
  const send = post();
  const value = metadata({
    assignment: "ALL",
    aiPageGeneration: {
      layoutGenerationEnabled: true,
      model: "model",
      intentPageGeneration: { prompt: "Chicken menu", status: "PENDING" },
    },
  });
  const result = render(
    <LayoutGenerationProvider config={config} metadata={value}>
      <Probe />
      <ChatPanel />
    </LayoutGenerationProvider>
  );
  await waitFor(() => expect(send).toHaveBeenCalled());
  const start = send.mock.calls[0][0];
  act(() =>
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: "https://dev.yext.com",
        data: {
          type: "updateIntentPageGeneration",
          status: "error",
          payload: {
            attemptId: start.payload.attemptId,
            message: "Start failed",
          },
        },
      })
    )
  );
  const chat = result.getByRole("log", { name: "Generation conversation" });
  await waitFor(() =>
    expect(within(chat).getByRole("status").textContent).toBe(
      "Page generation failed."
    )
  );
  expect(within(chat).queryByRole("button", { name: /retry/i })).toBeNull();
  expect(ui!.disabled).toBe(false);
});

it("leaves the conversation empty when an intent is already completed", async () => {
  const send = post();
  const value = metadata({
    assignment: "ALL",
    aiPageGeneration: {
      layoutGenerationEnabled: true,
      model: "configured-model",
      intentPageGeneration: {
        prompt: "Chicken menu",
        status: "COMPLETED",
        attemptId: "completed-attempt",
      },
    },
  });
  const result = render(
    <LayoutGenerationProvider config={config} metadata={value}>
      <Probe />
      <ChatPanel />
    </LayoutGenerationProvider>
  );
  const chat = result.getByRole("log", { name: "Generation conversation" });
  await waitFor(() => expect(ui?.chat.ready).toBe(true));
  expect(chat.textContent).toBe("");
  expect(send).not.toHaveBeenCalled();
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

it.each([
  { identity: "layout", overrides: { layoutId: "9" } },
  { identity: "site", overrides: { siteId: 3 } },
  { identity: "template", overrides: { templateId: "other-template" } },
])(
  "uses the layout Id for requests and diagnostics and resets chat when the $identity changes",
  async ({ overrides }) => {
    const send = post();
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
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
    expect(debug).toHaveBeenCalledWith(
      "[layout generation] Request payload measured",
      expect.objectContaining({ layoutId: "2" })
    );
    expect(debug).toHaveBeenCalledWith(
      "[layout generation] Diagnostics",
      expect.objectContaining({ layoutId: "2" })
    );
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
    const nextMetadata = metadata(overrides);
    rerender(view(nextMetadata));
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
    expect(debug).toHaveBeenCalledWith(
      "[layout generation] Request payload measured",
      expect.objectContaining({ layoutId: String(nextMetadata.layoutId) })
    );
    unmount();
    await pending;
    expect(
      send.mock.calls.some(
        ([message]) => message.type === "aiPageGenerationCancel"
      )
    ).toBe(true);
  }
);

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

it("waits for durable start acknowledgement before invoking intent generation", async () => {
  const send = post();
  vi.spyOn(console, "debug").mockImplementation(() => {});
  const value = metadata({
    assignment: "ALL",
    aiPageGeneration: {
      layoutGenerationEnabled: true,
      model: "intent-model",
      intentPageGeneration: { prompt: "Product page", status: "PENDING" },
    },
  });
  const { rerender } = render(
    <React.StrictMode>{view(value)}</React.StrictMode>
  );
  await waitFor(() => expect(send).toHaveBeenCalled());
  const start = send.mock.calls
    .map(([message]) => message)
    .find((message) => message.type === "updateIntentPageGeneration");
  expect(start.payload.action).toBe("start");
  expect(
    send.mock.calls.some(
      ([message]) => message.type === "aiPageGenerationRequest"
    )
  ).toBe(false);
  act(() =>
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: "https://dev.yext.com",
        data: {
          type: "updateIntentPageGeneration",
          status: "success",
          payload: {
            attemptId: start.payload.attemptId,
            generation: {
              attemptId: start.payload.attemptId,
              status: "RUNNING",
              prompt: "Product page",
            },
          },
        },
      })
    )
  );
  await waitFor(() =>
    expect(
      send.mock.calls.some(
        ([message]) => message.type === "aiPageGenerationRequest"
      )
    ).toBe(true)
  );
  const requests = () => [
    ...new Set(
      send.mock.calls
        .map(([message]) => message)
        .filter((message) => message.type === "aiPageGenerationRequest")
        .map((message) => message.payload.requestId)
    ),
  ];
  rerender(
    <React.StrictMode>{view({ ...value, entityId: 7 })}</React.StrictMode>
  );
  expect(requests()).toHaveLength(1);
  const request = send.mock.calls
    .map(([message]) => message)
    .find((message) => message.type === "aiPageGenerationRequest");
  expect(request.payload.body.model).toBe("intent-model");
  expect(request.payload.body.text.format.name).toBe(
    "puck_generation_preparation"
  );
});

it.each([false, true])(
  "does not auto-start disabled or theme-mode intent regeneration (%s)",
  async (themeMode) => {
    const send = post();
    render(
      view(
        metadata({
          isThemeMode: themeMode,
          aiPageGeneration: {
            model: "test",
            layoutGenerationEnabled: themeMode,
            intentPageGeneration: { prompt: "Product page", status: "PENDING" },
          },
        })
      )
    );
    await act(async () => {});
    expect(send).not.toHaveBeenCalled();
  }
);
