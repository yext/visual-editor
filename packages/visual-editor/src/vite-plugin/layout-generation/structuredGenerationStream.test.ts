// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createStructuredGenerationParser } from "./structuredGenerationStream.ts";

describe("structured generation parser", () => {
  it("decodes text escapes across single-character chunks and emits only complete nested elements", () => {
    const onText = vi.fn();
    const onValue = vi.fn();
    const parser = createStructuredGenerationParser({ onText, onValue });
    const text = 'Quotes " and braces { }\nCafé 😀';
    // Exercise escaped surrogate pairs and split Unicode escapes as well as UTF-8 text.
    const output = JSON.stringify({
      text,
      spec: {
        root: "hero",
        elements: {
          hero: { type: "Hero", props: { slots: [{ text }] }, children: [] },
        },
        state: { enabled: true, count: 2, optional: null },
      },
    }).replace("😀", "\\uD83D\\uDE00");
    const boundary = output.indexOf('"children"');
    for (const char of output.slice(0, boundary)) parser.push(char);
    expect(onText.mock.calls.map(([delta]) => delta).join("")).toBe(text);
    expect(
      onValue.mock.calls.some(
        ([path]) => path.join("/") === "spec/elements/hero"
      )
    ).toBe(false);
    for (const char of output.slice(boundary)) parser.push(char);
    expect(
      onValue.mock.calls.find(
        ([path]) => path.join("/") === "spec/elements/hero"
      )?.[1]
    ).toEqual(JSON.parse(output).spec.elements.hero);
    expect(
      onValue.mock.calls.find(([path]) => path.join("/") === "spec/state")?.[1]
    ).toEqual({ enabled: true, count: 2, optional: null });
  });

  it("supports reordered properties and escaped element keys", () => {
    const onValue = vi.fn();
    const parser = createStructuredGenerationParser({
      onText: vi.fn(),
      onValue,
    });
    const output =
      '{"spec":{"elements":{"a/b~\\\"":{"type":"Heading","props":{},"children":[]}},"state":{},"root":"a/b~\\\""},"text":"Done"}';
    for (const char of output) parser.push(char);
    expect(
      onValue.mock.calls.find(
        ([path]) => path.length === 3 && path[1] === "elements"
      )?.[0]
    ).toEqual(["spec", "elements", 'a/b~"']);
  });
});
