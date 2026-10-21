import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockGenerationRequest } from "./generationTestClient.ts";
import { openChat } from "./chatTestUtils.tsx";
import { reportChatDiagnostic } from "../../../local-editor/generationDiagnostics.ts";
import { slottedFixture } from "../slottedGenerationTestUtils.ts";
import { LayoutGenerationChatUiContext } from "./LayoutGenerationChatUiContext.tsx";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { ChatHarness, chatConfig, generatedContent } from "./chatTestUtils.tsx";

// These tests exercise rendering and Puck application. The actual preparation
// exchange is covered separately in useLayoutGenerationChat and endpoint tests.
vi.mock("../engine.ts", () => ({
  executeGeneration: (...args: Parameters<typeof mockGenerationRequest>) =>
    args[0].mode === "prepare"
      ? Promise.resolve({
          type: "prepared",
          preparation: {
            question: null,
            translationMode: "defaultOnly",
            cardCounts: [],
          },
        })
      : mockGenerationRequest(...args),
}));

const wire = (event: any) => JSON.stringify(event) + "\n";
const headers = { "X-Visual-Editor-Generation": "strict-puck-overrides-v2" };
const submit = async () => {
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
      target: { value: "Change the heading" },
    }
  );
  fireEvent.keyDown(
    screen.getByRole("textbox", { name: "Describe what you want" }),
    { key: "Enter" }
  );
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
        initialData={{ root: {}, content: [] }}
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
    expect(screen.queryByText("Generated", { selector: "h2" })).toBeNull();
    expect(screen.getByLabelText("History index").textContent).toBe("0");
  });
  it("includes manual edits and creates one undoable transaction", async () => {
    const task = {
      taskId: "heading-edit",
      sectionId: "heading",
      targetComponentIds: ["heading"],
      instructions: "Set /text on the selected Heading component",
      description: "Change the heading",
      structuralOperations: [],
      dependsOn: [],
      generateContent: true,
    };
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init!.body as string);
      return new Response(
        wire(
          body.mode === "plan"
            ? {
                type: "planned",
                plan: {
                  intent: "content",
                  text: "Updated",
                  clarification: null,
                  globalStyleGuidance: null,
                  limitations: null,
                  sharedIntent: "Update",
                  tasks: [task],
                },
              }
            : {
                type: "section-result",
                result: {
                  taskId: task.taskId,
                  sectionId: task.sectionId,
                  operations: [
                    {
                      kind: "update",
                      componentId: "heading",
                      changes: [
                        { kind: "set", path: "/text", value: "Generated" },
                      ],
                    },
                  ],
                },
              }
        ),
        { headers: { "X-Visual-Editor-Generation": "section-edits-v1" } }
      );
    });
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
    await waitFor(() =>
      expect(reportChatDiagnostic).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          correlationId: expect.any(String),
          sequence: expect.any(Number),
          phase: "commit-readback",
          details: expect.objectContaining({
            taskId: "heading-edit",
            snapshot: expect.any(Object),
            validationError: null,
          }),
        })
      )
    );
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await screen.findByText("Manual", { selector: "h2" });
    await waitFor(() =>
      expect(reportChatDiagnostic).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          phase: "canvas-observed",
          details: expect.objectContaining({
            snapshot: expect.objectContaining(generatedContent("Manual")),
          }),
        })
      )
    );
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
    fireEvent.change(
      screen.getByRole("textbox", { name: "Describe what you want" }),
      {
        target: { value: "Create a different page" },
      }
    );
    fireEvent.keyDown(
      screen.getByRole("textbox", { name: "Describe what you want" }),
      { key: "Enter" }
    );
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
    const attach = vi.spyOn(LayoutGenerationChatCanvas.prototype, "attach");
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
    const editor = render(
      <ChatHarness initialData={{ root: {}, content: [] }} />
    );
    await submit();
    expect(screen.getByText("Generating layout…")).toBeTruthy();
    expect(document.querySelector(".local-editor-chat-spinner")).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const attachmentCount = attach.mock.calls.length;
    editor.rerender(<ChatHarness initialData={{ root: {}, content: [] }} />);
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
        if (_url.endsWith("/error")) {
          return new Response(JSON.stringify({ recorded: true }));
        }
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
      const editor = render(
        <ChatHarness initialData={{ root: {}, content: [] }} />
      );
      await submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
      editor.rerender(
        <ChatHarness
          initialData={{ root: {}, content: [] }}
          entityId={context === "entity" ? "two" : "one"}
          locale={context === "locale" ? "fr" : "en"}
        />
      );
      await waitFor(() => expect(signal.aborted).toBe(true));
      expect(screen.queryByText("Original", { selector: "h2" })).toBeNull();
      expect(() =>
        stream.enqueue(
          new TextEncoder().encode(
            wire({
              type: "accepted",
              text: "Late",
              spec: generatedContent("Late"),
            })
          )
        )
      ).toThrow();
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
    render(<ChatHarness initialData={{ root: {}, content: [] }} />);
    await submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(screen.getByText("Generating layout…")).toBeTruthy();
    expect(screen.queryByText("Original", { selector: "h2" })).toBeNull();
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
      render(<ChatHarness initialData={{ root: {}, content: [] }} />);
      await submit();
      if (mode === "clarification") {
        await screen.findByText("Which image?");
      } else {
        await screen.findByRole("alert");
      }
      expect(screen.queryByText("Original", { selector: "h2" })).toBeNull();
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
      if (reject) {
        f.components.FAQCard.resolveData = (component: any) => ({
          ...component,
          props: {
            ...component.props,
            data: { ...component.props.data, answer: "Resolver replacement" },
          },
        });
      }
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

vi.mock(
  "../../../local-editor/generationDiagnostics.ts",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../local-editor/generationDiagnostics.ts")
    >()),
    reportChatDiagnostic: vi.fn(),
  })
);

it("keeps Sections first and preserves drafts across panel switches and editor remounts", async () => {
  const { rerender } = render(<ChatHarness />);
  await waitFor(() =>
    expect(screen.getByLabelText("Current plugin").textContent).toBe("blocks")
  );
  const navigation = screen.getByRole("navigation", { hidden: true });
  const labels = within(navigation).getAllByText(
    /^(Sections|Outline|Layout Assistant)$/
  );
  expect(labels.map((label) => label.textContent)).toEqual([
    "Sections",
    "Outline",
    "Layout Assistant",
  ]);
  openChat();
  const prompt = screen.getByRole("textbox", {
    name: "Describe what you want",
  });
  fireEvent.change(prompt, { target: { value: "A draft to keep" } });
  fireEvent.click(within(navigation).getByText("Outline"));
  expect(
    screen.queryByRole("textbox", { name: "Describe what you want" })
  ).toBeNull();
  openChat();
  expect(screen.getByRole("textbox", { name: "Describe what you want" })).toBe(
    prompt
  );
  expect((prompt as HTMLTextAreaElement).value).toBe("A draft to keep");

  rerender(<ChatHarness locale="fr" />);
  openChat();
  expect(
    (
      screen.getByRole("textbox", {
        name: "Describe what you want",
      }) as HTMLTextAreaElement
    ).value
  ).toBe("A draft to keep");
  rerender(<ChatHarness layoutId="other" />);
  openChat();
  expect(
    (
      screen.getByRole("textbox", {
        name: "Describe what you want",
      }) as HTMLTextAreaElement
    ).value
  ).toBe("");
});

it("shows token usage in a dismissible popover and closes it when switching panels", async () => {
  render(<ChatHarness />);
  openChat();
  const trigger = screen.getByRole("button", { name: "Token usage" });
  expect(
    screen.queryByRole("dialog", { name: "Conversation token usage" })
  ).toBeNull();
  fireEvent.click(trigger);
  const usage = await screen.findByRole("dialog", {
    name: "Conversation token usage",
  });
  expect(usage.textContent).toContain("Cached input: 0");
  expect(usage.textContent).toContain("Uncached input: 0");
  expect(usage.textContent).toContain("Output: 0");
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  fireEvent.keyDown(usage, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  fireEvent.click(trigger);
  await screen.findByRole("dialog", { name: "Conversation token usage" });
  fireEvent.click(within(screen.getByRole("navigation")).getByText("Outline"));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  openChat();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

it("does not rerender editor context consumers when typing a draft", async () => {
  const editorRender = vi.fn();
  const EditorSubscriber = () => {
    // InternalLayoutEditor subscribes to this context to register the plugin.
    React.useContext(LayoutGenerationChatUiContext);
    editorRender();
    return null;
  };
  render(
    <ChatHarness>
      <EditorSubscriber />
    </ChatHarness>
  );
  openChat();
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  editorRender.mockClear();
  const prompt = screen.getByRole("textbox", {
    name: "Describe what you want",
  });
  for (const value of ["N", "Ne", "Nex", "Next message"]) {
    fireEvent.input(prompt, { target: { value } });
  }
  expect((prompt as HTMLTextAreaElement).value).toBe("Next message");
  expect(editorRender).not.toHaveBeenCalled();
});
