// @vitest-environment node
import { expect, it, vi } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { createPuckGenerationPreview } from "./generationPreview.ts";
import { createStructuredGenerationParser } from "./structuredGenerationStream.ts";
import { compileGenerationSchema } from "./generationSchema.ts";

const setup = () => {
  const catalog = createPuckGenerationCatalog({
    Heading: { props: z.object({ text: z.string() }) },
  });
  const emit = vi.fn();
  const parser = createStructuredGenerationParser({
    onText: vi.fn(),
    onValue: createPuckGenerationPreview(catalog, emit),
  });
  return { emit, parser };
};
it("withholds partial and invalid sections while preserving completed siblings and order", () => {
  const { emit, parser } = setup();
  parser.push(
    `{"text":"Building","spec":{"content":[{"type":"MainContent","props":{"id":"main","content":[{"type":"Heading","props":{"id":"first","text":"First`
  );
  expect(emit.mock.calls.at(-1)?.[0].content[0].props.content ?? []).toEqual(
    []
  );
  parser.push(
    ' section"}},{"type":"Heading","props":{"id":"bad","text":42}},{"type":"Heading","props":{"id":"second","text":"Second'
  );
  expect(emit.mock.calls.at(-1)?.[0].content[0].props.content).toEqual([
    { type: "Heading", props: { id: "first", text: "First section" } },
  ]);
  parser.push(' section"}}]}}]}}');
  expect(
    emit.mock.calls
      .at(-1)?.[0]
      .content[0].props.content.map(
        (item: { props: { id: string } }) => item.props.id
      )
  ).toEqual(["first", "second"]);
  expect(
    emit.mock.calls.some(([data]) =>
      JSON.stringify(data).includes('"id":"bad"')
    )
  ).toBe(false);
});
it("handles malformed array data without inventing sections", () => {
  const { emit, parser } = setup();
  parser.push(`{"text":"Building","spec":{"content":"bad"}}`);
  expect(emit).not.toHaveBeenCalled();
});
it("emits only content for a complete response", () => {
  const { emit, parser } = setup();
  const spec = {
    content: [{ type: "Heading", props: { id: "heading", text: "Heading" } }],
  };
  parser.push(JSON.stringify({ text: "Created", spec }));
  expect(emit.mock.calls.at(-1)?.[0]).toEqual(spec);
});

it("normalizes completed streaming components and restores flags before previewing", () => {
  const catalog = createPuckGenerationCatalog({
    Heading: {
      props: z.object({ text: z.string(), optional: z.string().optional() }),
    },
  });
  const current = {
    content: [
      {
        type: "Heading",
        props: { id: "heading", text: "Original" },
        readOnly: { text: true },
      },
    ],
  };
  const compiled = compileGenerationSchema(catalog, [], current);
  const emit = vi.fn();
  const parser = createStructuredGenerationParser({
    onText: vi.fn(),
    onValue: createPuckGenerationPreview(
      catalog,
      emit,
      compiled.normalizeContent
    ),
  });
  parser.push(
    '{"text":"Building","spec":{"content":[{"type":"MainContent","props":{"id":"main","content":[{"type":"Heading","props":{"id":"heading","text":"New","optional":null}},'
  );
  expect(emit.mock.calls.at(-1)?.[0].content[0].props.content[0]).toEqual({
    type: "Heading",
    props: { id: "heading", text: "New" },
    readOnly: { text: true },
  });
});
