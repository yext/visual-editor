import { afterEach, describe, expect, it, vi } from "vitest";
import { getLocalDevLayoutData } from "./useMessageReceivers.ts";
import { Config } from "@puckeditor/core";
import React from "react";

const testConfig: Config<{
  Locator: {
    mapStyle: string;
  };
}> = {
  components: {
    Locator: {
      render: () => React.createElement("div"),
    },
  },
};

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
    const data = getLocalDevLayoutData(testConfig, {
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

    const data = getLocalDevLayoutData(testConfig, {
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

  it("applies section-library migrations to initial local editor data", () => {
    const data = getLocalDevLayoutData(
      testConfig,
      {},
      {
        root: { props: { version: 82 } },
        content: [],
        zones: {},
      },
      [
        {
          root: {
            propTransformation: (props: Record<string, any>) => ({
              ...props,
              migrated: true,
            }),
          },
        },
      ]
    );

    expect(data.root.props).toMatchObject({
      migrated: true,
      sectionLibraryMigrationVersion: 1,
    });
  });
});
