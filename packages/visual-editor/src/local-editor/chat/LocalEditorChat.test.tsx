import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatHarness, layout, generatedContent } from "./chatTestUtils.tsx";

const wire = (event: any) =>
  JSON.stringify(
    event.type === "accepted"
      ? {
          type: "step-completed",
          stepId: "full-page",
          scope: "full-page",
          progress: { completed: 1, total: 1 },
          ...event,
        }
      : event
  ) + "\n";
const response = (body: object | ReadableStream<Uint8Array>) =>
  new Response(
    body instanceof ReadableStream ? body : wire({ type: "accepted", ...body }),
    { headers: { "X-Visual-Editor-Generation": "validated-puck-content-v1" } }
  );
const openStream = () => {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(value) {
      controller = value;
    },
  });
  return {
    body,
    emit: (event: object) =>
      controller.enqueue(new TextEncoder().encode(wire(event))),
    close: () => controller.close(),
    fail: () => controller.error(new Error("Disconnected")),
  };
};
const openChat = () =>
  fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
const submit = async (prompt = "Add a heading") => {
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  fireEvent.change(screen.getByRole("textbox"), { target: { value: prompt } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
};
afterEach(() => vi.unstubAllGlobals());

describe("chat in the Puck editor", () => {
  it("sends with Enter while Shift+Enter and composition keep editing", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      response({ text: "Created", spec: generatedContent("Generated") })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness />);
    openChat();
    const prompt = screen.getByRole("textbox");
    fireEvent.change(prompt, { target: { value: "First line\nSecond line" } });
    expect(fireEvent.keyDown(prompt, { key: "Enter", shiftKey: true })).toBe(
      true
    );
    expect(fireEvent.keyDown(prompt, { key: "Enter", isComposing: true })).toBe(
      true
    );
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.keyDown(prompt, { key: "Enter" });
    await screen.findByText("Generated", { selector: "h2" });
    expect(
      JSON.parse(fetchMock.mock.calls[0][1]!.body as string).messages[0].content
    ).toBe("First line\nSecond line");
    expect((prompt as HTMLTextAreaElement).value).toBe("");
  });

  it("does not send empty prompts with Enter", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness />);
    openChat();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("includes manual edits, commits one undo step, and supports undo/redo", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      response({ text: "Created", spec: generatedContent("Generated") })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness />);
    openChat();
    fireEvent.click(screen.getByText("Manual edit", { selector: "button" }));
    await screen.findByText("Manual", { selector: "h2" });
    await waitFor(() =>
      expect(screen.getByLabelText("History index").textContent).toBe("1")
    );
    await submit("  Revise this  ");
    await screen.findByText("Generated", { selector: "h2" });
    await waitFor(() =>
      expect(screen.getByLabelText("History index").textContent).toBe("2")
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body.currentData).toEqual(generatedContent("Manual"));
    expect(body.messages).toEqual([{ role: "user", content: "Revise this" }]);
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await screen.findByText("Manual", { selector: "h2" });
    fireEvent.click(screen.getByText("Redo", { selector: "button" }));
    await screen.findByText("Generated", { selector: "h2" });
    expect(screen.queryByRole("button", { name: "Copy layout" })).toBeNull();
  });

  it("keeps a successful turn after an immediately preceding manual edit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        response({ text: "Created", spec: generatedContent("Generated") })
      )
    );
    render(<ChatHarness />);
    openChat();
    fireEvent.click(screen.getByText("Manual edit", { selector: "button" }));
    await submit();
    await screen.findByText("Generated", { selector: "h2" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    expect(screen.getByLabelText("History index").textContent).toBe("2");
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await screen.findByText("Manual", { selector: "h2" });
  });

  it("keeps a completed step and reports it when later generation is cancelled", async () => {
    const stream = openStream();
    const fetchMock = vi.fn(async () => response(stream.body));
    vi.stubGlobal("fetch", fetchMock);
    let chat:
      | ReturnType<typeof import("./useLocalEditorChat.ts").useLocalEditorChat>
      | undefined;
    render(
      <ChatHarness
        onChat={(value) => {
          chat = value;
        }}
      />
    );
    openChat();
    await submit("Change the heading");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    stream.emit({
      type: "step-completed",
      stepId: "operation-1",
      scope: "component:heading",
      progress: { completed: 1, total: 2 },
      text: "Updated the heading",
      spec: generatedContent("Step one"),
    });
    await screen.findByText("Step one", { selector: "h2" });
    act(() => chat?.cancel());
    stream.fail();
    expect(
      await screen.findByText(/1 step applied\. Remaining work was cancelled\./)
    ).toBeTruthy();
    expect(screen.getByText("Step one", { selector: "h2" })).toBeTruthy();
  });

  it("keeps the canvas unchanged during streaming and repair and survives hide/show", async () => {
    const stream = openStream();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, _init?: RequestInit) => response(stream.body))
    );
    render(<ChatHarness />);
    openChat();
    await submit();
    await act(async () =>
      stream.emit({ type: "preview-text", delta: "Working…" })
    );
    expect(screen.queryByText("Partial", { selector: "h2" })).toBeNull();
    expect(screen.getByLabelText("History index").textContent).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Hide chat" }));
    expect(screen.queryByRole("textbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Show chat/ }));
    await act(async () => stream.emit({ type: "reset" }));
    await screen.findByText("Original", { selector: "h2" });
    await act(async () => {
      stream.emit({
        type: "accepted",
        text: "Done",
        spec: generatedContent("Final"),
      });
      stream.close();
    });
    await screen.findByText("Final", { selector: "h2" });
    expect(screen.getByLabelText("History index").textContent).toBe("1");
  });

  it.each(["error", "disconnect", "prose"])(
    "restores the baseline after %s",
    async (kind) => {
      const stream = openStream();
      vi.stubGlobal(
        "fetch",
        vi.fn(async (_url: string, _init?: RequestInit) =>
          response(stream.body)
        )
      );
      render(<ChatHarness />);
      openChat();
      await submit();
      await act(async () =>
        stream.emit({ type: "preview-text", delta: "Working…" })
      );
      expect(screen.queryByText("Partial", { selector: "h2" })).toBeNull();
      await act(async () => {
        if (kind === "disconnect") {
          stream.emit({
            type: "accepted",
            text: "Done",
            spec: generatedContent("Final"),
          });
          stream.fail();
        } else {
          stream.emit(
            kind === "error"
              ? { type: "error", error: "Invalid layout" }
              : { type: "accepted", text: "Advice", spec: null }
          );
          stream.close();
        }
      });
      await screen.findByText("Original", { selector: "h2" });
      expect(screen.getByLabelText("History index").textContent).toBe("0");
      if (kind !== "prose")
        expect(await screen.findByRole("alert")).toBeDefined();
    }
  );

  it.each([
    "HTTP error",
    "old protocol",
    "missing acceptance",
    "invalid accepted data",
  ])("leaves the editor unchanged after %s", async (mode) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        mode === "HTTP error"
          ? new Response(JSON.stringify({ error: "Gateway unavailable" }), {
              status: 503,
            })
          : new Response(
              wire(
                mode === "invalid accepted data"
                  ? {
                      type: "accepted",
                      text: "Invalid",
                      spec: { content: "invalid" },
                    }
                  : { type: "preview-text", delta: "Unvalidated" }
              ),
              {
                headers: {
                  "X-Visual-Editor-Generation":
                    mode === "old protocol"
                      ? "validated-v1"
                      : "validated-puck-content-v1",
                },
              }
            )
      )
    );
    render(<ChatHarness />);
    openChat();
    await submit();
    await screen.findByRole("alert");
    expect(screen.queryByText("Unvalidated")).toBeNull();
    expect(screen.getByLabelText("History index").textContent).toBe("0");
    expect(screen.getByText("Original", { selector: "h2" })).toBeDefined();
  });

  it("keeps active generation across locale remounts and undoes to the new locale baseline", async () => {
    const stream = openStream();
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      response(stream.body)
    );
    vi.stubGlobal("fetch", fetchMock);
    const view = render(<ChatHarness />);
    openChat();
    await submit();
    await act(async () =>
      stream.emit({ type: "preview-text", delta: "Working…" })
    );
    expect(screen.queryByText("Partial", { selector: "h2" })).toBeNull();
    view.rerender(<ChatHarness locale="fr" initialData={layout("French")} />);
    expect(screen.queryByText("Partial", { selector: "h2" })).toBeNull();
    await act(async () => {
      stream.emit({
        type: "accepted",
        text: "Done",
        spec: generatedContent("Final"),
      });
      stream.close();
    });
    await screen.findByText("Final", { selector: "h2" });
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await screen.findByText("French", { selector: "h2" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("new conversation aborts the turn, resets usage, and ignores late acceptance", async () => {
    const stream = openStream();
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      response(stream.body)
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness />);
    openChat();
    await submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {
      stream.emit({
        type: "usage",
        usage: { cachedInput: 3, uncachedInput: 4, output: 5 },
      });
      stream.emit({ type: "preview-text", delta: "Working…" });
    });
    expect(screen.queryByText("Partial", { selector: "h2" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "New conversation" }));
    await screen.findByText("Original", { selector: "h2" });
    expect(fetchMock.mock.calls[0][1]!.signal!.aborted).toBe(true);
    await act(async () => {
      stream.emit({
        type: "accepted",
        text: "Late",
        spec: generatedContent("Late"),
      });
      stream.close();
    });
    expect(screen.queryByText("Late", { selector: "h2" })).toBeNull();
    expect(
      screen.getByLabelText("Conversation token usage").textContent
    ).toContain("Cached input: 0");
  });

  it("decodes accepted responses split across UTF-8 bytes and sends structured follow-up history", async () => {
    const encoded = new TextEncoder().encode(
      wire({ type: "accepted", text: "Café", spec: generatedContent("Café") })
    );
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      response(
        new ReadableStream({
          start(controller) {
            for (const byte of encoded)
              controller.enqueue(new Uint8Array([byte]));
            controller.close();
          },
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness />);
    openChat();
    await submit();
    await screen.findByText("Café", { selector: "h2" });
    await submit("Revise");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const body = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(JSON.parse(body.messages[1].content)).toEqual({
      text: "Café",
      spec: generatedContent("Café"),
    });
  });
});
