import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { toMeters } from "../../../utils/i18n/distance.ts";
import { useLocatorRadiusOnUnitChange } from "./useLocatorRadius.ts";

describe("Locator radius after a unit change", () => {
  it.each([
    {
      name: "updates a generated base radius and reruns an unselected search",
      generatedRadiusMinimum: 0,
      baseRadius: toMeters(25, "mile"),
      selectedDistanceOption: null,
      expectedBaseRadius: 25_000,
      expectedSearchRadius: 25_000,
    },
    {
      name: "updates the saved base radius beneath a distance selection",
      generatedRadiusMinimum: 0,
      baseRadius: toMeters(25, "mile"),
      selectedDistanceOption: 5,
      expectedBaseRadius: 25_000,
      expectedSearchRadius: 5_000,
    },
    {
      name: "preserves a coordinate-query or provider radius",
      generatedRadiusMinimum: null,
      baseRadius: 40_233,
      selectedDistanceOption: null,
      expectedBaseRadius: 40_233,
      expectedSearchRadius: null,
    },
    {
      name: "preserves a provider radius beneath a distance selection",
      generatedRadiusMinimum: null,
      baseRadius: 40_233,
      selectedDistanceOption: 5,
      expectedBaseRadius: 40_233,
      expectedSearchRadius: 5_000,
    },
    {
      name: "waits for an initial generated radius to be saved",
      generatedRadiusMinimum: 0,
      baseRadius: null,
      selectedDistanceOption: null,
      expectedBaseRadius: null,
      expectedSearchRadius: null,
    },
    {
      name: "retains geolocation accuracy when it exceeds the new default",
      generatedRadiusMinimum: 30_000,
      baseRadius: toMeters(25, "mile"),
      selectedDistanceOption: null,
      expectedBaseRadius: 30_000,
      expectedSearchRadius: 30_000,
    },
    {
      name: "does not rerun when a geolocation minimum already dominates",
      generatedRadiusMinimum: 50_000,
      baseRadius: 50_000,
      selectedDistanceOption: null,
      expectedBaseRadius: 50_000,
      expectedSearchRadius: null,
    },
  ])("$name", (testCase) => {
    const apiFilterRadius: React.MutableRefObject<number | null> = {
      current: testCase.baseRadius,
    };
    const generatedRadiusMinimum = {
      current: testCase.generatedRadiusMinimum,
    };
    const onRadiusChange = vi.fn();
    const { rerender } = renderHook(
      ({ preferredUnit }: { preferredUnit: "mile" | "kilometer" }) =>
        useLocatorRadiusOnUnitChange({
          preferredUnit,
          selectedDistanceOption: testCase.selectedDistanceOption,
          defaultRadius: 25,
          apiFilterRadius,
          generatedRadiusMinimum,
          onRadiusChange,
        }),
      {
        initialProps: {
          preferredUnit: "mile" as "mile" | "kilometer",
        },
      }
    );

    rerender({ preferredUnit: "kilometer" });

    expect(apiFilterRadius.current).toBe(testCase.expectedBaseRadius);
    if (testCase.expectedSearchRadius === null) {
      expect(onRadiusChange).not.toHaveBeenCalled();
    } else {
      expect(onRadiusChange).toHaveBeenCalledExactlyOnceWith(
        testCase.expectedSearchRadius
      );
    }
  });
});
