import {
  testPrompts,
  testGenerationSettings,
} from "../testing/promptFixtures.ts";
import { Puck } from "@puckeditor/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { expect, it, vi } from "vitest";
import { ErrorProvider } from "../../../contexts/ErrorContext.tsx";
import { TemplatePropsContext } from "../../../hooks/useDocument.tsx";
import { EntityFieldsContext } from "../../../hooks/useEntityFields.tsx";
import {
  LayoutPuckOverride,
  LayoutPreviewOverride,
} from "../../components/LayoutPuckOverride.tsx";
import type { TemplateMetadata } from "../../types/templateMetadata.ts";
import { chatConfig, layout } from "../testing/chatFixtures.tsx";
import { executeGeneration } from "../transport/executeGeneration.ts";
import { LayoutGenerationProvider } from "./LayoutGenerationProvider.tsx";
import { layoutGenerationChatPlugin } from "./LayoutGenerationChatPlugin.tsx";
import { IntentPageGenerationChatContext } from "./useIntentPageGeneration.ts";

vi.mock("../transport/executeGeneration.ts", () => ({
  executeGeneration: vi.fn(),
}));

it.each(["answer", "cancel"] as const)(
  "%s an intent-page full-page-update clarification using the same attempt",
  async (action) => {
    const prompt = "Generate an intent page for our custom fit shoe service.";
    const question = "What URL should the Book an appointment buttons link to?";
    const answer = "https://example.com/book";
    const contentRequest =
      "[Content needed: verified custom fit service options]";
    const contentRequestSection = {
      type: "Heading",
      props: { id: "service-options", text: contentRequest },
    };
    let intent: React.ContextType<typeof IntentPageGenerationChatContext>;
    const Capture = () => {
      intent = React.useContext(IntentPageGenerationChatContext);
      return null;
    };
    const post = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation((message) => {
        if (
          !["updateIntentPageGeneration", "saveLayoutSaveState"].includes(
            message.type
          )
        ) {
          return;
        }
        const status =
          message.type === "saveLayoutSaveState"
            ? "COMPLETED"
            : message.payload.action === "fail"
              ? "FAILED"
              : "RUNNING";
        queueMicrotask(() =>
          window.dispatchEvent(
            new MessageEvent("message", {
              source: window.parent,
              origin: "http://localhost",
              data: {
                type: message.type,
                status: "success",
                payload: {
                  attemptId:
                    message.payload.attemptId ??
                    message.payload.intentPageGeneration.attemptId,
                  generation: {
                    attemptId:
                      message.payload.attemptId ??
                      message.payload.intentPageGeneration.attemptId,
                    status,
                  },
                  ...(message.type === "saveLayoutSaveState"
                    ? { layoutSaved: true }
                    : {}),
                },
              },
            })
          )
        );
      });
    let asked = false;
    const execute = vi
      .mocked(executeGeneration)
      .mockImplementation(async (request) => {
        expect(request.mode).toBe("fullPageUpdate");
        expect(
          screen.getByText("Original", { selector: "h2" }).closest("[hidden]")
        ).toBeTruthy();
        if (!asked) {
          asked = true;
          return {
            type: "fullPageUpdated",
            text: "",
            result: { action: "clarification", question },
          };
        }
        return {
          type: "fullPageUpdated",
          text: "Created the service page.",
          result: {
            action: "fullPageUpdate",
            steps: [
              {
                kind: "replace",
                sectionId: "heading",
                sections: [
                  {
                    type: "Heading",
                    props: { id: "custom-fit", text: "Custom fit shoes" },
                  },
                  contentRequestSection,
                ],
              },
            ],
          },
        };
      });
    const initial = layout();
    const metadata = {
      siteId: 1,
      templateId: "template",
      layoutId: "2",
      assignment: "ALL",
      locales: ["en"],
      aiPageGeneration: {
        layoutGenerationEnabled: true,
        model: "model",
        prompts: testPrompts,
        generationSettings: testGenerationSettings,
        intentPageGeneration: { prompt, status: "PENDING" },
      },
    } as TemplateMetadata;
    const scrollTop = vi.spyOn(Element.prototype, "scrollTop", "set");
    render(
      <ErrorProvider>
        <EntityFieldsContext.Provider value={null}>
          <TemplatePropsContext.Provider value={{ document: { locale: "en" } }}>
            <LayoutGenerationProvider config={chatConfig} metadata={metadata}>
              <Puck
                config={chatConfig}
                data={initial}
                iframe={{ enabled: false }}
                plugins={[layoutGenerationChatPlugin]}
                overrides={{
                  puck: LayoutPuckOverride,
                  preview: LayoutPreviewOverride,
                }}
              />
              <Capture />
            </LayoutGenerationProvider>
          </TemplatePropsContext.Provider>
        </EntityFieldsContext.Provider>
      </ErrorProvider>
    );
    document.querySelector<HTMLElement>(".Puck")!.style.visibility = "visible";
    await screen.findByText(question);
    const log = screen.getByRole("log", { name: "Generation conversation" });
    expect(
      scrollTop.mock.contexts.filter((element) => element === log)
    ).toHaveLength(0);
    scrollTop.mockRestore();
    Object.defineProperty(log, "scrollHeight", { value: 500 });
    expect(log.scrollTop).toBe(0);
    await waitFor(() => expect(intent?.state.stage).toBe("clarification"));
    expect(
      screen.getByText("Original", { selector: "h2" }).closest("[hidden]")
    ).toBeTruthy();
    const start = post.mock.calls
      .map(([message]) => message)
      .find((message) => message.type === "updateIntentPageGeneration");
    const attemptId = start.payload.attemptId;
    expect(intent!.workflow.blocked).toBe(true);
    const input = screen.getByRole("textbox", {
      name: "Describe what you want",
    }) as HTMLTextAreaElement;
    expect(input.disabled).toBe(false);
    const stop = screen.getByRole("button", { name: "Stop generating" });
    const reset = screen.getByRole("button", {
      name: "New conversation",
    }) as HTMLButtonElement;
    expect(reset.disabled).toBe(true);
    if (action === "cancel") {
      fireEvent.click(stop);
      await waitFor(() => expect(intent?.state.stage).toBe("failed"));
      expect(
        screen.getByText("Original", { selector: "h2" }).closest("[hidden]")
      ).toBeNull();
      expect(intent!.workflow.blocked).toBe(false);
      expect(
        post.mock.calls.some(
          ([message]) =>
            message.type === "updateIntentPageGeneration" &&
            message.payload.action === "fail" &&
            message.payload.attemptId === attemptId
        )
      ).toBe(true);
      expect(
        post.mock.calls.some(
          ([message]) => message.type === "saveLayoutSaveState"
        )
      ).toBe(false);
      expect(execute).toHaveBeenCalledOnce();
      expect(input.disabled).toBe(false);
      expect(reset.disabled).toBe(false);
      expect(
        screen.queryByRole("button", { name: "Stop generating" })
      ).toBeNull();
      fireEvent.click(reset);
      expect(screen.queryByText(question)).toBeNull();
      return;
    }
    fireEvent.change(input, { target: { value: answer } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(log.scrollTop).toBe(500);
    await screen.findByText("Custom fit shoes", { selector: "h2" });
    await waitFor(() => expect(intent?.state.stage).toBe("completed"));
    expect(
      screen
        .getByText("Custom fit shoes", { selector: "h2" })
        .closest("[hidden]")
    ).toBeNull();
    expect(
      execute.mock.calls.find(([request]) =>
        request.messages.some((message) => message.content === answer)
      )![0].messages
    ).toEqual([
      { role: "user", content: prompt },
      { role: "assistant", content: question },
      { role: "user", content: answer },
    ]);
    expect(execute.mock.calls.map(([request]) => request.mode)).toEqual([
      "fullPageUpdate",
      "fullPageUpdate",
    ]);
    const messages = post.mock.calls
      .filter(([, origin]) => String(origin) === "http://localhost")
      .map(([message]) => message);
    expect(messages.some((message) => message.payload?.action === "fail")).toBe(
      false
    );
    const saves = messages.filter(
      (message) => message.type === "saveLayoutSaveState"
    );
    expect(saves).toHaveLength(1);
    expect(saves[0].payload.intentPageGeneration.attemptId).toBe(attemptId);
    expect(screen.getByText(contentRequest, { selector: "h2" })).toBeTruthy();
    const savedData = JSON.parse(saves[0].payload.history).data;
    expect(savedData.content[0].props.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "Heading",
          props: expect.objectContaining({ text: contentRequest }),
        }),
      ])
    );
    expect(
      messages
        .filter((message) => message.type === "updateIntentPageGeneration")
        .every((message) => message.payload.attemptId === attemptId)
    ).toBe(true);
  }
);
