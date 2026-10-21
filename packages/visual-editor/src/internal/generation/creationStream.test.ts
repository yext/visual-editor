import { describe, expect, it } from "vitest";
import { z } from "zod";
import { slottedFixture } from "./slottedGenerationTestUtils.ts";
import { CreationStream } from "./creationStream.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { createPuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import type { Content } from "./authored.ts";
import {
  creation,
  creationCatalog,
  heading,
} from "./testing/creationFixtures.ts";

describe("incremental creation", () => {
  it("reveals complete MainContent children for every possible two-chunk boundary", async () => {
    const response = creation();
    const wire = JSON.stringify(response);
    for (let split = 0; split <= wire.length; split++) {
      const compiler = compileGenerationSchema(creationCatalog(), ["en"], {
        content: [{ type: "MainContent", props: { id: "main", content: [] } }],
      });
      const snapshots: Content[] = [];
      const parser = compiler.stream(async (content) => {
        snapshots.push(content);
      });
      await parser.write(wire.slice(0, split));
      await parser.write(wire.slice(split));
      parser.finish();
      expect(
        snapshots.map((snapshot) => snapshot.content[0].props.content.length)
      ).toEqual([1, 2]);
      expect(snapshots[0].content[0].props.id).toBe("main");
      expect(snapshots[1].content[0].props.content[0].props.id).toBe(
        snapshots[0].content[0].props.content[0].props.id
      );
      expect(compiler.parseResponse(wire).spec).toEqual(snapshots[1]);
    }
  });

  it("emits before closing the page and never emits an unfinished section", async () => {
    const compiler = compileGenerationSchema(creationCatalog(), ["en"]);
    const snapshots: Content[] = [];
    const parser = compiler.stream(async (content) => {
      snapshots.push(content);
    });
    const wire = JSON.stringify(creation());
    const boundary = wire.indexOf(',{"type":"Heading"');
    for (const char of wire.slice(0, boundary)) await parser.write(char);
    expect(snapshots).toHaveLength(1);
    expect(() => parser.finish()).toThrow("Incomplete");
    await parser.write(wire.slice(boundary));
    parser.finish();
    expect(snapshots).toHaveLength(2);
  });

  it("retains the valid prefix and rejects the first invalid complete section", async () => {
    const compiler = compileGenerationSchema(creationCatalog(), ["en"]);
    const snapshots: Content[] = [];
    const parser = compiler.stream(async (content) => {
      snapshots.push(content);
    });
    await expect(
      parser.write(JSON.stringify(creation([heading("First"), heading("")])))
    ).rejects.toThrow();
    expect(snapshots).toHaveLength(1);
  });

  it("defers scaffolds with required properties after their slot", async () => {
    const catalog = createPuckGenerationCatalog({
      ...creationCatalog().data.components,
      MainContent: {
        generation: {
          props: z.object({ content: z.array(z.unknown()), label: z.string() }),
        },
        fields: { content: { type: "slot" } },
      },
    });
    const compiler = compileGenerationSchema(catalog, ["en"]);
    const snapshots: Content[] = [];
    const parser = compiler.stream(async (content) => {
      snapshots.push(content);
    });
    const response = creation();
    (response.result.content[0].props as any).label = "Main";
    await parser.write(JSON.stringify(response));
    parser.finish();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].content[0].props.content).toHaveLength(2);
  });

  it.each([
    '{"a":1,"a":2}',
    '{"a":1,}',
    "[1,]",
    '{"a":true "b":false}',
    "{}{}",
  ])("rejects malformed or duplicate JSON: %s", async (wire) => {
    const parser = new CreationStream(async () => {});
    await expect(parser.write(wire)).rejects.toThrow();
  });
});

it("defers page-wide omission checks while retaining validated card sections", async () => {
  const fixture = slottedFixture();
  const compiler = compileGenerationSchema(
    fixture.catalog,
    ["en", "fr"],
    undefined,
    {
      question: null,
      translationMode: "translate",
      cardCounts: [{ componentType: "Section", instanceIndex: 1, count: 3 }],
    }
  );
  const snapshots: Content[] = [];
  const parser = compiler.stream(async (content) => {
    snapshots.push(content);
  });
  const response = {
    text: "Created",
    translationMode: "translate",
    result: { action: "create", content: [fixture.section()] },
  };
  const wire = JSON.stringify(response);
  await parser.write(wire);
  parser.finish();
  expect(snapshots).toHaveLength(1);
  const section = snapshots[0].content[0];
  expect(section.props.data.constantValue).toHaveLength(
    section.props.slots.CardSlot.length
  );
  expect(() => compiler.parseResponse(wire)).toThrow("omitted a prepared");
});
