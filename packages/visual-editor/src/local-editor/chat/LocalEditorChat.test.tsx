import React from "react";
import { slottedFixture } from "../../internal/generation/slottedGenerationTestUtils.ts";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";
import { ChatHarness, chatConfig, generatedContent } from "./chatTestUtils.tsx";

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
  it("reports browser resolver errors with the candidate and generation correlation", async () => {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
      url.endsWith("/error")
        ? new Response(JSON.stringify({ recorded: true }))
        : new Response(
            wire({
              type: "accepted",
              text: "Updated",
              spec: generatedContent("Generated"),
            }),
            { headers }
          )
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <ChatHarness
        config={{
          components: {
            ...chatConfig.components,
            Heading: {
              ...chatConfig.components.Heading,
              resolveData: (data) => {
                if (data.props.text === "Generated") {
                  const missing: any = undefined;
                  return missing.entityField;
                }
                return data;
              },
            },
          },
        }}
      />
    );
    await submit();
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Heading (heading) resolveData failed");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const request = fetchMock.mock.calls[0][1]!;
    const report = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(fetchMock.mock.calls[1][0]).toBe("/local/generate/error");
    expect(report).toMatchObject({
      correlationId: (request.headers as Record<string, string>)[
        "X-Visual-Editor-Correlation-Id"
      ],
      layoutId: "location",
      phase: "resolve-and-commit",
      candidate: generatedContent("Generated"),
    });
    expect(report.stack).toContain("entityField");
    expect(report.stack).toContain("Caused by:");
    expect(screen.getByText("Original", { selector: "h2" })).toBeTruthy();
    expect(screen.getByLabelText("History index").textContent).toBe("0");
  });
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
  it("sends assistant prose in subsequent turns after undoing generation", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(
          wire({
            type: "accepted",
            text: "Created",
            spec: generatedContent("Generated"),
          }),
          { headers }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ChatHarness initialData={{ root: {}, content: [] }} />);
    await submit();
    await screen.findByText("Generated", { selector: "h2" });
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await waitFor(() =>
      expect(screen.queryByText("Generated", { selector: "h2" })).toBeNull()
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Create a different page" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const body = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(body.currentData).toEqual({ content: [] });
    expect(body.messages).toEqual([
      { role: "user", content: "Change the heading" },
      { role: "assistant", content: "Created" },
      { role: "user", content: "Create a different page" },
    ]);
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
    expect(screen.getByText("Generating layout…")).toBeTruthy();
    expect(document.querySelector(".local-editor-chat-spinner")).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const attachmentCount = attach.mock.calls.length;
    editor.rerender(<ChatHarness />);
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
        if (_url.endsWith("/error"))
          return new Response(JSON.stringify({ recorded: true }));
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
  it("keeps the loading message until transport completes, then shows the final response", async () => {
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
    expect(screen.getByText("Generating layout…")).toBeTruthy();
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
    expect(screen.queryByText("Updated")).toBeNull();
    expect(screen.getByText("Generating layout…")).toBeTruthy();
    act(() => stream.close());
    await screen.findByText("Final", { selector: "h2" });
    await screen.findByText("Updated");
  });
  it.each(["clarification", "transport", "invalid"])(
    "preserves layout and history for %s",
    async (mode) => {
      const body =
        mode === "transport"
          ? ""
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

describe("slotted source generation in the editor", () => {
  it.each([false, true])(
    "commits one undoable transaction or preserves history on resolver rejection (%s)",
    async (reject) => {
      const f = slottedFixture();
      f.components.Section.render = ({ slots }: any) => <slots.CardSlot />;
      f.components.FAQCard.render = ({ data }: any) => (
        <p>{data.question.defaultValue}</p>
      );
      if (reject)
        f.components.FAQCard.resolveData = (component: any) => ({
          ...component,
          props: {
            ...component.props,
            data: { ...component.props.data, answer: "Resolver replacement" },
          },
        });
      const candidate = f.materialize([f.section([f.card("Generated FAQ")])]);
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response(
              wire({
                type: "accepted",
                text: "Created",
                spec: candidate,
              }),
              { headers }
            )
        )
      );
      render(
        <ChatHarness
          config={{ components: f.components }}
          initialData={{ root: { props: {} }, content: [], zones: {} }}
        />
      );
      await submit();
      if (reject) {
        await screen.findByRole("alert");
        expect(
          screen.queryByText("Generated FAQ", { selector: "p" })
        ).toBeNull();
        expect(screen.getByLabelText("History index").textContent).toBe("0");
      } else {
        await screen.findByText("Generated FAQ", { selector: "p" });
        expect(screen.getByLabelText("History index").textContent).toBe("1");
        fireEvent.click(screen.getByText("Undo", { selector: "button" }));
        await waitFor(() =>
          expect(
            screen.queryByText("Generated FAQ", { selector: "p" })
          ).toBeNull()
        );
        fireEvent.click(screen.getByText("Redo", { selector: "button" }));
        await screen.findByText("Generated FAQ", { selector: "p" });
      }
    }
  );
});
