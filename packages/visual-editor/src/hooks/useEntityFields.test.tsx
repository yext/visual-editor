import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePlatformBridgeEntityFields } from "./useEntityFields.tsx";

describe("usePlatformBridgeEntityFields", () => {
  it("reads the base entity schema from getTemplateStream in normal mode", () => {
    const { result } = renderHook(() => usePlatformBridgeEntityFields());

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.yext.com",
          data: {
            type: "getTemplateStream",
            payload: {
              stream: {
                schema: {
                  fields: [
                    {
                      name: "name",
                      displayName: "Name",
                      definition: {
                        name: "name",
                        typeName: "type.string",
                        type: {},
                      },
                    },
                  ],
                },
              },
              apiNamesToDisplayNames: {
                name: "Name",
              },
            },
          },
        })
      );
    });

    expect(result.current?.fields[0]?.name).toBe("name");
    expect(result.current?.displayNames?.name).toBe("Name");
  });

  it("reads the base entity schema from getDevEntityFields in dev mode", () => {
    const { result } = renderHook(() => usePlatformBridgeEntityFields());

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.yext.com",
          data: {
            type: "getDevEntityFields",
            payload: [
              {
                name: "photo",
                typeName: "type.image",
                type: {},
              },
            ],
          },
        })
      );
    });

    expect(result.current?.fields[0]?.name).toBe("photo");
    expect(result.current?.fields[0]?.definition.typeName).toBe("type.image");
  });
});
