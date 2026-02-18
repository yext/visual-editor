import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchNearbyLocations, parseDocument } from "./utils.ts";

describe("parseDocument", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      name: "reads contentEndpointId from _pageset",
      document: {
        businessId: "biz-1",
        id: "entity-1",
        _env: { YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-1" },
        _pageset: JSON.stringify({
          config: { contentEndpointId: "ce-from-json" },
        }),
        _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
      },
      envVarName: "YEXT_CONTENT_ENDPOINT_ID",
      expected: {
        businessId: "biz-1",
        entityId: "entity-1",
        apiKey: "api-key-1",
        contentEndpointId: "ce-from-json",
        contentDeliveryAPIDomain: "https://cdn.example.com",
      },
    },
    {
      name: "falls back to env var contentEndpointId when _pageset is missing",
      document: {
        businessId: "biz-2",
        id: "entity-2",
        _env: {
          YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-2",
          YEXT_CONTENT_ENDPOINT_ID: "ce-from-env",
        },
        _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
      },
      envVarName: "YEXT_CONTENT_ENDPOINT_ID",
      expected: {
        businessId: "biz-2",
        entityId: "entity-2",
        apiKey: "api-key-2",
        contentEndpointId: "ce-from-env",
        contentDeliveryAPIDomain: "https://cdn.example.com",
      },
    },
  ])("$name", ({ document, envVarName, expected }) => {
    expect(parseDocument(document as any, envVarName)).toEqual(expected);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs parse error for invalid _pageset JSON", () => {
    const result = parseDocument({
      businessId: "biz-1",
      id: "entity-1",
      _env: { YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-1" },
      _pageset: "{bad json",
      _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
    } as any);

    expect(result.contentEndpointId).toBe("");
    expect(errorSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      "Missing contentEndpointId! Unable to fetch nearby locations."
    );
  });
});

describe("fetchNearbyLocations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    {
      name: "fetches all pages and returns nearest docs limited by limit",
      limit: 2,
      pages: [
        {
          meta: { uuid: "page-1", errors: [] },
          response: {
            docs: [
              {
                id: "far",
                name: "Far",
                yextDisplayCoordinate: { latitude: 0, longitude: 2 },
              },
            ],
            nextPageToken: "token-2",
          },
        },
        {
          meta: { uuid: "page-2", errors: [] },
          response: {
            docs: [
              {
                id: "mid",
                name: "Mid",
                yextDisplayCoordinate: { latitude: 1, longitude: 0 },
              },
              {
                id: "near",
                name: "Near",
                yextDisplayCoordinate: { latitude: 0, longitude: 0.1 },
              },
            ],
          },
        },
      ],
      expectedIds: ["near", "mid"],
      expectedCount: 3,
    },
    {
      name: "uses geocodedCoordinate when yextDisplayCoordinate is missing",
      limit: 1,
      pages: [
        {
          meta: { uuid: "page-1", errors: [] },
          response: {
            docs: [
              {
                id: "geo",
                geocodedCoordinate: { latitude: 0, longitude: 0.2 },
              },
              {
                id: "display",
                yextDisplayCoordinate: { latitude: 0, longitude: 1 },
              },
            ],
          },
        },
      ],
      expectedIds: ["geo"],
      expectedCount: 2,
    },
  ])("$name", async ({ limit, pages, expectedIds, expectedCount }) => {
    const fetchedUrlSnapshots: string[] = [];
    const fetchMock = vi.fn().mockImplementation(async (url: URL | string) => {
      fetchedUrlSnapshots.push(String(url));
      const next = pages.shift();
      if (!next) {
        throw new Error("No mock page left");
      }
      return new Response(JSON.stringify(next), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNearbyLocations({
      businessId: "biz-1",
      entityId: "entity-1",
      apiKey: "api-key-1",
      contentEndpointId: "content-endpoint-id",
      contentDeliveryAPIDomain: "https://cdn.example.com",
      latitude: 0,
      longitude: 0,
      radiusMi: 500,
      limit,
      locale: "de",
    });

    expect(result.meta).toEqual({ uuid: "page-1", errors: [] });
    expect(result.response.count).toBe(expectedCount);
    expect(result.response.docs.map((doc: { id: string }) => doc.id)).toEqual(
      expectedIds
    );

    expect(fetchMock).toHaveBeenCalled();
    const firstUrl = new URL(fetchedUrlSnapshots[0]);
    expect(firstUrl.searchParams.get("limit")).toBe("50");
    expect(firstUrl.searchParams.get("pageToken")).toBeNull();

    if (fetchedUrlSnapshots.length > 1) {
      const secondUrl = new URL(fetchedUrlSnapshots[1]);
      expect(secondUrl.searchParams.get("pageToken")).toBe("token-2");
    }
  });

  it("throws when endpoint responds with non-OK status", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("oops", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      fetchNearbyLocations({
        businessId: "biz-1",
        entityId: "entity-1",
        apiKey: "api-key-1",
        contentEndpointId: "content-endpoint-id",
        contentDeliveryAPIDomain: "https://cdn.example.com",
        latitude: 0,
        longitude: 0,
        radiusMi: 500,
        limit: 3,
        locale: "de",
      })
    ).rejects.toThrow();
  });

  it("sorts docs by nearest distance before applying limit", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          meta: { uuid: "page-1", errors: [] },
          response: {
            // Intentionally unsorted: far, nearest, then mid
            docs: [
              {
                id: "far",
                yextDisplayCoordinate: { latitude: 0, longitude: 2 },
              },
              {
                id: "nearest",
                yextDisplayCoordinate: { latitude: 0, longitude: 0.05 },
              },
              {
                id: "mid",
                yextDisplayCoordinate: { latitude: 0, longitude: 0.5 },
              },
            ],
          },
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNearbyLocations({
      businessId: "biz-1",
      entityId: "entity-1",
      apiKey: "api-key-1",
      contentEndpointId: "content-endpoint-id",
      contentDeliveryAPIDomain: "https://cdn.example.com",
      latitude: 0,
      longitude: 0,
      radiusMi: 500,
      limit: 2,
      locale: "de",
    });

    expect(result.response.docs.map((doc: { id: string }) => doc.id)).toEqual([
      "nearest",
      "mid",
    ]);
  });
});
