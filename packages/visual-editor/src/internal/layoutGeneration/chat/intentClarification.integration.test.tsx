import { Puck } from "@puckeditor/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { expect, it, vi } from "vitest";
import { ErrorProvider } from "../../../contexts/ErrorContext.tsx";
import { TemplatePropsContext } from "../../../hooks/useDocument.tsx";
import { LayoutPuckOverride } from "../../components/LayoutPuckOverride.tsx";
import type { TemplateMetadata } from "../../types/templateMetadata.ts";
import {
  chatConfig,
  generatedContent,
  layout,
} from "../testing/chatFixtures.tsx";
import { executeGeneration } from "../transport/executeGeneration.ts";
import { LayoutGenerationProvider } from "./LayoutGenerationProvider.tsx";
import { layoutGenerationChatPlugin } from "./LayoutGenerationChatPlugin.tsx";
import { IntentPageGenerationChatContext } from "./useIntentPageGeneration.ts";

vi.mock("../transport/executeGeneration.ts", () => ({
  executeGeneration: vi.fn(),
}));

it.each(
  (["blank", "blank-create", "existing"] as const).flatMap((scenario) => [
    { scenario, action: "answer" as const },
    { scenario, action: "cancel" as const },
  ])
)(
  "$action an intent clarification using the same attempt: $scenario",
  async ({ scenario, action }) => {
    const existing = scenario === "existing";
    const prompt = "Generate an intent page for our custom fit shoe service.";
    const question = "What URL should the Book an appointment buttons link to?";
    const answer = "https://example.com/book";
    const contentRequest =
      "[Content needed: verified custom fit service options]";
    const contentRequestSection = {
      type: "Heading",
      props: { id: "service-options", text: contentRequest },
    };
    const generated = generatedContent("Custom fit shoes");
    generated.content[0].props.content.push(contentRequestSection);
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
        )
          return;
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
        if (
          !asked &&
          scenario === "blank-create" &&
          request.mode === "prepare"
        ) {
          return {
            type: "prepared",
            preparation: {
              question: null,
              translationMode: "defaultOnly",
              cardCounts: [],
            },
          };
        }
        if (!asked) {
          asked = true;
          return existing
            ? {
                type: "regenerated",
                text: "",
                result: { action: "clarification", question },
              }
            : scenario === "blank-create"
              ? { type: "accepted", text: question, spec: null }
              : {
                  type: "prepared",
                  preparation: {
                    question,
                    translationMode: null,
                    cardCounts: [],
                  },
                };
        }
        if (request.mode === "prepare")
          return {
            type: "prepared",
            preparation: {
              question: null,
              translationMode: "defaultOnly",
              cardCounts: [],
            },
          };
        return existing
          ? {
              type: "regenerated",
              text: "Created the service page.",
              result: {
                action: "regenerate",
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
            }
          : {
              type: "accepted",
              text: "Created the service page.",
              spec: generated,
            };
      });
    const initial = layout();
    if (!existing) initial.content[0].props.content = [];
    const metadata = {
      siteId: 1,
      templateId: "template",
      layoutId: "2",
      assignment: "ALL",
      locales: ["en"],
      aiPageGeneration: {
        layoutGenerationEnabled: true,
        model: "model",
        intentPageGeneration: { prompt, status: "PENDING" },
      },
    } as TemplateMetadata;
    render(
      <ErrorProvider>
        <TemplatePropsContext.Provider value={{ document: { locale: "en" } }}>
          <LayoutGenerationProvider config={chatConfig} metadata={metadata}>
            <Puck
              config={chatConfig}
              data={initial}
              iframe={{ enabled: false }}
              plugins={[layoutGenerationChatPlugin]}
              overrides={{ puck: LayoutPuckOverride }}
            />
            <Capture />
          </LayoutGenerationProvider>
        </TemplatePropsContext.Provider>
      </ErrorProvider>
    );
    document.querySelector<HTMLElement>(".Puck")!.style.visibility = "visible";
    await screen.findByText(question);
    await waitFor(() => expect(intent?.state.stage).toBe("clarification"));
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
      expect(execute).toHaveBeenCalledTimes(
        scenario === "blank-create" ? 2 : 1
      );
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
    await screen.findByText("Custom fit shoes", { selector: "h2" });
    await waitFor(() => expect(intent?.state.stage).toBe("completed"));
    for (const [request] of execute.mock.calls) {
      expect(request.purpose).toBe("intent");
    }
    expect(
      execute.mock.calls.find(([request]) =>
        request.messages.some((message) => message.content === answer)
      )![0].messages
    ).toEqual([
      { role: "user", content: prompt },
      { role: "assistant", content: question },
      { role: "user", content: answer },
    ]);
    expect(execute.mock.calls.map(([request]) => request.mode)).toEqual(
      existing
        ? ["regenerate", "regenerate"]
        : scenario === "blank-create"
          ? ["prepare", "create", "prepare", "create"]
          : ["prepare", "prepare", "create"]
    );
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
