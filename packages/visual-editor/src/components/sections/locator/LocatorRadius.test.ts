import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Matcher,
  type NearFilterValue,
  type SelectableStaticFilter,
} from "@yext/search-headless-react";
import { getUserLocation, type FilterSearch } from "@yext/search-ui-react";
import type { FilterModal } from "./Filters.tsx";
import type { LocatorMap } from "./Map.tsx";
import type { LocatorProps } from "./Locator.tsx";
import { LocatorWrapper } from "./LocatorWrapper.tsx";

const mocks = vi.hoisted(() => ({
  locale: "en",
  state: {
    vertical: { results: [], resultsCount: 0, offset: 0 },
    filters: { static: [] as SelectableStaticFilter[], facets: [] },
    searchStatus: { isLoading: false },
  },
  filterSearch: {} as React.ComponentProps<typeof FilterSearch>,
  filterModal: {} as React.ComponentProps<typeof FilterModal>,
  map: {} as React.ComponentProps<typeof LocatorMap>,
  actions: {
    setSessionTrackingEnabled: vi.fn(),
    setFacetAllowList: vi.fn(),
    setOffset: vi.fn(),
    setVerticalLimit: vi.fn(),
    setStaticFilters: vi.fn(),
    setFilterOption: vi.fn(),
    executeVerticalQuery: vi.fn(),
    executeFilterSearch: vi.fn(),
    resetFacets: vi.fn(),
  },
}));

vi.mock("@yext/search-headless-react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@yext/search-headless-react")>()),
  provideHeadless: () => mocks.actions,
  SearchHeadlessProvider: ({ children }: React.PropsWithChildren) => children,
  useSearchActions: () => mocks.actions,
  useSearchState: (selector: (state: typeof mocks.state) => unknown) =>
    selector(mocks.state),
}));
vi.mock("@yext/search-ui-react", () => ({
  AnalyticsProvider: ({ children }: React.PropsWithChildren) => children,
  SearchI18nextProvider: ({ children }: React.PropsWithChildren) => children,
  useAnalytics: () => undefined,
  AppliedFilters: () => null,
  Pagination: () => null,
  VerticalResults: () => null,
  FilterSearch: (props: typeof mocks.filterSearch) => {
    mocks.filterSearch = props;
    return null;
  },
  getUserLocation: vi
    .fn()
    .mockRejectedValue(new Error("Geolocation unavailable")),
  executeSearch: () => mocks.actions.executeVerticalQuery(),
}));
vi.mock("@yext/pages-components", () => ({ useAnalytics: () => undefined }));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
    i18n: { language: mocks.locale },
  }),
}));
vi.mock("../../../hooks/useDocument.tsx", () => ({
  useDocument: () => ({ id: "locator", locale: mocks.locale }),
}));
vi.mock("../../../hooks/useViewport.ts", () => ({
  getViewport: () => ({ isMobile: false }),
  useWindowWidth: () => 1024,
}));
vi.mock("../../../utils/searchHeadlessConfig.ts", () => ({
  createSearchHeadlessConfig: () => ({}),
  createSearchAnalyticsConfig: () => ({}),
}));
vi.mock("./Map.tsx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./Map.tsx")>()),
  LocatorMap: (props: typeof mocks.map) => {
    mocks.map = props;
    return null;
  },
  LoadingMapPlaceholder: () => null,
}));
vi.mock("./Filters.tsx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./Filters.tsx")>()),
  FilterModal: (props: typeof mocks.filterModal) => {
    mocks.filterModal = props;
    return null;
  },
}));
vi.mock("./Results.tsx", () => ({
  RESULTS_LIMIT: 20,
  MobileLocatorResultsSection: () => null,
  ResultsCountSummary: () => null,
}));
vi.mock("./LocatorResultCard.tsx", () => ({
  DEFAULT_LOCATOR_RESULT_CARD_PROPS: {},
  LocatorResultCard: () => null,
}));

const suggestedValue = { lat: 38.9, lng: -77.1, radius: 12000 };
const getLocationFilter = () =>
  mocks.state.filters.static.find(
    ({ filter }) =>
      filter.kind === "fieldValue" && filter.fieldId === "builtin.location"
  )?.filter;
const getRadius = () =>
  (getLocationFilter() as { value: NearFilterValue } | undefined)?.value.radius;
const renderLocator = (radius?: LocatorProps["defaultSearchRadius"]) =>
  render(
    React.createElement(LocatorWrapper, {
      locationStyles: [],
      resultCard: [],
      filters: { openNowButton: false, showDistanceOptions: true },
      defaultSearchRadius: radius,
      puck: {
        metadata: {},
        isEditing: false,
        dragRef: null,
        renderDropZone: () => null,
      },
    })
  );
const selectSuggestion = async () =>
  act(async () => {
    mocks.filterSearch.onSelect?.({
      currentFilter: undefined,
      setCurrentFilter: vi.fn(),
      executeFilterSearch: mocks.actions.executeFilterSearch,
      newFilter: {
        kind: "fieldValue",
        fieldId: "builtin.location",
        matcher: Matcher.Near,
        value: suggestedValue,
      },
      newDisplayName: "Arlington",
    });
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getUserLocation).mockRejectedValue(
    new Error("Geolocation unavailable")
  );
  mocks.locale = "en";
  mocks.state.filters = { static: [], facets: [] };
  window.history.replaceState(null, "", "/");
  mocks.actions.setStaticFilters.mockImplementation(
    (filters: SelectableStaticFilter[]) => {
      mocks.state.filters = { ...mocks.state.filters, static: filters };
    }
  );
  mocks.actions.executeFilterSearch.mockResolvedValue({
    sections: [
      {
        results: [
          {
            value: "Arlington",
            filter: {
              kind: "fieldValue",
              fieldId: "builtin.location",
              matcher: Matcher.Near,
              value: suggestedValue,
            },
          },
        ],
      },
    ],
  });
});
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("Locator default search radius", () => {
  it.each<{
    name: string;
    query: string;
    radius?: LocatorProps["defaultSearchRadius"];
    locale?: string;
    expected: number;
  }>([
    {
      name: "uses Search's suggested radius when automatic",
      query: "?q=Arlington",
      expected: 12000,
    },
    {
      name: "overrides named searches in miles",
      query: "?q=Arlington",
      radius: { value: 50, unit: "mile" },
      expected: 80467.2,
    },
    {
      name: "overrides legacy initialLocation searches in kilometers",
      query: "?initialLocation=Arlington",
      radius: { value: 60, unit: "kilometer" },
      expected: 60000,
    },
    {
      name: "uses the configured radius for initial coordinates",
      query: "",
      radius: { value: 50, unit: "kilometer" },
      expected: 50000,
    },
    {
      name: "uses 25 miles for automatic English coordinates",
      query: "",
      expected: 40233.6,
    },
    {
      name: "uses 25 kilometers for automatic French coordinates",
      query: "",
      locale: "fr",
      expected: 25000,
    },
    {
      name: "converts configured miles independently of locale",
      query: "?q=Arlington",
      locale: "fr",
      radius: { value: 50, unit: "mile" },
      expected: 80467.2,
    },
    {
      name: "preserves explicit URL areas",
      query: "?q=38.9,-77.1,9000",
      radius: { value: 50, unit: "mile" },
      expected: 9000,
    },
    {
      name: "treats cleared values as automatic",
      query: "?q=Arlington",
      radius: { unit: "mile" },
      expected: 12000,
    },
    {
      name: "treats zero as automatic",
      query: "?q=Arlington",
      radius: { value: 0, unit: "mile" },
      expected: 12000,
    },
    {
      name: "uses the locale fallback for zero coordinate radius",
      query: "",
      radius: { value: 0, unit: "kilometer" },
      expected: 40233.6,
    },
  ])("$name", async ({ query, radius, locale = "en", expected }) => {
    mocks.locale = locale;
    window.history.replaceState(null, "", `/${query}`);
    renderLocator(radius);
    await waitFor(() => expect(getRadius()).toBeCloseTo(expected));
    expect(mocks.filterSearch.geolocationProps?.radius).toBeCloseTo(
      radius?.value
        ? radius.value * (radius.unit === "mile" ? 1 : 1 / 1.609344)
        : locale === "en"
          ? 25
          : 25 / 1.609344
    );
  });

  it("uses the configured radius for suggestions and restores it after distance overrides", async () => {
    renderLocator({ value: 50, unit: "mile" });
    await waitFor(() => expect(getRadius()).toBeCloseTo(80467.2));
    await selectSuggestion();
    expect(getRadius()).toBeCloseTo(80467.2);
    await act(async () => mocks.filterModal.handleDistanceClick(5, "mile"));
    expect(getRadius()).toBeCloseTo(8046.72);
    await selectSuggestion();
    expect(getRadius()).toBeCloseTo(8046.72);
    await act(async () => mocks.filterModal.handleDistanceClick(5, "mile"));
    expect(getRadius()).toBeCloseTo(80467.2);
    await act(async () => mocks.filterModal.handleDistanceClick(5, "mile"));
    await act(async () => mocks.filterModal.handleClearFiltersClick());
    expect(getRadius()).toBeCloseTo(80467.2);
  });

  it.each(["builtin.region", "address.countryCode"])(
    "preserves %s boundary filters",
    async (fieldId) => {
      const filter = {
        kind: "fieldValue" as const,
        fieldId,
        matcher: Matcher.Equals,
        value: "VA",
      };
      mocks.actions.executeFilterSearch.mockResolvedValue({
        sections: [{ results: [{ value: "Virginia", filter }] }],
      });
      window.history.replaceState(null, "", "/?q=Virginia");
      renderLocator({ value: 50, unit: "mile" });
      await waitFor(() =>
        expect(mocks.actions.executeVerticalQuery).toHaveBeenCalled()
      );
      expect(mocks.state.filters.static[0].filter).toEqual(filter);
      await act(async () =>
        mocks.filterSearch.onSelect?.({
          currentFilter: undefined,
          setCurrentFilter: vi.fn(),
          executeFilterSearch: mocks.actions.executeFilterSearch,
          newFilter: filter,
          newDisplayName: "Virginia",
        })
      );
      expect(mocks.state.filters.static[0].filter).toEqual(filter);
    }
  );

  it.each<{
    radius?: LocatorProps["defaultSearchRadius"];
    locale: string;
    accuracy: number;
    expected: number;
  }>([
    {
      radius: { value: 50, unit: "kilometer" },
      locale: "en",
      accuracy: 10,
      expected: 50000,
    },
    {
      radius: { value: 50, unit: "kilometer" },
      locale: "en",
      accuracy: 100000,
      expected: 100000,
    },
    {
      radius: { value: 50, unit: "mile" },
      locale: "en",
      accuracy: 100000,
      expected: 100000,
    },
    { locale: "en", accuracy: 100000, expected: 100000 },
    { locale: "fr", accuracy: 10, expected: 25000 },
    { locale: "fr", accuracy: 100000, expected: 100000 },
  ])(
    "respects initial geolocation accuracy $accuracy with radius $radius in $locale",
    async ({ radius, locale, accuracy, expected }) => {
      mocks.locale = locale;
      vi.mocked(getUserLocation).mockResolvedValue({
        coords: { latitude: 38.9, longitude: -77.1, accuracy },
      } as GeolocationPosition);
      renderLocator(radius);
      await waitFor(() => expect(getRadius()).toBeCloseTo(expected));
      await act(async () =>
        mocks.filterModal.handleDistanceClick(
          5,
          locale === "en" ? "mile" : "kilometer"
        )
      );
      await act(async () => mocks.filterModal.handleClearFiltersClick());
      expect(getRadius()).toBeCloseTo(expected);
    }
  );

  it.each([10, 10000])(
    "preserves the selected distance and configured base with initial accuracy %s",
    async (accuracy) => {
      renderLocator({ value: 50, unit: "kilometer" });
      await waitFor(() => expect(getRadius()).toBe(50000));
      await act(async () => mocks.filterModal.handleDistanceClick(5, "mile"));
      vi.mocked(getUserLocation).mockResolvedValue({
        coords: { latitude: 38.9, longitude: -77.1, accuracy },
      } as GeolocationPosition);
      await act(async () =>
        window.dispatchEvent(new PopStateEvent("popstate"))
      );
      await waitFor(() =>
        expect(getRadius()).toBeCloseTo(Math.max(accuracy, 8046.72))
      );
      await act(async () => mocks.filterModal.handleClearFiltersClick());
      expect(getRadius()).toBe(50000);
    }
  );

  it.each([10, 100000])(
    "respects current-location accuracy of %s meters and restores the base radius",
    async (accuracy) => {
      renderLocator({ value: 50, unit: "kilometer" });
      await waitFor(() => expect(getRadius()).toBe(50000));
      await act(async () => mocks.filterModal.handleDistanceClick(5, "mile"));
      await act(async () =>
        mocks.filterSearch.geolocationProps?.handleClick?.({
          coords: { latitude: 38.9, longitude: -77.1, accuracy },
        } as GeolocationPosition)
      );
      expect(getRadius()).toBeCloseTo(Math.max(accuracy, 8046.72));
      await act(async () => mocks.filterModal.handleClearFiltersClick());
      expect(getRadius()).toBe(Math.max(accuracy, 50000));
    }
  );

  it("preserves a map search area and clears the previous distance selection", async () => {
    renderLocator({ value: 50, unit: "mile" });
    await waitFor(() => expect(getRadius()).toBeCloseTo(80467.2));
    await act(async () => mocks.filterModal.handleDistanceClick(5, "mile"));
    await act(async () =>
      mocks.map.onDragHandler?.(
        { latitude: 38.9, longitude: -77.1, distanceTo: () => 9000 } as any,
        { getNorthEast: () => ({}) } as any
      )
    );
    await act(async () =>
      screen.getByRole("button", { name: "Search This Area" }).click()
    );
    expect(getRadius()).toBe(9000);
    expect(mocks.filterModal.selectedDistanceOption).toBeNull();
    await act(async () => mocks.filterModal.handleDistanceClick(5, "mile"));
    await act(async () => mocks.filterModal.handleClearFiltersClick());
    expect(getRadius()).toBe(9000);
  });
});
