import { describe, it, expect } from "vitest";
import { getLocationPath } from "./getLocationPath.ts";

describe("getLocationPath", () => {
  it("returns slug paths", () => {
    expect(
      getLocationPath({ locale: "en", slug: "my-slug", id: "location1" }, "")
    ).toBe("my-slug");

    expect(
      getLocationPath({ locale: "en", slug: "my-slug", id: "location1" }, "")
    ).toBe("my-slug");

    expect(
      getLocationPath(
        { locale: "en", slug: "my-slug", id: "location1" },
        "../../"
      )
    ).toBe("../../my-slug");
  });

  it("returns address-based paths", () => {
    expect(
      getLocationPath(
        {
          locale: "en",
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
          __: {
            isPrimaryLocale: true,
          },
        },
        ""
      )
    ).toBe("va/arlington/1101-wilson-blvd");

    expect(
      getLocationPath(
        {
          locale: "es",
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
          __: {
            isPrimaryLocale: false,
          },
        },
        ""
      )
    ).toBe("es/va/arlington/1101-wilson-blvd");

    expect(
      getLocationPath(
        {
          __: {
            isPrimaryLocale: false,
          },
          locale: "en",
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
        },
        "../"
      )
    ).toBe("../en/va/arlington/1101-wilson-blvd");
  });

  it("returns id-based paths", () => {
    expect(
      getLocationPath(
        { id: "location1", locale: "en", __: { isPrimaryLocale: true } },
        ""
      )
    ).toBe("location1");

    expect(getLocationPath({ locale: "es", id: "location1" }, "")).toBe(
      "es/location1"
    );

    expect(
      getLocationPath(
        { id: "location1", locale: "en", __: { isPrimaryLocale: true } },
        "../../../"
      )
    ).toBe("../../../location1");

    expect(
      getLocationPath(
        { id: "location1", locale: "en", __: { isPrimaryLocale: false } },
        "../../../"
      )
    ).toBe("../../../en/location1");
  });

  it("handles empty values", () => {
    // @ts-expect-error
    expect(() => getLocationPath({}, {}, "")).toThrow();

    // @ts-expect-error
    expect(() => getLocationPath(undefined, {}, "")).toThrow();
  });
});
