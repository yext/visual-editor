import { afterEach, describe, expect, it, vi } from "vitest";
import { locatorConfig } from "../../components/configs/locatorConfig.tsx";
import { getLocalDevLayoutData } from "./useMessageReceivers.ts";

const localDevLocatorLayout = JSON.stringify({
  root: {
    props: {
      version: 73,
    },
  },
  content: [
    {
      type: "MainContent",
      props: {
        id: "MainContent-test",
        content: [
          {
            type: "Locator",
            props: {
              id: "Locator-test",
              mapStyle: "mapbox://styles/mapbox/streets-v12",
              filters: {
                openNowButton: false,
                showDistanceOptions: false,
              },
              locationStyles: [],
              resultCard: [],
              distanceDisplay: "distanceFromUser",
            },
          },
        ],
      },
    },
  ],
  zones: {},
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getLocalDevLayoutData", () => {
  it("bootstraps local dev from document.__.layout when present", () => {
    const data = getLocalDevLayoutData(locatorConfig, {
      meta: {
        entityType: {
          id: "locator",
        },
      },
      __: {
        layout: localDevLocatorLayout,
      },
    });

    expect(data.content[0]).toMatchObject({
      type: "MainContent",
    });
    expect((data.content[0] as any).props.content[0]).toMatchObject({
      type: "Locator",
      props: {
        id: "Locator-test",
        mapStyle: "mapbox://styles/mapbox/streets-v12",
      },
    });
  });

  it("falls back to an empty layout when local dev layout JSON is invalid", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const data = getLocalDevLayoutData(locatorConfig, {
      __: {
        layout: "{not-valid-json}",
      },
    });

    expect(data.content[0]).toMatchObject({
      type: "MainContent",
      props: {
        content: [],
      },
    });
    expect(warnSpy).toHaveBeenCalledOnce();
  });
});
