import { describe, expect, it } from "vitest";
import { z } from "zod";
import { applyAuthoredValueEdits } from "./editValues.ts";

const color = z.union([
  z.object({ selectedColor: z.literal("black") }),
  z.object({ selectedColor: z.literal("white") }),
]);

describe("optional union edits", () => {
  it.each([false, true])(
    "unsets optional unions before inspecting their required branches (insertion %s)",
    (insertion) => {
      const component = {
        type: "Card",
        props: {
          id: "card",
          styles: { color: { selectedColor: "black" }, align: "left" },
        },
      };
      const config = {
        generation: {
          props: z.object({
            styles: z.object({ color: color.optional(), align: z.string() }),
          }),
        },
      };
      applyAuthoredValueEdits(
        component,
        config,
        [{ kind: "unset", path: "/styles/color" }],
        insertion
      );
      expect(component.props.styles).toEqual({ align: "left" });
    }
  );

  it("keeps explicit null distinct from omission for nullable unions", () => {
    const component = {
      type: "Card",
      props: { id: "card", color: { selectedColor: "black" } as unknown },
    };
    applyAuthoredValueEdits(
      component,
      {
        generation: { props: z.object({ color: color.nullable().optional() }) },
      },
      [{ kind: "set", path: "/color", value: null }]
    );
    expect(component.props).toHaveProperty("color", null);
  });

  it("rejects unsetting a required union", () => {
    const component = {
      type: "Card",
      props: { id: "card", color: { selectedColor: "black" } },
    };
    expect(() =>
      applyAuthoredValueEdits(
        component,
        { generation: { props: z.object({ color }) } },
        [{ kind: "unset", path: "/color" }]
      )
    ).toThrow("Invalid authored edit");
  });

  it("preserves protected keys when an optional union wrapper is unset", () => {
    const component = {
      type: "Card",
      props: {
        id: "card",
        color: { selectedColor: "black", privateValue: "Keep" },
      },
    };
    expect(() =>
      applyAuthoredValueEdits(
        component,
        { generation: { props: z.object({ color: color.optional() }) } },
        [{ kind: "unset", path: "/color" }]
      )
    ).toThrow("Invalid authored edit");
    expect(component.props.color.privateValue).toBe("Keep");
  });
});

describe("batched union edits", () => {
  const backgroundColor = z.union([
    z.object({
      selectedColor: z.literal("white"),
      contrastingColor: z.literal("black"),
      isDarkColor: z.literal(false),
    }),
    z.object({
      selectedColor: z.literal("palette-primary-dark"),
      contrastingColor: z.literal("white"),
      isDarkColor: z.literal(true),
    }),
  ]);
  const config = {
    generation: {
      props: z.object({
        title: z.string(),
        styles: z.object({ backgroundColor }),
      }),
    },
  };
  const banner = () => ({
    type: "Banner",
    props: {
      id: "banner",
      title: "Keep this title",
      styles: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "black",
          isDarkColor: false,
          metadata: "Keep",
        },
      },
      metadata: "Private",
    },
  });
  const changes = [
    {
      kind: "set" as const,
      path: "/styles/backgroundColor/selectedColor",
      value: "palette-primary-dark",
    },
    {
      kind: "set" as const,
      path: "/styles/backgroundColor/contrastingColor",
      value: "white",
    },
    {
      kind: "set" as const,
      path: "/styles/backgroundColor/isDarkColor",
      value: true,
    },
  ];

  it.each([false, true])(
    "changes correlated color fields in either order (reverse %s)",
    (reverse) => {
      const component = banner();
      applyAuthoredValueEdits(
        component,
        config,
        reverse ? [...changes].reverse() : changes
      );
      expect(component.props).toEqual({
        ...banner().props,
        styles: {
          backgroundColor: {
            selectedColor: "palette-primary-dark",
            contrastingColor: "white",
            isDarkColor: true,
            metadata: "Keep",
          },
        },
      });
    }
  );

  it("rejects an invalid final combination without partially applying other changes", () => {
    const component = banner();
    const before = structuredClone(component);
    expect(() =>
      applyAuthoredValueEdits(component, config, [
        { kind: "set", path: "/title", value: "Do not commit" },
        changes[0],
      ])
    ).toThrow("Invalid authored edit");
    expect(component).toEqual(before);
  });

  it.each([
    "/styles/backgroundColor/metadata",
    "/styles/backgroundColor/unknown",
    "/styles/backgroundColor/__proto__",
  ])("rejects undeclared or unsafe paths in a valid batch (%s)", (path) => {
    const component = banner();
    const before = structuredClone(component);
    expect(() =>
      applyAuthoredValueEdits(component, config, [
        ...changes,
        { kind: "set", path, value: "Do not commit" },
      ])
    ).toThrow("Invalid authored edit");
    expect(component).toEqual(before);
  });
});
