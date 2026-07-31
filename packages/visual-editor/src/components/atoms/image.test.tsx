import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../../hooks/useDocument.tsx";
import { Image, ImageProps } from "./image.tsx";

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({ i18n: { language: "en" } }),
}));

const renderImage = (props: Partial<ImageProps> = {}) =>
  render(
    <TemplatePropsContext.Provider value={{ document: {} }}>
      <Image
        image={{
          url: "https://example.com/image.jpg",
          width: 640,
          height: 360,
          alternateText: "Example",
        }}
        {...props}
      />
    </TemplatePropsContext.Provider>
  );

describe("Image", () => {
  afterEach(cleanup);

  it.each([
    [undefined, "cover"],
    ["fill", "cover"],
    ["fit", "contain"],
  ] as const)("maps imageFillType %s to object-fit %s", (value, expected) => {
    renderImage({ imageFillType: value });

    expect((screen.getByRole("img") as HTMLImageElement).style.objectFit).toBe(
      expected
    );
  });

  it("allows an explicit objectFit style to override imageFillType", () => {
    renderImage({ imageFillType: "fill", style: { objectFit: "scale-down" } });

    expect((screen.getByRole("img") as HTMLImageElement).style.objectFit).toBe(
      "scale-down"
    );
  });
});
