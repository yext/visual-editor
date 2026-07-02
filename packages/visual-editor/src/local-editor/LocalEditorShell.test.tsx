import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { LocalEditorShell } from "./LocalEditorShell.tsx";

let mockDocumentResponse: {
  document: Record<string, unknown> | null;
  entityFields: {
    fields: [];
    displayNames: Record<string, string>;
  };
  diagnostics: string[];
};

vi.mock("../editor/Editor.tsx", () => ({
  Editor: ({ document }: { document: Record<string, unknown> }) => (
    <pre data-testid="editor-document">{JSON.stringify(document)}</pre>
  ),
}));

vi.mock("../utils/VisualEditorProvider.tsx", () => ({
  VisualEditorProvider: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

vi.mock("./useLocalEditorManifest.ts", () => ({
  useLocalEditorManifest: () => ({
    isManifestLoading: false,
    manifest: {
      templates: ["main"],
      entitiesByTemplate: {
        main: [
          {
            entityId: "entity-1",
            displayName: "Entity One",
            locales: ["en"],
          },
        ],
      },
      templateDefaults: {
        main: {
          entityId: "entity-1",
          locale: "en",
        },
      },
      defaults: {
        templateId: "main",
        entityId: "entity-1",
        locale: "en",
      },
      diagnostics: [],
      streamConfigPath: "stream.config.ts",
      localDataPath: "localData",
    },
    manifestError: null,
  }),
}));

vi.mock("./useLocalEditorDocument.ts", () => ({
  useLocalEditorDocument: () => ({
    documentError: null,
    documentResponse: mockDocumentResponse,
    isDocumentLoading: false,
  }),
}));

const renderShell = () => {
  return render(
    <LocalEditorShell
      apiBasePath="/api"
      routePath="/local-editor"
      componentRegistry={{ main: {} as never }}
      tailwindConfig={{} as never}
    />
  );
};

const getRenderedDocument = () => {
  return JSON.parse(screen.getByTestId("editor-document").textContent ?? "{}");
};

describe("LocalEditorShell", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/local-editor");
    mockDocumentResponse = {
      document: {
        id: "entity-1",
        name: "Entity One",
      },
      entityFields: {
        fields: [],
        displayNames: {},
      },
      diagnostics: [],
    };
  });

  it("shows reviews by default and lets the user hide them", async () => {
    renderShell();

    expect(
      screen.getByRole("button", { name: "Hide Reviews Data" })
    ).toBeDefined();
    expect(getRenderedDocument().ref_reviewsAgg).toEqual([
      {
        publisher: "FIRSTPARTY",
        averageRating: 4.8,
        reviewCount: 3,
        topReviews: [
          {
            authorName: "Jordan Lee",
            rating: 5,
            reviewDate: "2026-06-12",
            content:
              "Fast service, friendly staff, and the food was fresh. This is my go-to lunch spot.",
          },
          {
            authorName: "Maya Patel",
            rating: 5,
            reviewDate: "2026-05-28",
            content:
              "Ordering was easy and everything was ready right on time. The team was great.",
          },
          {
            authorName: "Chris Morgan",
            rating: 4,
            reviewDate: "2026-05-03",
            content:
              "Good food and quick pickup. The location was clean and the staff was helpful.",
          },
        ],
      },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Hide Reviews Data" }));

    await waitFor(() => {
      expect(window.location.search).toContain("reviews=0");
    });
    expect(
      screen.getByRole("button", { name: "Show Reviews Data" })
    ).toBeDefined();
    expect(getRenderedDocument().ref_reviewsAgg).toBeUndefined();
  });

  it("preserves existing reviews data when reviews are on", () => {
    mockDocumentResponse = {
      ...mockDocumentResponse,
      document: {
        id: "entity-1",
        name: "Entity One",
        ref_reviewsAgg: [
          {
            publisher: "FIRSTPARTY",
            averageRating: 2.5,
            reviewCount: 9,
          },
        ],
      },
    };

    renderShell();

    expect(getRenderedDocument().ref_reviewsAgg).toEqual([
      {
        publisher: "FIRSTPARTY",
        averageRating: 2.5,
        reviewCount: 9,
      },
    ]);
  });

  it("adds a prompted Mapbox key to _env in React state", () => {
    const promptSpy = vi
      .spyOn(window, "prompt")
      .mockReturnValue("pk.test-mapbox-key");

    renderShell();

    fireEvent.click(screen.getByRole("button", { name: "Add Mapbox Key" }));

    expect(promptSpy).toHaveBeenCalledWith("Enter Mapbox key", undefined);
    expect(getRenderedDocument()._env).toEqual({
      YEXT_MAPBOX_API_KEY: "pk.test-mapbox-key",
    });
    expect(
      screen.getByRole("button", { name: "Update Mapbox Key" })
    ).toBeDefined();

    promptSpy.mockRestore();
  });

  it("adds nearby locations data and merges the Yext API key into _env", () => {
    mockDocumentResponse = {
      ...mockDocumentResponse,
      document: {
        id: "entity-1",
        name: "Entity One",
        _env: {
          EXISTING_ENV: "keep-me",
        },
        __: {
          isPrimaryLocale: false,
          keep: "overwrite-me",
        },
        _pageset: "old-pageset",
        yextDisplayCoordinate: {
          latitude: 1,
          longitude: 2,
        },
        _yext: {
          contentDeliveryAPIDomain: "https://old.example.com",
        },
      },
    };

    const promptSpy = vi
      .spyOn(window, "prompt")
      .mockReturnValue("yext-api-key-123");

    renderShell();

    fireEvent.click(
      screen.getByRole("button", { name: "Add Nearby Locations Key" })
    );

    expect(promptSpy).toHaveBeenCalledWith("Yext API Key", undefined);
    expect(getRenderedDocument()).toMatchObject({
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        EXISTING_ENV: "keep-me",
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "yext-api-key-123",
      },
      _pageset: JSON.stringify({
        config: {
          contentEndpointId: "locationsContent",
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
      _yext: {
        contentDeliveryAPIDomain: "https://cdn.yextapis.com",
      },
    });
    expect(
      screen.getByRole("button", { name: "Update Nearby Locations Key" })
    ).toBeDefined();

    promptSpy.mockRestore();
  });
});
