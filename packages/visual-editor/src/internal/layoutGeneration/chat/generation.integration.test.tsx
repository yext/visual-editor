import type { Config } from "@puckeditor/core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { migrationRegistry } from "../../../components/migrations/migrationRegistry.ts";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { clone } from "../shared/authoredValues.ts";
import { ChatHarness, chatConfig, openChat } from "../testing/chatFixtures.tsx";
import {
  editGenerationFixture,
  editPlan,
  planningResponse,
  editResponse,
  editTask,
} from "../testing/editFixtures.ts";
import { completed, responseModelTransport } from "../testing/modelFixtures.ts";
import { executeGeneration } from "../transport/executeGeneration.ts";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
vi.mock("../transport/executeGeneration.ts", () => ({
  executeGeneration: vi.fn(),
}));

const setup = (
  gateway: (body: any) => Promise<Response>,
  rejectCopy = false,
  extraDefaultLocales = false
) => {
  const fixture = editGenerationFixture();
  if (extraDefaultLocales) {
    const text = fixture.components.Card.defaultProps!.text as Record<
      string,
      unknown
    >;
    text.de = "German library default";
  }
  (fixture.data.root as any).type = "root";
  fixture.data.zones = {};
  fixture.data.root.props = {
    ...fixture.data.root.props,
    version: migrationRegistry.length,
  } as any;
  fixture.data.content[1].props.content[1].props.cards.push({
    type: "Opaque",
    props: { id: "opaque", privateValue: "Preserve opaque content" },
  });
  const components: any = {
    ...fixture.components,
    MainContent: {
      ...chatConfig.components.MainContent,
      fields: fixture.catalog.data.components.MainContent.fields,
    },
    Section: {
      ...fixture.components.Section,
      render: ({ title, cards: Cards }: any) => (
        <section>
          <h2>{title}</h2>
          <Cards />
        </section>
      ),
    },
    Card: {
      ...fixture.components.Card,
      render: ({ text }: any) => <h3>{text.defaultValue}</h3>,
      resolveData: (data: any) => {
        if (rejectCopy && data.props.text.defaultValue === "Resolver failure") {
          throw new Error("Consumer resolver rejected copy");
        }
        return data;
      },
    },
    Header: {
      ...fixture.components.Header,
      render: ({ text }: any) => <header>{text}</header>,
    },
    Footer: {
      ...fixture.components.Footer,
      render: ({ text }: any) => <footer>{text}</footer>,
    },
    Opaque: { render: () => <aside>Opaque content</aside> },
  };
  const catalog = createPuckGenerationCatalog(components);
  const browserRequests: any[] = [];
  const gatewayRequests: any[] = [];
  vi.mocked(executeGeneration).mockImplementation(
    async (request, environment, ...rest) => {
      browserRequests.push(request);
      const { executeGeneration: executeActual } = await vi.importActual<
        typeof import("../transport/executeGeneration.ts")
      >("../transport/executeGeneration.ts");
      return executeActual(
        request,
        {
          ...environment,
          catalog,
          locales: ["en", "fr"],
          transport: responseModelTransport(
            vi.fn(async (body) => {
              gatewayRequests.push(body);
              const response = await gateway(body);
              if (body.text.format.name !== "puck_edit_plan" || !response.ok)
                return response;
              // Encode semantic fixture plans using this request's actual canvas.
              const provider = await response.json();
              provider.output_text = JSON.stringify(
                planningResponse(
                  JSON.parse(provider.output_text),
                  catalog,
                  request.currentData!
                )
              );
              return new Response(JSON.stringify(provider), {
                headers: response.headers,
                status: response.status,
              });
            })
          ),
        },
        ...rest
      );
    }
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}"))
  );
  const attachment = vi.spyOn(LayoutGenerationChatCanvas.prototype, "attach");
  render(
    <ChatHarness
      initialData={fixture.data as any}
      config={{ components } as Config}
    />
  );
  openChat();
  const adapter = attachment.mock.calls.at(-1)![0];
  return { adapter, browserRequests, gatewayRequests };
};
const send = async (prompt: string) => {
  fireEvent.change(
    screen.getByRole("textbox", { name: "Describe what you want" }),
    { target: { value: prompt } }
  );
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
};
const context = (body: any) => JSON.parse(body.input.at(-1).content).context;

it.each(["defaultOnly", "translate"] as const)(
  "keeps normalized insertion values through gateway, transport, Puck, undo and redo (%s)",
  async (translationMode) => {
    const task = {
      ...editTask(
        "first",
        [],
        [
          {
            kind: "insert",
            insertionKey: "new-card",
            componentType: "Card",
            collection: { ownerId: "first", slotPath: "/cards" },
            anchor: { position: "end" },
          },
        ]
      ),
      translationMode,
    };
    const h = setup(
      async (body) => {
        if (body.text.format.name === "puck_edit_plan") {
          return completed(editPlan([task]));
        }
        return completed({
          taskId: task.taskId,
          sectionId: task.sectionId,
          updates: [],
          insertions: [
            {
              insertionKey: "new-card",
              component: {
                type: "Card",
                props: {
                  text: { $default: true },
                  binding: { $default: true },
                  optional: { $unset: true },
                  rows: [],
                  style: { $default: true },
                },
              },
            },
          ],
        });
      },
      false,
      true
    );
    const before = clone(h.adapter.read());
    await send("Add a card with the default copy");
    await screen.findByText("Section changes: 1 applied.");
    expect(h.gatewayRequests).toHaveLength(2);
    const after = clone(h.adapter.read());
    const cards = after.content[1].props.content[0].props.cards;
    expect(cards).toHaveLength(3);
    expect(cards[2].props.text).toEqual({
      defaultValue: "Default",
      ...(translationMode === "translate" ? { fr: "Défaut" } : {}),
    });
    expect(cards.slice(0, 2)).toEqual(
      before.content[1].props.content[0].props.cards
    );
    fireEvent.click(screen.getByText("Undo", { selector: "button" }));
    await waitFor(() => expect(h.adapter.read()).toEqual(before));
    fireEvent.click(screen.getByText("Redo", { selector: "button" }));
    await waitFor(() => expect(h.adapter.read()).toEqual(after));
  }
);

it("runs planning, engine validation, repair and Puck application while preserving repeated cards and opaque data", async () => {
  const target = editTask("first", ["first-b"]);
  let attempts = 0;
  let plan = editPlan([target]);
  const h = setup(async (body) => {
    if (body.text.format.name === "puck_edit_plan") {
      return completed(plan);
    }
    attempts++;
    return completed(
      editResponse(
        attempts === 1 ? editTask("first", ["second-b"]) : target,
        "/text/defaultValue",
        "Welcome back"
      )
    );
  });
  const before = clone(h.adapter.read());
  await send("Change the second card in the first section to Welcome back");
  await screen.findByText("Section changes: 1 applied.");
  const expected = clone(before);
  expected.content[1].props.content[0].props.cards[1].props.text.defaultValue =
    "Welcome back";
  expect(h.adapter.read()).toEqual(expected);
  expect(h.gatewayRequests).toHaveLength(3);
  expect(
    JSON.parse(h.gatewayRequests[2].input.at(-1).content).validationFeedback
  ).toBeTruthy();
  expect(screen.getByLabelText("History index").textContent).toBe("1");
  fireEvent.click(screen.getByText("Undo", { selector: "button" }));
  await waitFor(() => expect(h.adapter.read()).toEqual(before));
  fireEvent.click(screen.getByText("Redo", { selector: "button" }));
  await waitFor(() => expect(h.adapter.read()).toEqual(expected));

  plan = editPlan([
    {
      ...editTask(
        "first",
        ["first-a"],
        [{ kind: "remove", componentId: "first-a" }]
      ),
      generateContent: false,
    },
    {
      ...editTask(
        "footer",
        ["footer"],
        [
          {
            kind: "reorder",
            componentId: "footer",
            anchor: { position: "before", componentId: "main" },
          },
        ]
      ),
      generateContent: false,
    },
  ]);
  await send(
    "Remove the first card and put the footer before the main content"
  );
  await screen.findByText("Section changes: 2 applied.");
  expect(h.gatewayRequests).toHaveLength(4);
  expect(
    h.browserRequests.filter((request) => request.mode === "section")
  ).toHaveLength(2);
  expect(
    h.adapter.read().content.map((component) => component.props.id)
  ).toEqual(["header", "footer", "main"]);
  expect(
    h.adapter
      .read()
      .content[2].props.content[0].props.cards.map((card: any) => card.props.id)
  ).toEqual(["first-b"]);
  expect(h.adapter.read().root).toEqual(before.root);
});

it("keeps earlier commits after local resolution exhausts its retry and skips only dependent tasks", async () => {
  const first = editTask();
  const second = editTask("second", ["second-a"]);
  const independent = editTask("footer", ["footer"]);
  const dependent = {
    ...editTask("header", ["header"]),
    dependsOn: [second.taskId],
  };
  const h = setup(async (body) => {
    if (body.text.format.name === "puck_edit_plan") {
      return completed(editPlan([first, second, independent, dependent]));
    }
    const task = context(body).task;
    return completed(
      editResponse(
        task,
        task.sectionId === "footer" ? "/text" : "/text/defaultValue",
        task.sectionId === "second" ? "Resolver failure" : "Applied copy"
      )
    );
  }, true);
  await send(
    "Update both card groups and the footer, then update the header after the second group"
  );
  await screen.findByText("Section changes: 2 applied, 1 failed, 1 skipped.");
  expect(screen.getByText("Applied copy", { selector: "h3" })).toBeTruthy();
  expect(screen.getByText("Third card", { selector: "h3" })).toBeTruthy();
  expect(screen.getByText("Header", { selector: "header" })).toBeTruthy();
  expect(h.gatewayRequests).toHaveLength(5);
  const retry = h.browserRequests.filter(
    (request) => request.task?.taskId === second.taskId
  )[1];
  expect(retry.validationFeedback).toContain("Consumer resolver rejected copy");
  expect(
    retry.currentData.content[1].props.content[0].props.cards[0].props.text
      .defaultValue
  ).toBe("Applied copy");
  expect(screen.getByLabelText("History index").textContent).toBe("2");
});

it("stops outstanding generation on cancellation without rolling back a committed section", async () => {
  const first = editTask();
  const second = {
    ...editTask("second", ["second-a"]),
    dependsOn: [first.taskId],
  };
  let deliver!: (response: Response) => void;
  const h = setup(async (body) => {
    if (body.text.format.name === "puck_edit_plan") {
      return completed(editPlan([first, second]));
    }
    if (context(body).task.sectionId === "second") {
      return new Promise<Response>((resolve) => {
        deliver = resolve;
      });
    }
    return completed(editResponse(first));
  });
  await send("Update both card groups");
  await screen.findByText("1 of 2 sections applied.");
  await waitFor(() => expect(deliver).toBeDefined());
  fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
  await screen.findByText(/Section changes: 1 applied, 1 cancelled/);
  await act(async () => deliver(completed(editResponse(second))));
  expect(screen.getByText("Updated", { selector: "h3" })).toBeTruthy();
  expect(screen.getByText("Third card", { selector: "h3" })).toBeTruthy();
  expect(
    h.adapter.read().content[1].props.content[1].props.cards[0].props.text
      .defaultValue
  ).toBe("Third card");
});

it("stops other section requests when the gateway transport fails after an earlier commit", async () => {
  const first = editTask();
  const second = {
    ...editTask("second", ["second-a"]),
    dependsOn: [first.taskId],
  };
  const outstanding = {
    ...editTask("footer", ["footer"]),
    dependsOn: [first.taskId],
  };
  let deliver!: (response: Response) => void;
  const h = setup(async (body) => {
    if (body.text.format.name === "puck_edit_plan") {
      return completed(editPlan([first, second, outstanding]));
    }
    const task = context(body).task;
    if (task.sectionId === "second") {
      throw new Error("Gateway disconnected");
    }
    if (task.sectionId === "footer") {
      return new Promise<Response>((resolve) => {
        deliver = resolve;
      });
    }
    return completed(editResponse(first));
  });
  await send("Update the first card, then the second card and footer");
  await screen.findByText(/Section changes: 1 applied, 1 failed, 1 cancelled/);
  expect(screen.getByRole("alert").textContent).toContain(
    "Gateway disconnected"
  );
  await act(async () =>
    deliver(completed(editResponse(outstanding, "/text", "Late footer")))
  );
  expect(h.adapter.read().content[2].props.text).toBe("Footer");
});

it("inserts sections and cards with new identities, then reorders and removes them without extra generation", async () => {
  const insertCard = editTask(
    "first",
    [],
    [
      {
        kind: "insert",
        insertionKey: "new-card",
        componentType: "Card",
        collection: { ownerId: "first", slotPath: "/cards" },
        anchor: { position: "end" },
      },
    ]
  );
  const insertSection = {
    ...editTask(
      "reserved",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new-section",
          componentType: "Section",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
        },
      ]
    ),
    sectionId: null,
  };
  let plan: unknown = {
    ...editPlan([insertCard]),
    tasks: [insertCard, insertSection],
  };
  const defaults = { $default: true };
  const h = setup(async (body) => {
    if (body.text.format.name === "puck_edit_plan") {
      return completed(plan);
    }
    const task = context(body).task;
    const insertion = task.structuralOperations[0];
    return completed({
      taskId: task.taskId,
      sectionId: task.sectionId,
      updates: [],
      insertions: [
        {
          insertionKey: insertion.insertionKey,
          component:
            insertion.componentType === "Card"
              ? {
                  type: "Card",
                  props: {
                    text: defaults,
                    binding: defaults,
                    optional: defaults,
                    rows: defaults,
                    style: defaults,
                  },
                }
              : {
                  type: "Section",
                  props: { title: "New section", cards: defaults },
                },
        },
      ],
    });
  });
  const before = clone(h.adapter.read());
  await send("Add a card to the first section and add a section at the bottom");
  await screen.findByText("Section changes: 2 applied.");
  const main = h.adapter.read().content[1];
  const inserted = main.props.content[0].props.cards[2];
  const newSection = main.props.content[2];
  expect(inserted.props.id).toMatch(/^generated-/);
  expect(newSection.props.id).toMatch(/^generated-/);
  expect(inserted.props.id).not.toBe(newSection.props.id);
  expect(inserted.props.text.defaultValue).toBe("Default");
  expect(inserted.props.editorMetadata).toBeUndefined();
  expect(
    main.props.content.slice(0, 2).map((item: any) => item.props.id)
  ).toEqual(["first", "second"]);
  expect(h.adapter.read().root).toEqual(before.root);

  plan = editPlan([
    {
      ...editTask(
        "first",
        ["first-b", inserted.props.id],
        [
          {
            kind: "reorder",
            componentId: "first-b",
            anchor: { position: "start" },
          },
          { kind: "remove", componentId: inserted.props.id },
        ]
      ),
      generateContent: false,
    },
    {
      ...editTask(
        newSection.props.id,
        [newSection.props.id],
        [
          {
            kind: "reorder",
            componentId: newSection.props.id,
            anchor: { position: "before", componentId: "first" },
          },
        ]
      ),
      generateContent: false,
    },
  ]);
  await send(
    "Move the new section first, move the second original card first, and remove the new card"
  );
  await waitFor(() =>
    expect(h.adapter.read().content[1].props.content[0].props.id).toBe(
      newSection.props.id
    )
  );
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Stop generating" })).toBeNull()
  );
  expect(
    h.adapter
      .read()
      .content[1].props.content[1].props.cards.map((card: any) => card.props.id)
  ).toEqual(["first-b", "first-a"]);
  plan = editPlan([
    {
      ...editTask(
        newSection.props.id,
        [newSection.props.id],
        [{ kind: "remove", componentId: newSection.props.id }]
      ),
      generateContent: false,
    },
  ]);
  await send("Remove the new section");
  await screen.findByText("Section changes: 1 applied.");
  expect(
    h.adapter
      .read()
      .content[1].props.content.map((section: any) => section.props.id)
  ).toEqual(["first", "second"]);
  expect(h.gatewayRequests).toHaveLength(5);
  expect(
    h.browserRequests.filter((request) => request.mode === "section")
  ).toHaveLength(2);
  expect(screen.getByLabelText("History index").textContent).toBe("5");
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
