import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../../hooks/useDocument.tsx";
import { Image } from "./image.tsx";

vi.mock("react-i18next", async () => ({
  ...(await vi.importActual("react-i18next")),
  useTranslation: () => ({ i18n: { language: "en" } }),
}));

describe("Image inline data", () => {
  it.each([
    {
      name: "when the data URL uses SVG then it is passed through unchanged",
      url: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E",
    },
    {
      name: "when the data URL is malformed then the browser still receives it",
      url: "data:image/webp;base64,invalid!",
    },
  ])("$name", ({ url }) => {
    const { container } = render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <Image image={{ url, width: 1, height: 1 }} aspectRatio={2} />
      </TemplatePropsContext.Provider>
    );

    expect(container.querySelector("img")?.getAttribute("src")).toBe(url);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("when the image URL is missing then the component returns null", () => {
    const { container } = render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <Image image={{ url: "", width: 1, height: 1 }} aspectRatio={2} />
      </TemplatePropsContext.Provider>
    );

    expect(container.innerHTML).toBe("");
  });

  it("when an inline image fails to load then the component returns null", () => {
    const { container } = render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <Image
          image={{
            url: "data:image/png;base64,AAAA",
            width: 1,
            height: 1,
            alternateText: "Inline photo",
          }}
        />
      </TemplatePropsContext.Provider>
    );

    fireEvent.error(screen.getByAltText("Inline photo"));
    expect(container.innerHTML).toBe("");
  });

  it("when an HTTP image fails to load then the component returns null", () => {
    const { container } = render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <Image
          image={{
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
            width: 2048,
            height: 2048,
            alternateText: "HTTP photo",
          }}
          aspectRatio={2}
        />
      </TemplatePropsContext.Provider>
    );

    fireEvent.error(screen.getByAltText("HTTP photo"));
    expect(container.innerHTML).toBe("");
  });

  it("when an HTTP image has an aspect ratio then it still uses the optimized renderer", () => {
    render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <Image
          image={{
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
            width: 2048,
            height: 2048,
            alternateText: "HTTP photo",
          }}
          aspectRatio={2}
        />
      </TemplatePropsContext.Provider>
    );

    expect(screen.getByAltText("HTTP photo").getAttribute("srcset")).toContain(
      "dyn.mktgcdn.com"
    );
  });
});
