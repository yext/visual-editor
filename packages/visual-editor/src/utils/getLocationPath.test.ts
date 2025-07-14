import { describe, it, expect } from "vitest";
import { getLocationPath } from "./getLocationPath.ts";

describe("getLocationPath", () => {
  it("returns slug paths", () => {
    expect(
      getLocationPath({ slug: "my-slug", id: "location1" }, "en", "")
    ).toBe("my-slug");

    expect(
      getLocationPath({ slug: "my-slug", id: "location1" }, "es", "")
    ).toBe("my-slug");

    expect(
      getLocationPath({ slug: "my-slug", id: "location1" }, "en", "../../")
    ).toBe("../../my-slug");
  });

  it("returns address-based paths", () => {
    expect(
      getLocationPath(
        {
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
        },
        "en",
        ""
      )
    ).toBe("va/arlington/1101-wilson-blvd-location1");

    expect(
      getLocationPath(
        {
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
        },
        "es",
        ""
      )
    ).toBe("es/va/arlington/1101-wilson-blvd-location1");

    expect(
      getLocationPath(
        {
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
        },
        "en",
        "../"
      )
    ).toBe("../va/arlington/1101-wilson-blvd-location1");
  });

  it("returns id-based paths", () => {
    expect(getLocationPath({ id: "location1" }, "en", "")).toBe("location1");

    expect(getLocationPath({ id: "location1" }, "es", "")).toBe("es/location1");

    expect(getLocationPath({ id: "location1" }, "en", "../../../")).toBe(
      "../../../location1"
    );
  });

  it("handles empty values", () => {
    // @ts-expect-error
    expect(getLocationPath({}, {}, "")).toBe(undefined);

    // @ts-expect-error
    expect(getLocationPath(undefined, {}, "")).toBe(undefined);
  });
});
