import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalEditorJsonRender } from "./LocalEditorJsonRender.tsx";

afterEach(() => vi.unstubAllGlobals());
const validatedResponse = (body: string | ReadableStream<Uint8Array>) =>
  new Response(
    typeof body === "string"
      ? JSON.stringify({ type: "accepted", content: body }) + "\n"
      : body,
    { headers: { "X-Visual-Editor-Generation": "validated-v1" } }
  );
const wireEvent = (event: object) => JSON.stringify(event) + "\n";

describe("LocalEditorJsonRender", () => {
  it("submits a prompt and renders streamed section props", async () => {
    const spec = {
      root: "heading",
      elements: {
        heading: {
          type: "Heading",
          props: { text: "Generated heading" },
          children: [],
        },
      },
    };
    const fetchMock = vi.fn(async () =>
      validatedResponse(
        `{"op":"add","path":"/root","value":${JSON.stringify(spec.root)}}\n` +
          `{"op":"add","path":"/elements/heading","value":${JSON.stringify(spec.elements.heading)}}\n`
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <LocalEditorJsonRender
        api="/local/generate"
        registry={{
          Heading: ({ element }) => <h2>{element.props.text}</h2>,
        }}
      />
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  Add a heading  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));
    expect(
      await screen.findByRole("heading", { name: "Generated heading" })
    ).toBeTruthy();
    const request = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(request[0]).toBe("/local/generate");
    expect(JSON.parse(request[1].body as string).messages).toEqual([
      { role: "user", content: "Add a heading" },
    ]);
  });

  it("renders before completion and carries spec fences into revisions and resets history", async () => {
    const generated =
      "Here is your heading.\n```spec\n" +
      '{"op":"add","path":"/root","value":"heading"}\n' +
      '{"op":"add","path":"/elements/heading","value":{"type":"Heading","props":{"text":"Original"},"children":[]}}\n```\n';
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        validatedResponse(
          new ReadableStream({
            start(controller) {
              stream = controller;
            },
          })
        )
      )
      .mockImplementation(async () =>
        validatedResponse(generated.replace("Original", "Revised"))
      );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <LocalEditorJsonRender
        api="/local/generate"
        registry={{
          Heading: ({ element }) => <h2>{element.props.text}</h2>,
        }}
      />
    );
    const submit = (text: string) => {
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: text },
      });
      fireEvent.click(screen.getByRole("button", { name: "Generate" }));
    };
    submit("Add a heading");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    stream.enqueue(
      new TextEncoder().encode(wireEvent({ type: "preview", delta: generated }))
    );
    expect(
      await screen.findByRole("heading", { name: "Original" })
    ).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Generating…" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    stream.enqueue(
      new TextEncoder().encode(
        wireEvent({ type: "accepted", content: generated })
      )
    );
    stream.close();
    await screen.findByRole("button", { name: "Generate" });
    submit("Rename it");
    expect(
      await screen.findByRole("heading", { name: "Revised" })
    ).toBeTruthy();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages).toEqual([
      { role: "user", content: "Add a heading" },
      { role: "assistant", content: generated },
      { role: "user", content: "Rename it" },
    ]);
    await screen.findByRole("button", { name: "Generate" });
    fireEvent.click(screen.getByRole("button", { name: "New conversation" }));
    expect(screen.queryByRole("heading", { name: "Original" })).toBeNull();
    submit("Start over");
    await screen.findByRole("heading", { name: "Revised" });
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).messages).toEqual([
      { role: "user", content: "Start over" },
    ]);
  });

  it.each([
    { open: "```spec", close: "```" },
    { open: "````spec", close: "````" },
    { open: "```spec", close: "```\n```" },
  ])(
    "hides spec fence delimiters ($open / $close) across chunks",
    async ({ open, close }) => {
      const output =
        "Here is your heading.\n" +
        open +
        "\n" +
        '{"op":"add","path":"/root","value":"heading"}\n' +
        '{"op":"add","path":"/elements/heading","value":{"type":"Heading","props":{"text":"Generated"},"children":[]}}\n' +
        close;
      vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
          validatedResponse(
            new ReadableStream({
              start(controller) {
                for (const byte of new TextEncoder().encode(
                  wireEvent({ type: "accepted", content: output })
                )) {
                  controller.enqueue(new Uint8Array([byte]));
                }
                controller.close();
              },
            })
          )
        )
      );
      render(
        <LocalEditorJsonRender
          api="/local/generate"
          registry={{
            Heading: ({ element }) => <h2>{element.props.text}</h2>,
          }}
        />
      );
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "Add a heading" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Generate" }));
      await screen.findByRole("heading", { name: "Generated" });
      await screen.findByRole("button", { name: "Generate" });
      const conversation = screen.getByRole("log");
      expect(conversation.textContent).toContain("Here is your heading.");
      expect(conversation.textContent).not.toContain("```");
    }
  );

  it("excludes partial failed output from subsequent requests", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(validatedResponse("Initial answer\n"))
      .mockResolvedValueOnce(
        validatedResponse(
          new ReadableStream({
            start(controller) {
              stream = controller;
            },
          })
        )
      )
      .mockResolvedValueOnce(validatedResponse("Recovered answer\n"));
    vi.stubGlobal("fetch", fetchMock);
    render(<LocalEditorJsonRender api="/local/generate" registry={{}} />);
    const submit = (text: string) => {
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: text },
      });
      fireEvent.click(screen.getByRole("button", { name: "Generate" }));
    };
    submit("Start");
    await screen.findByText("Initial answer");
    await screen.findByRole("button", { name: "Generate" });
    submit("Failed revision");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    stream.enqueue(
      new TextEncoder().encode(
        wireEvent({ type: "preview", delta: "Partial output\n" })
      )
    );
    await screen.findByText("Partial output");
    stream.error(new Error("Stream disconnected"));
    await screen.findByText("Stream disconnected");
    expect(screen.queryByText("Partial output")).toBeNull();
    expect(screen.getByText("Initial answer")).toBeTruthy();
    submit("Retry revision");
    await screen.findByText("Recovered answer");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).messages).toEqual([
      { role: "user", content: "Start" },
      { role: "assistant", content: "Initial answer\n" },
      { role: "user", content: "Retry revision" },
    ]);
  });

  it("shows server errors and re-enables generation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "Set OPENAI_API_KEY" }), {
            status: 503,
          })
      )
    );
    render(<LocalEditorJsonRender api="/local/generate" registry={{}} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Add a heading" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));
    expect(await screen.findByText("Set OPENAI_API_KEY")).toBeTruthy();
    await waitFor(() =>
      expect(
        (screen.getByRole("button", { name: "Generate" }) as HTMLButtonElement)
          .disabled
      ).toBe(false)
    );
  });
});

it("labels provisional output, replaces repaired previews, and saves only accepted content", async () => {
  const output = (text: string) =>
    "```spec\n" +
    '{"op":"add","path":"/root","value":"heading"}\n' +
    JSON.stringify({
      op: "add",
      path: "/elements/heading",
      value: { type: "Heading", props: { text }, children: [] },
    }) +
    "\n```\n";
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        new ReadableStream({
          start(controller) {
            stream = controller;
          },
        }),
        { headers: { "X-Visual-Editor-Generation": "validated-v1" } }
      )
    )
    .mockResolvedValueOnce(validatedResponse("Follow-up\n"));
  vi.stubGlobal("fetch", fetchMock);
  render(
    <LocalEditorJsonRender
      api="/local/generate"
      registry={{ Heading: ({ element }) => <h2>{element.props.text}</h2> }}
    />
  );
  const submit = (text: string) => {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));
  };
  const emit = (event: object) =>
    stream.enqueue(new TextEncoder().encode(JSON.stringify(event) + "\n"));
  submit("Add a heading");
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  emit({ type: "preview", delta: output("Invalid preview") });
  await screen.findByRole("heading", { name: "Invalid preview" });
  expect(screen.getByRole("status").textContent).toContain("Provisional");
  emit({ type: "reset" });
  await waitFor(() => expect(screen.queryByRole("heading")).toBeNull());
  emit({ type: "accepted", content: output("Repaired") });
  stream.close();
  await screen.findByRole("heading", { name: "Repaired" });
  await screen.findByRole("button", { name: "Generate" });
  expect(screen.queryByRole("status")).toBeNull();
  submit("Revise it");
  await screen.findByText("Follow-up");
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).messages[1].content).toBe(
    output("Repaired")
  );
});

it("rejects a completed transport without an acceptance event", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({ type: "preview", delta: "Unvalidated\n" }) + "\n",
          { headers: { "X-Visual-Editor-Generation": "validated-v1" } }
        )
    )
  );
  render(<LocalEditorJsonRender api="/local/generate" registry={{}} />);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Generate" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Generate" }));
  await screen.findByText("Generation ended before spec acceptance");
  expect(screen.queryByText("Unvalidated")).toBeNull();
});

it("accumulates usage across turns and repairs, retains failed usage, and resets for a new conversation", async () => {
  const usage = wireEvent({
    type: "usage",
    usage: { cachedInput: 10, uncachedInput: 3, output: 2 },
  });
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        usage +
          wireEvent({ type: "reset" }) +
          usage +
          wireEvent({ type: "accepted", content: "First answer" }),
        {
          headers: { "X-Visual-Editor-Generation": "validated-v1" },
        }
      )
    )
    .mockResolvedValueOnce(
      new Response(usage + wireEvent({ type: "error", error: "Failed turn" }), {
        headers: { "X-Visual-Editor-Generation": "validated-v1" },
      })
    )
    .mockResolvedValueOnce(
      new Response(
        usage + wireEvent({ type: "accepted", content: "Next answer" }),
        {
          headers: { "X-Visual-Editor-Generation": "validated-v1" },
        }
      )
    );
  vi.stubGlobal("fetch", fetchMock);
  render(<LocalEditorJsonRender api="/local/generate" registry={{}} />);
  const submit = () => {
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Generate" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));
  };
  const expectUsage = (cached: number, uncached: number, output: number) => {
    const text = screen.getByLabelText("Conversation token usage").textContent;
    expect(text).toContain(`Cached input: ${cached}`);
    expect(text).toContain(`uncached input: ${uncached}`);
    expect(text).toContain(`output: ${output}`);
  };
  submit();
  await screen.findByText("First answer");
  await screen.findByRole("button", { name: "Generate" });
  expectUsage(20, 6, 4);
  submit();
  await screen.findByText("Failed turn");
  await screen.findByRole("button", { name: "Generate" });
  expectUsage(30, 9, 6);
  submit();
  await screen.findByText("Next answer");
  await screen.findByRole("button", { name: "Generate" });
  expectUsage(40, 12, 8);
  fireEvent.click(screen.getByRole("button", { name: "New conversation" }));
  expectUsage(0, 0, 0);
});

it("allows a new conversation after the first turn fails with reported usage", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          wireEvent({
            type: "usage",
            usage: { cachedInput: 10, uncachedInput: 3, output: 2 },
          }) + wireEvent({ type: "error", error: "First turn failed" }),
          { headers: { "X-Visual-Editor-Generation": "validated-v1" } }
        )
    )
  );
  render(<LocalEditorJsonRender api="/local/generate" registry={{}} />);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Generate" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Generate" }));
  await screen.findByText("First turn failed");
  expect(
    screen.getByLabelText("Conversation token usage").textContent
  ).toContain("Cached input: 10");
  const button = screen.getByRole("button", {
    name: "New conversation",
  }) as HTMLButtonElement;
  expect(button.disabled).toBe(false);
  fireEvent.click(button);
  expect(
    screen.getByLabelText("Conversation token usage").textContent
  ).toContain("Cached input: 0");
  expect(screen.queryByText("First turn failed")).toBeNull();
});
