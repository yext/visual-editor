import React from "react";
import { render, screen } from "@testing-library/react";
import mapboxgl from "mapbox-gl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocatorMap } from "./Map.tsx";

vi.mock("mapbox-gl", () => ({
  default: { supported: vi.fn() },
}));

vi.mock("@yext/search-ui-react", () => ({
  MapboxMap: () => <div data-testid="mapbox-map" />,
}));

vi.mock("../../hooks/useDocument.tsx", () => ({
  useDocument: () => ({ _env: { YEXT_MAPBOX_API_KEY: "test-key" } }),
}));

vi.mock("../testing/utils.ts", () => ({
  isVisualEditorTestEnv: () => false,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("LocatorMap", () => {
  it.each([
    {
      name: "shows a fallback when WebGL is unavailable",
      webglSupported: false,
      mapVisible: false,
      fallbackVisible: true,
    },
    {
      name: "renders Mapbox when WebGL is available",
      webglSupported: true,
      mapVisible: true,
      fallbackVisible: false,
    },
  ])("$name", ({ webglSupported, mapVisible, fallbackVisible }) => {
    const mapboxSupport = mapboxgl as unknown as {
      supported: ReturnType<typeof vi.fn>;
    };
    mapboxSupport.supported.mockReturnValue(webglSupported);

    render(<LocatorMap />);

    expect(Boolean(screen.queryByTestId("mapbox-map"))).toBe(mapVisible);
    expect(Boolean(screen.queryByText(/WebGL is unavailable/))).toBe(
      fallbackVisible
    );
  });
});
