// @vitest-environment node
import { describe, expect, it } from "vitest";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";
import {
  buildGenerationPrompt,
  validateGeneratedText,
} from "./generationValidation.ts";

const color = z
  .string()
  .regex(/^\[#[0-9a-fA-F]{6}\]$/)
  .describe("Use bracketed hex, for example [#D63384]");
const catalog = defineCatalog(schema, {
  components: {
    Banner: {
      description: "A banner",
      props: z.object({
        text: z.string().describe("Always use an emoji."),
        style: z
          .object({
            selectedColor: z.union([z.enum(["primary", "secondary"]), color]),
          })
          .describe("Banner style"),
        fields: z
          .array(z.object({ field: z.string().describe("Entity field path") }))
          .optional(),
      }),
    },
    Stack: { props: z.object({}) },
  },
  actions: {},
});
const output = (props: object, state?: object) =>
  "```spec\n" +
  [
    { op: "add", path: "/root", value: "banner" },
    {
      op: "add",
      path: "/elements/banner",
      value: { type: "Banner", props, children: [] },
    },
    ...(state ? [{ op: "add", path: "/state", value: state }] : []),
  ]
    .map((patch) => JSON.stringify(patch))
    .join("\n") +
  "\n```\n";

describe("generation schema guidance and validation", () => {
  it("preserves nested and shared descriptions, patterns, enums, optional fields and unions", () => {
    const prompt = buildGenerationPrompt(catalog);
    expect(prompt).toContain("Always use an emoji.");
    expect(prompt).toContain("Entity field path");
    expect(prompt).toContain("Banner style");
    const fields = JSON.parse(
      prompt.split(
        "COMPONENT FIELD SCHEMAS (authoritative constraints and field guidance):\n"
      )[1]
    );
    const props = fields.Banner.props;
    expect(props.required).toEqual(["text", "style"]);
    // Shared sub-schemas are referenced once to keep the model prompt compact.
    const expand = (node: any): any => {
      if (Array.isArray(node)) return node.map(expand);
      if (!node || typeof node !== "object") return node;
      if (node.$ref)
        return expand(
          node.$ref
            .split("/")
            .slice(1)
            .reduce((value: any, key: string) => value[key], props)
        );
      return Object.fromEntries(
        Object.entries(node).map(([key, value]) => [key, expand(value)])
      );
    };
    expect(
      expand(props.properties.style.properties.selectedColor).anyOf
    ).toEqual([
      { type: "string", enum: ["primary", "secondary"] },
      expect.objectContaining({
        pattern: "^\\[#[0-9a-fA-F]{6}\\]$",
        description: expect.stringContaining("bracketed hex"),
      }),
    ]);
  });

  it("rejects bare hex but accepts bracketed hex; descriptions are guidance", () => {
    expect(
      validateGeneratedText(
        catalog,
        output({ text: "Hello", style: { selectedColor: "#D63384" } })
      )
    ).not.toEqual([]);
    expect(
      validateGeneratedText(
        catalog,
        output({ text: "Hello", style: { selectedColor: "[#D63384]" } })
      )
    ).toEqual([]);
  });

  it("validates resolved state bindings and preserves expression output", () => {
    const props = {
      text: { $state: "/title" },
      style: { selectedColor: { $state: "/color" } },
    };
    expect(
      validateGeneratedText(
        catalog,
        output(props, { title: "Hi 👋", color: "[#D63384]" })
      )
    ).toEqual([]);
    expect(
      validateGeneratedText(
        catalog,
        output(props, { title: "Hi", color: "#D63384" })
      )
    ).not.toEqual([]);
  });

  it("rejects structurally incomplete specs, unknown components, and invalid preview editing context", () => {
    expect(
      validateGeneratedText(
        catalog,
        '```spec\n{"op":"add","path":"/root","value":"missing"}\n```'
      )
    ).not.toEqual([]);
    expect(
      validateGeneratedText(
        catalog,
        output({
          text: "Hi",
          style: { selectedColor: "primary" },
          puck: { isEditing: true },
        })
      )
    ).toContain('banner: puck must be exactly { "isEditing": false }');
    expect(
      validateGeneratedText(
        catalog,
        output({ text: "Hi", style: { selectedColor: "primary" } }).replace(
          '"Banner"',
          '"Unknown"'
        )
      )
    ).not.toEqual([]);
  });
});

it("checks repeated item bindings with their concrete runtime scope", () => {
  const repeated = (colors: string[]) =>
    "```spec\n" +
    [
      { op: "add", path: "/root", value: "stack" },
      {
        op: "add",
        path: "/elements/stack",
        value: {
          type: "Stack",
          props: {},
          children: ["banner"],
          repeat: { statePath: "/items" },
        },
      },
      {
        op: "add",
        path: "/elements/banner",
        value: {
          type: "Banner",
          props: { text: "Hi", style: { selectedColor: { $item: "color" } } },
          children: [],
        },
      },
      {
        op: "add",
        path: "/state",
        value: { items: colors.map((color) => ({ color })) },
      },
    ]
      .map((patch) => JSON.stringify(patch))
      .join("\n") +
    "\n```\n";
  expect(
    validateGeneratedText(catalog, repeated(["[#D63384]", "primary"]))
  ).toEqual([]);
  expect(
    validateGeneratedText(catalog, repeated(["[#D63384]", "#D63384"]))
  ).not.toEqual([]);
  expect(validateGeneratedText(catalog, repeated([]))).toEqual([]);
});

it("rejects malformed patch lines and unterminated fences", () => {
  const valid = output({ text: "Hi", style: { selectedColor: "primary" } });
  expect(
    validateGeneratedText(
      catalog,
      valid.replace("\n```\n", "\n{broken}\n```\n")
    )
  ).not.toEqual([]);
  expect(validateGeneratedText(catalog, valid.replace("\n```\n", ""))).toEqual([
    "Unclosed spec fence",
  ]);
});

it("accepts a required generated preview puck object without contradictory repair errors", () => {
  const bannerCatalog = defineCatalog(schema, {
    components: {
      Banner: {
        props: z.object({
          text: z.string(),
          style: z.object({ selectedColor: color }),
          puck: z.object({ isEditing: z.boolean() }),
        }),
      },
    },
    actions: {},
  });
  const props = { text: "Hi 👋", style: { selectedColor: "[#D63384]" } };
  expect(
    validateGeneratedText(
      bannerCatalog,
      output({ ...props, puck: { isEditing: false } })
    )
  ).toEqual([]);
  expect(validateGeneratedText(bannerCatalog, output(props))).not.toEqual([]);
  for (const puck of [
    { isEditing: true },
    { isEditing: false, dragRef: null },
    { isEditing: { $state: "/editing" } },
  ]) {
    expect(
      validateGeneratedText(bannerCatalog, output({ ...props, puck }))
    ).toContain('banner: puck must be exactly { "isEditing": false }');
  }
});
