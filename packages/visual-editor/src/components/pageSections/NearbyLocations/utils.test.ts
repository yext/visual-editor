import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchNearbyLocations } from "./utils.ts";

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
            count: 3,
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
            count: 3,
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
            count: 2,
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
      streamDocument: {
        businessId: "biz-1",
        id: "entity-1",
        _env: { YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-1" },
        _pageset: JSON.stringify({
          config: { contentEndpointId: "content-endpoint-id" },
        }),
        _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
      } as any,
      latitude: 0,
      longitude: 0,
      radiusMi: 500,
      limit,
      locale: "de",
    });

    expect(result.meta).toEqual({ uuid: "page-1", errors: [] });
    expect(result.response.count).toBe(expectedCount);
    expect(result.response.docs.map((doc) => doc.id)).toEqual(expectedIds);

    expect(fetchMock).toHaveBeenCalled();
    const firstUrl = new URL(fetchedUrlSnapshots[0]);
    expect(firstUrl.pathname).toBe(
      "/v2/accounts/biz-1/content/content-endpoint-id"
    );
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
        streamDocument: {
          businessId: "biz-1",
          id: "entity-1",
          _env: { YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-1" },
          _pageset: JSON.stringify({
            config: { contentEndpointId: "content-endpoint-id" },
          }),
          _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
        } as any,
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
      streamDocument: {
        businessId: "biz-1",
        id: "entity-1",
        _env: { YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-1" },
        _pageset: JSON.stringify({
          config: { contentEndpointId: "content-endpoint-id" },
        }),
        _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
      } as any,
      latitude: 0,
      longitude: 0,
      radiusMi: 500,
      limit: 2,
      locale: "de",
    });

    expect(result.response.docs.map((doc) => doc.id)).toEqual([
      "nearest",
      "mid",
    ]);
  });

  it("uses a stable secondary key when multiple docs have the same distance", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          meta: { uuid: "page-1", errors: [] },
          response: {
            docs: [
              {
                id: "charlie",
                yextDisplayCoordinate: { latitude: 0, longitude: 1 },
              },
              {
                id: "alpha",
                yextDisplayCoordinate: { latitude: 0, longitude: -1 },
              },
              {
                id: "bravo",
                yextDisplayCoordinate: { latitude: 1, longitude: 0 },
              },
            ],
          },
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNearbyLocations({
      streamDocument: {
        businessId: "biz-1",
        id: "entity-1",
        _env: { YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-1" },
        _pageset: JSON.stringify({
          config: { contentEndpointId: "content-endpoint-id" },
        }),
        _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
      } as any,
      latitude: 0,
      longitude: 0,
      radiusMi: 500,
      limit: 3,
      locale: "de",
    });

    expect(result.response.docs.map((doc) => doc.id)).toEqual([
      "alpha",
      "bravo",
      "charlie",
    ]);
  });

  it("returns an empty response and logs when the stream document is missing required config", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNearbyLocations({
      streamDocument: {
        businessId: "biz-1",
        id: "entity-1",
        _env: { YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "api-key-1" },
        _pageset: "{bad json",
        _yext: { contentDeliveryAPIDomain: "https://cdn.example.com" },
      } as any,
      latitude: 0,
      longitude: 0,
      radiusMi: 500,
      limit: 3,
      locale: "de",
    });

    expect(result).toEqual({
      meta: { errors: [] },
      response: {
        docs: [],
        count: 0,
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      "Missing contentEndpointId! Unable to fetch nearby locations."
    );
  });
});
