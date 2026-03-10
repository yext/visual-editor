import { describe, expect, it } from "vitest";
import { clonePuckResolveData } from "./clonePuckResolveData.ts";

describe("clonePuckResolveData", () => {
  it("deep clones plain objects and arrays", () => {
    const original = {
      root: {
        props: {
          title: "hello",
          items: [{ id: 1 }, { id: 2 }],
        },
      },
    };

    const cloned = clonePuckResolveData(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.root).not.toBe(original.root);
    expect(cloned.root.props).not.toBe(original.root.props);
    expect(cloned.root.props.items).not.toBe(original.root.props.items);
    expect(cloned.root.props.items[0]).not.toBe(original.root.props.items[0]);
  });

  it("preserves function references that may exist in resolved puck data", () => {
    const classNameFn = (variant: string) => variant;
    const original = {
      props: {
        parentStyles: {
          classNameFn,
        },
      },
    };

    const cloned = clonePuckResolveData(original);

    expect(cloned).not.toBe(original);
    expect(cloned.props.parentStyles).not.toBe(original.props.parentStyles);
    expect(cloned.props.parentStyles.classNameFn).toBe(classNameFn);
  });

  it("preserves shared and circular references", () => {
    const shared = { value: "shared" };
    const original: {
      first: typeof shared;
      second: typeof shared;
      self?: unknown;
    } = {
      first: shared,
      second: shared,
    };
    original.self = original;

    const cloned = clonePuckResolveData(original);

    expect(cloned).not.toBe(original);
    expect(cloned.first).toBe(cloned.second);
    expect(cloned.self).toBe(cloned);
    expect(cloned.first).not.toBe(shared);
  });
});
