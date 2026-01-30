import { describe, it, expect } from "vitest";
import { isDeepEqual } from "./deepEqual.ts"; // Import the function

describe("isDeepEqual", () => {
  // --- Primitives Tests ---
  it("should return true for equal primitives (numbers, strings, booleans)", () => {
    expect(isDeepEqual(1, 1)).toBe(true);
    expect(isDeepEqual("hello", "hello")).toBe(true);
    expect(isDeepEqual(true, true)).toBe(true);
  });

  it("should return false for unequal primitives", () => {
    expect(isDeepEqual(1, 2)).toBe(false);
    expect(isDeepEqual("hello", "world")).toBe(false);
    expect(isDeepEqual(true, false)).toBe(false);
  });

  it("should return true for null and undefined equality", () => {
    expect(isDeepEqual(null, null)).toBe(true);
    expect(isDeepEqual(undefined, undefined)).toBe(true);
  });

  it("should return false for null and undefined inequality", () => {
    expect(isDeepEqual(null, undefined)).toBe(false);
    expect(isDeepEqual(1, null)).toBe(false);
    expect(isDeepEqual(0, undefined)).toBe(false);
  });

  it("should return false when comparing different primitive types", () => {
    expect(isDeepEqual(1, "1")).toBe(false);
    expect(isDeepEqual(0, false)).toBe(false);
  });

  // --- Object Tests ---
  it("should return true for equal simple objects", () => {
    const obj1 = { a: 1, b: "two" };
    const obj2 = { a: 1, b: "two" };
    expect(isDeepEqual(obj1, obj2)).toBe(true);
  });

  it("should return false for unequal simple objects (different value)", () => {
    const obj1 = { a: 1, b: "two" };
    const obj2 = { a: 1, b: "three" };
    expect(isDeepEqual(obj1, obj2)).toBe(false);
  });

  it("should return false for unequal simple objects (different key count)", () => {
    const obj1 = { a: 1, b: "two" };
    const obj2 = { a: 1 };
    expect(isDeepEqual(obj1, obj2)).toBe(false);
  });

  it("should return true for equal deep objects", () => {
    const obj1 = { x: 1, y: { z: [10, { p: "q" }] } };
    const obj2 = { x: 1, y: { z: [10, { p: "q" }] } };
    expect(isDeepEqual(obj1, obj2)).toBe(true);
  });

  it("should return false for unequal deep objects", () => {
    const obj1 = { x: 1, y: { z: [10, { p: "q" }] } };
    const obj2 = { x: 1, y: { z: [10, { p: "r" }] } };
    expect(isDeepEqual(obj1, obj2)).toBe(false);
  });

  it("should return true regardless of key order", () => {
    // Key order should not affect equality for plain objects
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };
    expect(isDeepEqual(obj1, obj2)).toBe(true);
  });

  // --- Array Tests ---
  it("should return true for equal arrays", () => {
    const arr1 = [1, "b", true];
    const arr2 = [1, "b", true];
    expect(isDeepEqual(arr1, arr2)).toBe(true);
  });

  it("should return false for unequal arrays (different values)", () => {
    const arr1 = [1, 2];
    const arr2 = [1, 3];
    expect(isDeepEqual(arr1, arr2)).toBe(false);
  });

  it("should return false for unequal arrays (different length)", () => {
    const arr1 = [1, 2];
    const arr2 = [1, 2, 3];
    expect(isDeepEqual(arr1, arr2)).toBe(false);
  });

  it("should return true for equal deep arrays", () => {
    const arr1 = [{ id: 1 }, [2, { key: "value" }]];
    const arr2 = [{ id: 1 }, [2, { key: "value" }]];
    expect(isDeepEqual(arr1, arr2)).toBe(true);
  });

  it("should return false for arrays with nested difference", () => {
    const arr1 = [{ id: 1 }, [2, { key: "value" }]];
    const arr2 = [{ id: 1 }, [2, { key: "VALUE" }]]; // Difference here
    expect(isDeepEqual(arr1, arr2)).toBe(false);
  });

  // --- Mixed Type Tests ---
  it("should return false when comparing array to object", () => {
    expect(isDeepEqual([], {})).toBe(false);
    expect(isDeepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
  });

  it("should return false when comparing object to primitive", () => {
    expect(isDeepEqual({ a: 1 }, 1)).toBe(false);
  });
});
