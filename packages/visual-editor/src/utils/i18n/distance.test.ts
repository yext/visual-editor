import { describe, it, expect } from "vitest";
import { fromMeters, toMeters } from "./distance.ts";

describe("distance conversions", () => {
  it("converts miles to meters and back", () => {
    const meters = toMeters(1, "mile");
    expect(meters).toBeCloseTo(1609.344, 6);
    expect(fromMeters(meters, "mile")).toBeCloseTo(1, 6);
  });

  it("converts kilometers to meters and back", () => {
    const meters = toMeters(1, "kilometer");
    expect(meters).toBeCloseTo(1000, 6);
    expect(fromMeters(meters, "kilometer")).toBeCloseTo(1, 6);
  });

  it("round-trips arbitrary distances", () => {
    const miles = 12.5;
    const meters = toMeters(miles, "mile");
    expect(fromMeters(meters, "mile")).toBeCloseTo(miles, 6);
  });
});
