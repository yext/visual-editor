import { describe, expect, it, vi } from "vitest";
import { createPuckFieldTransforms } from "./puckFieldTransforms.ts";

describe("createPuckFieldTransforms", () => {
  it("logs malformed generated test field values instead of rendering them", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const transforms = createPuckFieldTransforms("en", {}) as Record<
      string,
      (params: { value: unknown; field?: unknown }) => unknown
    >;

    expect(
      transforms.testEntityField({ value: {}, field: { output: "plainText" } })
    ).toBeUndefined();
    expect(transforms.testRichText({ value: {} })).toBeUndefined();
    expect(transforms.testImage({ value: {} })).toBeUndefined();
    expect(transforms.testCTA({ value: {} })).toBeUndefined();
    expect(error).toHaveBeenCalledTimes(4);
  });

  it("does not render an incomplete localized CTA label", () => {
    const transforms = createPuckFieldTransforms("en", {}) as Record<
      string,
      (params: { value: unknown; field?: unknown }) => unknown
    >;

    expect(
      transforms.testCTA({
        value: {
          field: "",
          constantValueEnabled: true,
          selectedType: "textAndLink",
          constantValue: {
            ctaType: "textAndLink",
            label: { en: "Learn More" },
            link: "/learn-more",
            linkType: "URL",
          },
        },
      })
    ).toBeUndefined();
  });
});
