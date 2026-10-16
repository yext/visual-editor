import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ChatHarness, chatConfig, layout } from "./chatTestUtils.tsx";
import type { SectionEditTask } from "../../internal/generation/editProtocol.ts";

const task = (taskId: string, dependsOn: string[] = []): SectionEditTask => ({
  taskId,
  sectionId: taskId,
  targetComponentIds: [taskId],
  instructions: `Set /text on component ${taskId} using its authored schema`,
  ...(taskId === "heading" ? { description: "Improve the heading." } : {}),
  structuralOperations: [],
  dependsOn,
  generateContent: true,
});
const response = (event: unknown) =>
  new Response(JSON.stringify(event) + "\n", {
    headers: { "X-Visual-Editor-Generation": "section-edits-v1" },
  });
const planned = (tasks: SectionEditTask[]) =>
  response({
    type: "planned",
    plan: {
      intent: "content",
      text: "Everything was updated.",
      clarification: null,
      globalStyleGuidance: null,
      sharedIntent: "Improve copy",
      tasks,
    },
  });
const section = (taskId: string) =>
  response({
    type: "section-result",
    result: {
      taskId,
      sectionId: taskId,
      operations: [
        {
          kind: "update",
          componentId: taskId,
          changes: [{ kind: "set", path: "/text", value: `${taskId} updated` }],
        },
      ],
    },
  });
const submit = async (text = "Improve the page") => {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
};
const editor = (ids = ["heading", "second"]) => {
  const data = layout();
  data.content[0].props.content = ids.map((id) => ({
    type: "Heading",
    props: { id, text: id },
  }));
  render(<ChatHarness initialData={data} />);
  fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
};

it("shows named section progress and preserves applied work when stopped from collapsed chat", async () => {
  let finishPlan!: (response: Response) => void;
  let finishSecond!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init!.body as string);
      if (body.mode === "plan") {
        return new Promise<Response>((resolve) => {
          finishPlan = resolve;
        });
      }
      if (body.task.taskId === "second") {
        return new Promise<Response>((resolve) => {
          finishSecond = resolve;
        });
      }
      return section("heading");
    })
  );
  editor();
  await submit();
  await screen.findByText("Planning changes…");
  await waitFor(() => expect(finishPlan).toBeDefined());
  await act(async () =>
    finishPlan(planned([task("heading"), task("second", ["heading"])]))
  );
  await screen.findByText("heading updated", { selector: "h2" });
  await screen.findByText("1 of 2 sections applied.");
  const progress = screen.getByRole("list", { name: "Section progress" });
  expect(within(progress).getByText("Section 1 · Heading")).toBeTruthy();
  expect(within(progress).getByText("Section 2 · Heading")).toBeTruthy();
  expect(within(progress).getByText("Improve the heading.")).toBeTruthy();
  expect(within(progress).getByText("Update this section.")).toBeTruthy();
  expect(within(progress).queryByText(/authored schema/)).toBeNull();
  expect(within(progress).getByText("Applied")).toBeTruthy();
  expect(within(progress).getByText("Generating changes")).toBeTruthy();
  expect(
    (
      screen.getByRole("button", {
        name: "New conversation",
      }) as HTMLButtonElement
    ).disabled
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Hide chat" }));
  fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
  fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
  await screen.findByText(/Section changes: 1 applied, 1 cancelled/);
  expect(screen.getByText("Cancelled")).toBeTruthy();
  expect(screen.getByText("heading updated", { selector: "h2" })).toBeTruthy();
  expect(screen.getByLabelText("History index").textContent).toBe("1");
  expect(screen.queryByText("Everything was updated.")).toBeNull();
  await act(async () => finishSecond(section("second")));
  expect(screen.queryByText("second updated", { selector: "h2" })).toBeNull();
});

it("shows retrying, failed, skipped and applied outcomes, and sends them in subsequent history", async () => {
  let secondAttempt = 0;
  let finishRetry!: (response: Response) => void;
  const invalid = () =>
    response({ type: "error", error: "Invalid heading copy", retryable: true });
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(init!.body as string);
    if (body.mode === "plan") {
      return planned([
        task("heading"),
        task("second"),
        task("third", ["second"]),
        task("fourth"),
      ]);
    }
    if (body.task.taskId === "second") {
      secondAttempt++;
      return secondAttempt === 1
        ? invalid()
        : new Promise<Response>((resolve) => {
            finishRetry = resolve;
          });
    }
    return section(body.task.taskId);
  });
  vi.stubGlobal("fetch", fetchMock);
  editor(["heading", "second", "third", "fourth"]);
  await submit();
  await screen.findByText("Retrying changes");
  await screen.findByText("Waiting for prerequisites");
  await screen.findByText("fourth updated", { selector: "h2" });
  await act(async () => finishRetry(invalid()));
  await screen.findByText("Section changes: 2 applied, 1 failed, 1 skipped.");
  expect(screen.getByText("Failed")).toBeTruthy();
  expect(screen.getByText("Skipped")).toBeTruthy();
  expect(screen.getByText("Invalid heading copy")).toBeTruthy();
  expect(screen.queryByText("Everything was updated.")).toBeNull();
  fetchMock.mockImplementation(async () =>
    response({
      type: "planned",
      plan: {
        intent: "conversation",
        text: "Reviewed",
        clarification: null,
        globalStyleGuidance: null,
        sharedIntent: "",
        tasks: [],
      },
    })
  );
  await submit("What changed?");
  await screen.findByText("Reviewed");
  const body = JSON.parse(fetchMock.mock.calls.at(-1)![1]!.body as string);
  expect(body.messages[1].content).toContain("Improve the heading.");
  expect(body.messages[1].content).not.toContain("authored schema");
  expect(body.messages[1].content).toContain("Section 2 · Heading: failed");
  expect(body.messages[1].content).toContain("Section 3 · Heading: skipped");
  expect(
    screen.getAllByRole("list", { name: "Section progress" })
  ).toHaveLength(1);
});

it("distinguishes a resolving section from another result waiting in the application queue", async () => {
  let finishResolution!: () => void;
  const resolution = new Promise<void>((resolve) => {
    finishResolution = resolve;
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(init!.body as string);
      return body.mode === "plan"
        ? planned([task("heading"), task("second")])
        : section(body.task.taskId);
    })
  );
  const data = layout();
  data.content[0].props.content.push({
    type: "Heading",
    props: { id: "second", text: "Second" },
  });
  render(
    <ChatHarness
      initialData={data}
      config={{
        components: {
          ...chatConfig.components,
          Heading: {
            ...chatConfig.components.Heading,
            resolveData: async (data) => {
              if (data.props.text === "heading updated") {
                await resolution;
              }
              return data;
            },
          },
        },
      }}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Show chat" }));
  await submit();
  await screen.findByText("Applying changes");
  await screen.findByText("Waiting to apply");
  expect(screen.getByLabelText("History index").textContent).toBe("0");
  await act(async () => finishResolution());
  await screen.findByText("Section changes: 2 applied.");
  expect(screen.getByLabelText("History index").textContent).toBe("2");
});

vi.mock("./chatDiagnostics.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./chatDiagnostics.ts")>()),
  reportChatDiagnostic: vi.fn(),
}));
