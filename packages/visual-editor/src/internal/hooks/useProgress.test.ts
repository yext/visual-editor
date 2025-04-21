import { describe, it, expect } from "vitest";
import { useProgress } from "./useProgress.ts";
import { renderHook } from "@testing-library/react";

describe("useProgress", () => {
  it("should return 100% progress when all criteria are true", () => {
    const { result } = renderHook(() =>
      useProgress({ completionCriteria: [true, true, true] })
    );
    expect(result.current.progress).toBe(100);
    expect(result.current.isLoading).toBe(false);
  });

  it("should return 0% progress when all criteria are false", () => {
    const { result } = renderHook(() =>
      useProgress({ completionCriteria: [false, false, false] })
    );
    expect(result.current.progress).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });

  it("should use default minProgress (0) and maxProgress (100) when not provided", () => {
    const { result } = renderHook(() =>
      useProgress({ completionCriteria: [true, false, true] })
    );
    expect(result.current.progress).toBe(67);
    expect(result.current.isLoading).toBe(true);
  });

  it("should respect custom minProgress value", () => {
    const { result } = renderHook(() =>
      useProgress({ minProgress: 20, completionCriteria: [true, false, true] })
    );
    expect(result.current.progress).toBe(73);
    expect(result.current.isLoading).toBe(true);
  });

  it("should respect custom maxProgress value", () => {
    const { result } = renderHook(() =>
      useProgress({ maxProgress: 80, completionCriteria: [true, false, true] })
    );
    expect(result.current.progress).toBe(53);
    expect(result.current.isLoading).toBe(true);
  });

  it("should respect custom minProgress and maxProgress values", () => {
    const { result } = renderHook(() =>
      useProgress({
        minProgress: 20,
        maxProgress: 80,
        completionCriteria: [true, false, true],
      })
    );
    expect(result.current.progress).toBe(60);
    expect(result.current.isLoading).toBe(true);
  });
});
