// @vitest-environment node
import { expect, it, vi } from "vitest";
import { createFlatPatchStream } from "./flatPatchStream.ts";

const initial = {
  root: "root",
  elements: {
    root: { type: "__PuckContentRoot", props: {}, children: [] },
  },
};
// Reduced from the log: these records are missing their outer closing brace.
const malformedDescription =
  '{"op":"add","path":"/elements/promo-description","value":{"type":"BodyTextSlot","props":{"data":{"text":{"field":"","constantValue":{"defaultValue":"Fresh favorites"},"constantValueEnabled":true}},"styles":{"variant":"base"}}}';

it("identifies a malformed streamed operation without leaking it as assistant prose", async () => {
  const text = vi.fn();
  const preview = vi.fn();
  const stream = createFlatPatchStream(initial, text, preview);
  try {
    await stream.push("Working\n" + malformedDescription.slice(0, 35));
    await expect(
      stream.push(malformedDescription.slice(35) + "\n")
    ).rejects.toMatchObject({
      category: "malformed_json",
      lineNumber: 2,
      operationNumber: 1,
      path: "/elements/promo-description",
      excerpt: expect.stringContaining('"variant":"base"'),
    });
    expect(text.mock.calls.map(([delta]) => delta).join("")).toBe("Working\n");
    expect(preview).not.toHaveBeenCalled();
  } finally {
    await stream.cancel();
  }
});

const operation =
  '{"op":"add","path":"/elements/text","value":{"type":"Text","props":{"text":"Hello"}}}';
it.each([
  malformedDescription
    .replace("promo-description", "promo-image")
    .replace("BodyTextSlot", "ImageSlot"),
  '{"op":"add","path":"/elements/promo-cta","value":{"type":"CTASlot","props":{"eventName":"cta"}}',
  operation + operation,
  operation + "\\n" + operation,
])(
  "rejects malformed records and separators without emitting patch text %#",
  async (record) => {
    const text = vi.fn();
    const preview = vi.fn();
    const stream = createFlatPatchStream(initial, text, preview);
    try {
      await stream.push(record);
      await expect(stream.finish()).rejects.toMatchObject({
        category: "malformed_json",
        lineNumber: 1,
        operationNumber: 1,
      });
      expect(text).not.toHaveBeenCalled();
      expect(preview).not.toHaveBeenCalled();
    } finally {
      await stream.cancel();
    }
  }
);

it("preserves escaped string newlines and applies chunked, indented JSONL operations", async () => {
  const text = vi.fn();
  const preview = vi.fn();
  const stream = createFlatPatchStream(initial, text, preview);
  const output =
    '  {"op":"add","path":"/elements/text","value":{"type":"Text","props":{"text":"Hello\\nworld"}}}\n' +
    '{"op":"add","path":"/elements/root/children/-","value":"text"}';
  try {
    for (const char of output) await stream.push(char);
    const result = await stream.finish();
    expect(result.spec.elements.text.props.text).toBe("Hello\nworld");
    expect(result.spec.elements.root.children).toEqual(["text"]);
    expect(result.patchCount).toBe(2);
    expect(stream.stats).toEqual({ parsedOperationCount: 2, patchCount: 2 });
    expect(text).not.toHaveBeenCalled();
  } finally {
    await stream.cancel();
  }
});

it("reports an operation application failure with its source location", async () => {
  const stream = createFlatPatchStream(initial, vi.fn(), vi.fn());
  try {
    await expect(
      stream.push('{"op":"test","path":"/root","value":"wrong"}\n')
    ).rejects.toMatchObject({
      category: "patch_application",
      path: "/root",
      lineNumber: 1,
      operationNumber: 1,
    });
  } finally {
    await stream.cancel();
  }
});

it("bounds malformed record diagnostics even within a spec fence", async () => {
  const text = vi.fn();
  const stream = createFlatPatchStream(initial, text, vi.fn());
  try {
    await stream.push("```spec\n");
    const error = await stream
      .push(malformedDescription + "x".repeat(2000) + "\n")
      .catch((error) => error);
    expect(error).toMatchObject({ category: "malformed_json", lineNumber: 2 });
    expect(error.excerpt.length).toBeLessThanOrEqual(240);
    expect(text).not.toHaveBeenCalled();
  } finally {
    await stream.cancel();
  }
});

it.each([
  ['{"path":"/elements/text","value":{}}', "invalid_patch"],
  ['{"op":"add","path":"/elements/invalid\\q","value":{}}', "malformed_json"],
  ["\\n" + operation, "malformed_json"],
])(
  "diagnoses incomplete operations and invalid escaped paths %#",
  async (record, category) => {
    const text = vi.fn();
    const stream = createFlatPatchStream(initial, text, vi.fn());
    try {
      await stream.push(record);
      await expect(stream.finish()).rejects.toMatchObject({ category });
      expect(text).not.toHaveBeenCalled();
    } finally {
      await stream.cancel();
    }
  }
);

it.each(["{", '{"op', '{"path":"/elements/text","op'])(
  "rejects a truncated JSON record even before the operation key is complete: %s",
  async (record) => {
    const text = vi.fn();
    const stream = createFlatPatchStream(initial, text, vi.fn());
    try {
      await stream.push(record);
      await expect(stream.finish()).rejects.toMatchObject({
        category: "malformed_json",
        lineNumber: 1,
      });
      expect(text).not.toHaveBeenCalled();
    } finally {
      await stream.cancel();
    }
  }
);

it("shows the syntax failure near the end of a long malformed record", async () => {
  const record =
    JSON.stringify({
      op: "add",
      path: "/elements/text",
      value: {
        type: "Text",
        props: { text: "x".repeat(1000), marker: "OFFENDING_END" },
      },
    }) + "}";
  const stream = createFlatPatchStream(initial, vi.fn(), vi.fn());
  try {
    await stream.push(record);
    const error = await stream.finish().catch((error) => error);
    expect(error.excerpt).toContain("OFFENDING_END");
    expect(error.excerpt.length).toBeLessThanOrEqual(240);
    expect(error.path).toBe("/elements/text");
  } finally {
    await stream.cancel();
  }
});
