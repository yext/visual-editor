import { describe, it, assert } from "vitest";
import { getDirectoryParents, removeEmptyValues } from "./helpers";

describe("getDirectoryParents", () => {
  it("returns directory parents when a valid directory parents field exists", () => {
    const streamDocument = {
      dm_directoryParents_abcdef: [
        { slug: "parent-1", name: "Parent 1" },
        { slug: "parent-2", name: "Parent 2" },
      ],
    };
    const result = getDirectoryParents(streamDocument);
    assert.deepEqual(result, [
      { slug: "parent-1", name: "Parent 1" },
      { slug: "parent-2", name: "Parent 2" },
    ]);
  });

  it("returns the first directory parents field if multiple exist", () => {
    const streamDocument = {
      dm_directoryParents_abcdef1: [
        { slug: "parent-1", name: "Parent 1" },
        { slug: "parent-2", name: "Parent 2" },
      ],
      dm_directoryParents_abcdef2: [
        { slug: "parent-3", name: "Parent 3" },
        { slug: "parent-4", name: "Parent 4" },
      ],
    };
    const result = getDirectoryParents(streamDocument);
    assert.deepEqual(result, [
      { slug: "parent-1", name: "Parent 1" },
      { slug: "parent-2", name: "Parent 2" },
    ]);
  });

  it("returns empty array when no directory parents key exists", () => {
    const streamDocument = {
      some_other_key: [],
    };
    const result = getDirectoryParents(streamDocument);
    assert.deepEqual(result, []);
  });

  it("returns empty array when the directory parents key is not the valid shape", () => {
    const streamDocument = {
      dm_directoryParents_abcdef: "invalid shape",
    };
    const result = getDirectoryParents(streamDocument);
    assert.deepEqual(result, []);
  });
});

describe("removeEmptyValues", () => {
  it("removes keys with empty values from an object", () => {
    const obj = {
      a: "value",
      b: undefined,
      c: null,
      d: "",
      e: [],
      f: {},
      g: { "@type": "Thing" },
      h: { nested: "value", empty: "" },
      i: { nestedEmpty: {} },
      j: { "@type": "Thing", empty: "" },
      k: { nested: { nested: { nested: 1 } } },
      l: [1, 2, 3],
      m: 0,
      n: false,
    };

    const result = removeEmptyValues(obj);

    assert.deepEqual(result, {
      a: "value",
      h: { nested: "value" },
      k: { nested: { nested: { nested: 1 } } },
      l: [1, 2, 3],
      m: 0,
      n: false,
    });
  });
});
