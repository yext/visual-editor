import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePlatformBridgeLinkedEntitySchemas } from "./useLinkedEntitySchemas.tsx";

describe("usePlatformBridgeLinkedEntitySchemas", () => {
  it("updates linked entity schemas when getLinkedEntitySchemas is received", () => {
    const { result } = renderHook(() => usePlatformBridgeLinkedEntitySchemas());

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.yext.com",
          data: {
            type: "getLinkedEntitySchemas",
            payload: {
              linkedEntitySchemas: {
                c_linkedLocation: {
                  displayName: "Linked Location",
                  fields: [
                    {
                      name: "address",
                      displayName: "Address",
                      definition: {
                        name: "address",
                        typeName: "type.address",
                        type: {},
                      },
                      children: {
                        fields: [
                          {
                            name: "city",
                            displayName: "City",
                            definition: {
                              name: "city",
                              typeName: "type.string",
                              type: {},
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        })
      );
    });

    expect(result.current?.c_linkedLocation.displayName).toBe(
      "Linked Location"
    );
    expect(
      result.current?.c_linkedLocation.fields[0]?.children?.fields[0]?.name
    ).toBe("city");
  });

  it("keeps linked entity schemas empty when the message is never sent or has no schemas", () => {
    const { result } = renderHook(() => usePlatformBridgeLinkedEntitySchemas());

    expect(result.current).toBeNull();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.yext.com",
          data: {
            type: "getLinkedEntitySchemas",
            payload: {},
          },
        })
      );
    });

    expect(result.current).toBeNull();
  });
});
