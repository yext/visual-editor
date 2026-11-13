import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OnDragHandler, OnSelectParams } from "@yext/search-ui-react";
import type { State } from "@yext/search-headless-react";
import type { WithPuckProps } from "@puckeditor/core";
import type { StreamDocument } from "../../../utils/types/StreamDocument.ts";
import type { LocatorProps } from "./Locator.tsx";
import { LocatorWrapper } from "./LocatorWrapper.tsx";

const mocks = vi.hoisted(() => ({
  streamDocument: { id: "locator", locale: "en" } as StreamDocument,
  onDrag: undefined as OnDragHandler | undefined,
  onSelect: undefined as ((params: OnSelectParams) => void) | undefined,
  onOpenNow: undefined as ((selected: boolean) => void) | undefined,
  onCurrentLocation: undefined as
    ((position: GeolocationPosition) => void) | undefined,
  actions: {
    setSessionTrackingEnabled: vi.fn(),
    setFacetAllowList: vi.fn(),
    setVerticalLimit: vi.fn(),
    setOffset: vi.fn(),
    setStaticFilters: vi.fn(),
    setFilterOption: vi.fn(),
    executeVerticalQuery: vi.fn(),
  },
  state: {
    vertical: { results: [], resultsCount: 0, offset: 0 },
    filters: { static: [], facets: [] },
    searchStatus: { isLoading: false },
  },
}));

vi.mock("../../../hooks/useDocument.tsx", () => ({
  useDocument: (): StreamDocument => mocks.streamDocument,
}));
vi.mock("../../../utils/searchHeadlessConfig.ts", () => ({
  createSearchHeadlessConfig: () => ({}),
  createSearchAnalyticsConfig: () => ({}),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({
    t: (_key: string, fallback: string): string => fallback,
    i18n: { language: "en" },
  }),
}));
vi.mock("@yext/pages-components", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@yext/pages-components")>()),
  useAnalytics: () => undefined,
}));
vi.mock("@yext/search-headless-react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@yext/search-headless-react")>()),
  provideHeadless: () => mocks.actions,
  useSearchActions: () => mocks.actions,
  useSearchState: (selector: (state: State) => unknown): unknown =>
    selector(mocks.state as unknown as State),
  SearchHeadlessProvider: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock("@yext/search-ui-react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@yext/search-ui-react")>()),
  AnalyticsProvider: ({ children }: React.PropsWithChildren) => children,
  SearchI18nextProvider: ({ children }: React.PropsWithChildren) => children,
  useAnalytics: () => undefined,
  executeSearch: (): void => {
    mocks.actions.executeVerticalQuery();
  },
  AppliedFilters: () => null,
  FilterSearch: (props: {
    onSelect: typeof mocks.onSelect;
    geolocationProps: { handleClick: typeof mocks.onCurrentLocation };
  }) => {
    mocks.onSelect = props.onSelect;
    mocks.onCurrentLocation = props.geolocationProps.handleClick;
    return null;
  },
}));
vi.mock("./Map.tsx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./Map.tsx")>()),
  LocatorMap: ({ onDragHandler }: { onDragHandler: OnDragHandler }) => {
    mocks.onDrag = onDragHandler;
    return null;
  },
}));
vi.mock("./Filters.tsx", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./Filters.tsx")>()),
  FilterModal: ({
    handleOpenNowClick,
  }: {
    handleOpenNowClick: (selected: boolean) => void;
  }) => {
    mocks.onOpenNow = handleOpenNowClick;
    return null;
  },
}));
vi.mock("./Results.tsx", () => ({
  RESULTS_LIMIT: 20,
  ResultsCountSummary: () => null,
}));

/** Send the map callback with a center and a radius in meters. */
const moveMap = (latitude: number, radius: number): void => {
  act((): void => {
    mocks.onDrag?.(
      {
        latitude,
        longitude: -74,
        distanceTo: (): number => radius,
      } as unknown as Parameters<OnDragHandler>[0],
      {
        getNorthEast: () => ({ latitude: latitude + 1, longitude: -73 }),
      } as Parameters<OnDragHandler>[1]
    );
  });
};

describe("Locator map search", () => {
  beforeEach((): void => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.streamDocument.__ = undefined;
    mocks.onDrag = undefined;
    window.history.replaceState({}, "", "/?q=40,-74,10000&ref=test");
  });
  afterEach((): void => {
    cleanup();
    vi.useRealTimers();
  });

  it.each([undefined, false, true])(
    "when autoSearchOnMapMove is %s then map search uses the selected mode",
    (autoSearchOnMapMove): void => {
      render(
        React.createElement(LocatorWrapper, {
          autoSearchOnMapMove,
          filters: { openNowButton: false, showDistanceOptions: false },
          resultCard: [],
          locationStyles: [],
          puck: {
            metadata: {},
            isEditing: false,
            dragRef: null,
            renderDropZone: () => null,
          },
        } as WithPuckProps<LocatorProps>)
      );
      expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(1);
      act((): void => {
        vi.advanceTimersByTime(1000);
      });
      expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(1);
      moveMap(41, 5000);
      act((): void => {
        vi.advanceTimersByTime(400);
      });
      moveMap(42, 2000);
      act((): void => {
        vi.advanceTimersByTime(499);
      });
      expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(1);
      act((): void => {
        vi.advanceTimersByTime(1);
      });
      if (!autoSearchOnMapMove) {
        expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(1);
        fireEvent.click(
          screen.getByRole("button", { name: "Search This Area" })
        );
      } else {
        expect(
          screen.queryByRole("button", { name: "Search This Area" })
        ).toBeNull();
      }
      expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(2);
      expect(mocks.actions.setOffset).toHaveBeenLastCalledWith(0);
      expect(mocks.actions.setStaticFilters).toHaveBeenLastCalledWith([
        expect.objectContaining({
          filter: expect.objectContaining({
            value: {
              lat: 42,
              lng: -74,
              radius: 2000,
              name: "Custom Search Area",
            },
          }),
        }),
        expect.objectContaining({ selected: false }),
      ]);
      expect(new URLSearchParams(window.location.search).get("q")).toBe(
        "42,-74,2000"
      );
      expect(new URLSearchParams(window.location.search).get("ref")).toBe(
        "test"
      );
      act((): void => {
        vi.advanceTimersByTime(1000);
      });
      expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(2);
    }
  );

  it.each([
    "disable",
    "disableMap",
    "unmount",
    "navigate",
    "select",
    "geolocate",
  ])(
    "when %s occurs then the pending map search is canceled",
    (action): void => {
      const props = {
        autoSearchOnMapMove: true,
        filters: { openNowButton: false, showDistanceOptions: false },
        resultCard: [],
        locationStyles: [],
        puck: {
          metadata: {},
          isEditing: false,
          dragRef: null,
          renderDropZone: () => null,
        },
      } as WithPuckProps<LocatorProps>;
      const { rerender, unmount } = render(
        React.createElement(LocatorWrapper, props)
      );
      moveMap(41, 5000);
      act((): void => {
        vi.advanceTimersByTime(400);
      });
      act((): void => {
        if (action === "disable") {
          rerender(
            React.createElement(LocatorWrapper, {
              ...props,
              autoSearchOnMapMove: false,
            })
          );
        } else if (action === "disableMap") {
          (window as unknown as { disableMap: () => void }).disableMap();
        } else if (action === "unmount") {
          unmount();
        } else if (action === "navigate") {
          window.history.replaceState({}, "", "/?q=39,-73,3000");
          window.dispatchEvent(new PopStateEvent("popstate"));
        } else if (action === "select") {
          mocks.onSelect?.({
            newDisplayName: "Boston",
            newFilter: {
              kind: "fieldValue",
              fieldId: "builtin.location",
              matcher: "$near",
              value: { lat: 42, lng: -71, radius: 3000 },
            },
          } as OnSelectParams);
        } else {
          mocks.onCurrentLocation?.({
            coords: { latitude: 43, longitude: -72, accuracy: 100 },
          } as GeolocationPosition);
        }
      });
      const searchCount = mocks.actions.executeVerticalQuery.mock.calls.length;
      act((): void => {
        vi.advanceTimersByTime(1000);
      });
      expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(
        searchCount
      );
    }
  );

  it("when Open Now changes during the delay then map search uses the current filter", (): void => {
    render(
      React.createElement(LocatorWrapper, {
        autoSearchOnMapMove: true,
        filters: { openNowButton: true, showDistanceOptions: false },
        resultCard: [],
        locationStyles: [],
        puck: {
          metadata: {},
          isEditing: false,
          dragRef: null,
          renderDropZone: () => null,
        },
      } as WithPuckProps<LocatorProps>)
    );
    moveMap(41, 5000);
    act((): void => {
      vi.advanceTimersByTime(400);
    });
    act((): void => {
      mocks.onOpenNow?.(true);
    });
    expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(2);
    act((): void => {
      vi.advanceTimersByTime(100);
    });
    expect(mocks.actions.executeVerticalQuery).toHaveBeenCalledTimes(3);
    expect(mocks.actions.setStaticFilters).toHaveBeenLastCalledWith([
      expect.objectContaining({
        filter: expect.objectContaining({
          value: expect.objectContaining({ lat: 41, radius: 5000 }),
        }),
      }),
      expect.objectContaining({ selected: true }),
    ]);
  });
});
