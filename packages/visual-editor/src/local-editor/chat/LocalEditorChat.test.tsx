import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";
import { ChatHarness, generatedContent } from "./chatTestUtils.tsx";

const wire = (event: any) => JSON.stringify(event) + "\n";
const headers = { "X-Visual-Editor-Generation": "strict-puck-overrides-v2" };
const submit = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Change the heading" },
  });
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
};
afterEach(() => vi.unstubAllGlobals());

describe("strict generation in the editor", () => {
  it("includes manual edits and creates one undoable transaction", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(
          wire({
            type: "accepted",
            text: "Updated",
            spec: generatedContent("Generated"),
          }),
          { headers }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness />);
    fireEvent.click(screen.getByText("Manual edit", { selector: "button" }));
    await screen.findByText("Manual", { selector: "h2" });
    await waitFor(() =>
      expect(screen.getByLabelText("History index").textContent).toBe("1")
    );
    await submit();
    await screen.findByText("Generated", { selector: "h2" });
    expect(
      JSON.parse(fetchMock.mock.calls[0][1]!.body as string).currentData
    ).toEqual(generatedContent("Manual"));
    expect(screen.getByLabelText("History index").textContent).toBe("2");
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await screen.findByText("Manual", { selector: "h2" });
    fireEvent.click(screen.getByText("Redo", { selector: "button" }));
    await screen.findByText("Generated", { selector: "h2" });
  });
  it("keeps the production Puck override and bridge mounted when a request updates chat state", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const attach = vi.spyOn(LocalEditorChatCanvas.prototype, "attach");
    const fetchMock = vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              stream = controller;
            },
          }),
          { headers }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    const editor = render(<ChatHarness />);
    await submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const attachmentCount = attach.mock.calls.length;
    editor.rerender(<ChatHarness />);
    act(() =>
      stream.enqueue(
        new TextEncoder().encode(
          wire({ type: "commentary", delta: "Working…" })
        )
      )
    );
    await screen.findByText("Working…");
    expect(attach).toHaveBeenCalledTimes(attachmentCount);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(fetchMock.mock.calls.length).toBe(1);
    act(() => {
      stream.enqueue(
        new TextEncoder().encode(
          wire({
            type: "accepted",
            text: "Updated",
            spec: generatedContent("Final"),
          })
        )
      );
      stream.close();
    });
    await screen.findByText("Final", { selector: "h2" });
    attach.mockRestore();
  });
  it.each(["entity", "locale"])(
    "still cancels a request when the actual %s changes",
    async (context) => {
      let stream!: ReadableStreamDefaultController<Uint8Array>;
      let signal!: AbortSignal;
      const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
        signal = init!.signal!;
        return new Response(
          new ReadableStream({
            start(controller) {
              stream = controller;
            },
          }),
          { headers }
        );
      });
      vi.stubGlobal("fetch", fetchMock);
      const editor = render(<ChatHarness />);
      await submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
      editor.rerender(
        <ChatHarness
          entityId={context === "entity" ? "two" : "one"}
          locale={context === "locale" ? "fr" : "en"}
        />
      );
      await waitFor(() => expect(signal.aborted).toBe(true));
      expect(screen.getByText("Original", { selector: "h2" })).toBeTruthy();
      act(() => {
        stream.enqueue(
          new TextEncoder().encode(
            wire({
              type: "accepted",
              text: "Late",
              spec: generatedContent("Late"),
            })
          )
        );
        stream.close();
      });
      expect(screen.queryByText("Late", { selector: "h2" })).toBeNull();
    }
  );
  it("streams commentary while the canvas remains unchanged until transport completes", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const fetchMock = vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(c) {
              stream = c;
            },
          }),
          { headers }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness />);
    await submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    act(() =>
      stream.enqueue(
        new TextEncoder().encode(
          wire({ type: "commentary", delta: "Working…" })
        )
      )
    );
    await screen.findByText("Working…");
    expect(screen.getByText("Original", { selector: "h2" })).toBeTruthy();
    act(() =>
      stream.enqueue(
        new TextEncoder().encode(
          wire({
            type: "accepted",
            text: "Updated",
            spec: generatedContent("Final"),
          })
        )
      )
    );
    expect(screen.queryByText("Final", { selector: "h2" })).toBeNull();
    act(() => stream.close());
    await screen.findByText("Final", { selector: "h2" });
  });
  it.each(["clarification", "transport", "invalid"])(
    "preserves layout and history for %s",
    async (mode) => {
      const body =
        mode === "transport"
          ? wire({ type: "commentary", delta: "Working…" })
          : wire({
              type: "accepted",
              text: "Which image?",
              spec:
                mode === "clarification"
                  ? null
                  : {
                      content: [
                        { type: "Heading", props: { id: "heading", text: 42 } },
                      ],
                    },
            });
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(body, { headers }))
      );
      render(<ChatHarness />);
      await submit();
      if (mode === "clarification") await screen.findByText("Which image?");
      else await screen.findByRole("alert");
      expect(screen.getByText("Original", { selector: "h2" })).toBeTruthy();
      expect(screen.getByLabelText("History index").textContent).toBe("0");
    }
  );
});
