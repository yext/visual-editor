import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { reportChatDiagnostic } from "../../../local-editor/generationDiagnostics.ts";
import type { SectionEditTask } from "../edits/types.ts";
import type { GenerationResult } from "../shared/contracts.ts";
import { GenerationError } from "../shared/generationErrors.ts";
import {
  ChatHarness,
  chatConfig,
  generatedContent,
  openChat,
} from "../testing/chatFixtures.tsx";
import {
  deferredGeneration,
  stubGenerationExecutor,
} from "../testing/executorFixtures.ts";
import { slottedFixture } from "../testing/slottedFixtures.ts";
import { executeGeneration } from "../transport/executeGeneration.ts";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import { LayoutGenerationChatUiContext } from "./contexts.tsx";

vi.mock("../transport/executeGeneration.ts", () => ({
  executeGeneration: vi.fn(),
}));

const accepted = (text: string, reply = "Created"): GenerationResult => ({
  type: "accepted",
  text: reply,
  spec: generatedContent(text),
});
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
    { target: { value: "Change the heading" } }
  );
  fireEvent.keyDown(
    screen.getByRole("textbox", { name: "Describe what you want" }),
    { key: "Enter" }
  );
};
afterEach(() => vi.unstubAllGlobals());

describe("strict generation in the editor", () => {
  it("reports browser resolver errors with the candidate and generation correlation", async () => {
    stubGenerationExecutor(async () => accepted("Generated", "Updated"), {
      skipPreparation: true,
    });
    const reportRequest = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ recorded: true }))
    );
    vi.stubGlobal("fetch", reportRequest);
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
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Heading (heading) resolveData failed"
    );
    await waitFor(() => expect(reportRequest).toHaveBeenCalledOnce());
    const report = JSON.parse(reportRequest.mock.calls[0][1]!.body as string);
    expect(reportRequest.mock.calls[0][0]).toBe("/local/generate/error");
    expect(report).toMatchObject({
      correlationId: vi.mocked(executeGeneration).mock.calls[0][3],
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
    const task: SectionEditTask = {
      taskId: "heading-edit",
      sectionId: "heading",
      targetComponentIds: ["heading"],
      instructions: "Set /text on the selected Heading component",
      description: "Change the heading",
      structuralOperations: [],
      dependsOn: [],
      generateContent: true,
    };
    const respond = vi.fn(async (body: any): Promise<GenerationResult> =>
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
                  changes: [{ kind: "set", path: "/text", value: "Generated" }],
                },
              ],
            },
          }
    );
    stubGenerationExecutor(respond);
    render(<ChatHarness />);
    fireEvent.click(screen.getByText("Manual edit", { selector: "button" }));
    await screen.findByText("Manual", { selector: "h2" });
    await waitFor(() =>
      expect(screen.getByLabelText("History index").textContent).toBe("1")
    );
    await submit();
    await screen.findByText("Generated", { selector: "h2" });
    expect(respond.mock.calls[0][0].currentData).toEqual(
      generatedContent("Manual")
    );
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
    const respond = vi.fn(async (_body: any) => accepted("Generated"));
    stubGenerationExecutor(respond, { skipPreparation: true });
    render(<ChatHarness initialData={{ root: {}, content: [] }} />);
    await submit();
    await screen.findByText("Generated", { selector: "h2" });
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await waitFor(() =>
      expect(screen.queryByText("Generated", { selector: "h2" })).toBeNull()
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Describe what you want" }),
      { target: { value: "Create a different page" } }
    );
    fireEvent.keyDown(
      screen.getByRole("textbox", { name: "Describe what you want" }),
      { key: "Enter" }
    );
    await waitFor(() => expect(respond).toHaveBeenCalledTimes(2));
    expect(respond.mock.calls[1][0]).toMatchObject({
      currentData: { content: [] },
      messages: [
        { role: "user", content: "Change the heading" },
        { role: "assistant", content: "Created" },
        { role: "user", content: "Create a different page" },
      ],
    });
    await screen.findByText("Generated", { selector: "h2" });
  });

  it("keeps the production Puck override and bridge mounted when a request updates chat state", async () => {
    const pending = deferredGeneration();
    const attach = vi.spyOn(LayoutGenerationChatCanvas.prototype, "attach");
    const respond = vi.fn(() => pending.promise);
    stubGenerationExecutor(respond, { skipPreparation: true });
    const editor = render(
      <ChatHarness initialData={{ root: {}, content: [] }} />
    );
    await submit();
    expect(screen.getByText("Generating layout…")).toBeTruthy();
    expect(document.querySelector(".local-editor-chat-spinner")).toBeTruthy();
    await waitFor(() => expect(respond).toHaveBeenCalledOnce());
    const attachmentCount = attach.mock.calls.length;
    editor.rerender(<ChatHarness initialData={{ root: {}, content: [] }} />);
    expect(attach).toHaveBeenCalledTimes(attachmentCount);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(respond).toHaveBeenCalledOnce();
    await act(async () => pending.resolve(accepted("Final", "Updated")));
    await screen.findByText("Final", { selector: "h2" });
    attach.mockRestore();
  });

  it.each(["entity", "locale"])(
    "still cancels a request when the actual %s changes",
    async (context) => {
      const pending = deferredGeneration();
      let signal!: AbortSignal;
      const respond = vi.fn((_body: any, requestSignal: AbortSignal) => {
        signal = requestSignal;
        return pending.promise;
      });
      stubGenerationExecutor(respond, { skipPreparation: true });
      const editor = render(
        <ChatHarness initialData={{ root: {}, content: [] }} />
      );
      await submit();
      await waitFor(() => expect(respond).toHaveBeenCalledOnce());
      editor.rerender(
        <ChatHarness
          initialData={{ root: {}, content: [] }}
          entityId={context === "entity" ? "two" : "one"}
          locale={context === "locale" ? "fr" : "en"}
        />
      );
      await waitFor(() => expect(signal.aborted).toBe(true));
      await act(async () => pending.resolve(accepted("Late", "Late")));
      expect(screen.queryByText("Original", { selector: "h2" })).toBeNull();
      expect(screen.queryByText("Late", { selector: "h2" })).toBeNull();
    }
  );

  it("keeps the loading message until execution completes, then shows the final response", async () => {
    const pending = deferredGeneration();
    const respond = vi.fn(() => pending.promise);
    stubGenerationExecutor(respond, { skipPreparation: true });
    render(<ChatHarness initialData={{ root: {}, content: [] }} />);
    await submit();
    await waitFor(() => expect(respond).toHaveBeenCalledOnce());
    expect(screen.getByText("Generating layout…")).toBeTruthy();
    expect(screen.queryByText("Updated")).toBeNull();
    expect(screen.queryByText("Final", { selector: "h2" })).toBeNull();
    await act(async () => pending.resolve(accepted("Final", "Updated")));
    await screen.findByText("Final", { selector: "h2" });
    await screen.findByText("Updated");
  });

  it.each(["clarification", "transport", "invalid"])(
    "preserves layout and history for %s",
    async (mode) => {
      stubGenerationExecutor(
        async () =>
          mode === "clarification"
            ? { type: "accepted", text: "Which image?", spec: null }
            : new GenerationError(
                mode === "transport"
                  ? "Generation interrupted"
                  : "Invalid generated heading",
                mode === "invalid",
                mode === "transport"
              ),
        { skipPreparation: true }
      );
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response("{}"))
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
      stubGenerationExecutor(
        async () => ({ type: "accepted", text: "Created", spec: candidate }),
        { skipPreparation: true }
      );
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response("{}"))
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
