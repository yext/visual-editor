import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLayoutMessageReceivers } from "./useMessageReceivers.ts";
import { getSchema } from "../../../utils/schema/getSchema.ts";

const requestPreview = (
  payload: Record<string, any>,
  origin = "https://dev.yext.com"
) => {
  const postMessage = vi.fn();
  act(() =>
    window.dispatchEvent(
      new MessageEvent("message", {
        origin,
        source: { postMessage } as unknown as Window,
        data: { type: "resolveCustomSchema", payload },
      })
    )
  );
  return postMessage.mock.calls[0]?.[0]?.payload;
};
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Custom schema preview messages", () => {
  it.each(["location", "dm_root", "locator"])(
    "renders %s with the publishing context and correlates the response",
    (entityTypeId) => {
      vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
      const template =
        "  <script>{{json name}}|{{path}}|{{relativePrefixToRoot}}|{{json address}}</script>\n";
      const document = {
        name: "A & B",
        locale: "en",
        address: { city: "New York" },
        meta: { entityType: { id: entityTypeId } },
        __: {
          pathInfo: {
            template: "us/store",
            sourceEntityPageSetTemplate: "other/path",
            primaryLocale: "en",
          },
          layout: JSON.stringify({
            root: {
              props: { schemaMode: "custom", customSchemaMarkup: template },
            },
          }),
        },
      };
      renderHook(() =>
        useLayoutMessageReceivers(true, { components: {} }, document)
      );
      const preview = requestPreview({
        requestId: "request-7",
        template,
        document: { name: "Untrusted" },
        path: "Untrusted",
      });
      expect(preview).toEqual({
        requestId: "request-7",
        output: '  <script>"A & B"|us/store|../|{"city":"New York"}</script>\n',
      });
      expect(preview.output).toBe(
        getSchema({ document, path: "us/store", relativePrefixToRoot: "../" })
      );
    }
  );
  it("previews blank Custom successfully even when no URL context is available", () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    renderHook(() => useLayoutMessageReceivers(true, { components: {} }, {}));
    expect(requestPreview({ requestId: "blank", template: "" })).toEqual({
      requestId: "blank",
      output: "",
    });
  });

  it.each([
    "{{#if name}}",
    "{{unknown name}}",
    "{{json (AddressSchema invalid)}}",
  ])(
    "returns a correlated readable error without output for %s",
    (template) => {
      vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
      renderHook(() =>
        useLayoutMessageReceivers(
          true,
          { components: {} },
          {
            name: "Shop",
            locale: "en",
            invalid: null,
            __: { pathInfo: { template: "store" } },
          }
        )
      );
      expect(requestPreview({ requestId: "failure", template })).toEqual({
        requestId: "failure",
        output: "",
        error: expect.any(String),
      });
    }
  );

  it("ignores requests from disallowed origins and response envelopes", () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    renderHook(() => useLayoutMessageReceivers(true, { components: {} }, {}));
    expect(
      requestPreview(
        { requestId: "bad", template: "anything" },
        "https://untrusted.example"
      )
    ).toBeUndefined();
    expect(
      requestPreview({ requestId: "response", output: "anything" })
    ).toBeUndefined();
  });

  it("reports missing URL context for nonempty templates", () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    renderHook(() => useLayoutMessageReceivers(true, { components: {} }, {}));
    expect(
      requestPreview({ requestId: "context", template: "{{path}}" })
    ).toEqual({
      requestId: "context",
      output: "",
      error: "Could not resolve url.",
    });
  });
});

describe("Recommended schema preview messages", () => {
  it.each(["dm_city", "locator"])(
    "resolves the %s page URL without a child profile",
    (entityTypeId) => {
      const postMessage = vi
        .spyOn(window.parent, "postMessage")
        .mockImplementation(() => {});
      const document = {
        name: "Store finder",
        id: "finder",
        locale: "en",
        meta: { entityType: { id: entityTypeId } },
        __: {
          pathInfo: {
            template: "stores/[[id]]",
            sourceEntityPageSetTemplate: "[[slug]]",
            primaryLocale: "en",
          },
        },
      };
      renderHook(() =>
        useLayoutMessageReceivers(true, { components: {} }, document)
      );
      postMessage.mockClear();
      act(() =>
        window.dispatchEvent(
          new MessageEvent("message", {
            origin: "http://localhost",
            source: window.parent,
            data: {
              type: "resolveSchema",
              payload: {
                schema: {
                  "@context": "https://schema.org",
                  "@type": "WebPage",
                  name: "[[name]]",
                  url: "https://[[siteDomain]]/[[path]]",
                },
              },
            },
          })
        )
      );
      expect(
        postMessage.mock.calls.find(
          ([message]) => message.type === "resolveSchema"
        )?.[0]
      ).toEqual({
        type: "resolveSchema",
        payload: {
          schema: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Store finder",
            url: "/stores/finder",
          },
        },
      });
    }
  );
});
