import { describe, it, expect } from "vitest";
import {
  distanceUnitOptions,
  type DistanceUnitSelection,
  fromMeters,
  getCoordinateDistance,
  getCoordinateDistanceInMeters,
  resolveDistanceUnit,
  toMeters,
} from "./distance.ts";

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

  it("calculates the distance between two coordinates in meters", () => {
    expect(
      getCoordinateDistanceInMeters(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 }
      )
    ).toBeCloseTo(111319.49, -2);
  });

  it("calculates the distance between two coordinates in miles", () => {
    expect(
      getCoordinateDistance(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
        { unit: "mile" }
      )
    ).toBeCloseTo(69.17, 2);
  });

  it("returns undefined when a coordinate is incomplete", () => {
    expect(
      getCoordinateDistanceInMeters(
        { latitude: 0, longitude: 0 },
        { latitude: 0 }
      )
    ).toBeUndefined();
  });

  it("resolves the locale-specific selection using the locale's unit", () => {
    expect(resolveDistanceUnit("locale", "en")).toBe("mile");
    expect(resolveDistanceUnit("locale", "de")).toBe("kilometer");
  });

  it("uses the locale's unit when no unit is provided", () => {
    expect(resolveDistanceUnit(undefined, "en")).toBe("mile");
    expect(resolveDistanceUnit(undefined, "de")).toBe("kilometer");
  });

  it("respects explicit unit selections", () => {
    expect(resolveDistanceUnit("mile", "de")).toBe("mile");
    expect(resolveDistanceUnit("kilometer", "en")).toBe("kilometer");
  });

  it("calculates distance using the resolved locale-specific unit", () => {
    expect(
      getCoordinateDistance(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
        { locale: "de", unit: "locale" }
      )
    ).toBeCloseTo(111.32, 2);
  });

  it("exports the supported distance unit options", () => {
    expect(distanceUnitOptions.map((option) => option.value)).toEqual([
      "mile",
      "kilometer",
      "locale",
    ] satisfies DistanceUnitSelection[]);
  });
});
