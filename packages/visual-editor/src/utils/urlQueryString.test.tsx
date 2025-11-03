import { describe, it, expect } from "vitest";
import {
  getValueFromQueryString,
  getRecordFromQueryString,
} from "./urlQueryString";

describe("getRecordFromQueryString", () => {
  it("returns empty object for empty string", () => {
    expect(getRecordFromQueryString("")).toEqual({});
  });

  it("returns empty object for just '?'", () => {
    expect(getRecordFromQueryString("?")).toEqual({});
  });

  it("parses single key/value", () => {
    expect(getRecordFromQueryString("?foo=bar")).toEqual({ foo: "bar" });
  });

  it("parses multiple key/value pairs", () => {
    // order preserved
    expect(getRecordFromQueryString("?a=1&b=two&c=3")).toEqual({
      a: "1",
      b: "two",
      c: "3",
    });
  });

  it("decodes percent-encoded characters", () => {
    expect(
      getRecordFromQueryString("?greeting=hello%20world&math=1%2B1%3D2")
    ).toEqual({
      greeting: "hello world",
      math: "1+1=2",
    });
  });

  it("treats '+' as space (URL query encoding quirk)", () => {
    expect(getRecordFromQueryString("?q=New+York+City")).toEqual({
      q: "New York City",
    });
  });

  it("keeps literal plus when percent-encoded", () => {
    expect(getRecordFromQueryString("?equation=2%2B2%3D4")).toEqual({
      equation: "2+2=4",
    });
  });

  it("includes empty string value when key has '=' but nothing after", () => {
    expect(getRecordFromQueryString("?empty=")).toEqual({ empty: "" });
  });

  it("ignores malformed pairs without '='", () => {
    expect(getRecordFromQueryString("?valid=1&malformed&also=2")).toEqual({
      valid: "1",
      also: "2",
    });
  });

  it("uses last occurrence of duplicate keys", () => {
    expect(getRecordFromQueryString("?x=1&x=2&x=3")).toEqual({ x: "3" });
  });
});

describe("getValueFromQueryString", () => {
  it("returns value when present", () => {
    expect(getValueFromQueryString("foo", "?foo=bar")).toBe("bar");
  });

  it("returns null when key missing", () => {
    expect(getValueFromQueryString("missing", "?foo=bar")).toBeNull();
  });

  it("decodes percent-encoded value", () => {
    expect(getValueFromQueryString("greeting", "?greeting=hello%20world")).toBe(
      "hello world"
    );
  });

  it("treats '+' as space", () => {
    expect(getValueFromQueryString("city", "?city=New+York")).toBe("New York");
  });

  it("returns empty string when key present with empty value", () => {
    expect(getValueFromQueryString("empty", "?empty=")).toBe("");
  });

  it("handles duplicate keys by returning last value", () => {
    expect(getValueFromQueryString("dup", "?dup=first&dup=second")).toBe(
      "second"
    );
  });
});
