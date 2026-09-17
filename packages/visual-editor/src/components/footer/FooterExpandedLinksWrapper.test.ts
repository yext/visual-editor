import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  FooterExpandedLinksWrapper,
  FooterExpandedLinksWrapperProps,
} from "./FooterExpandedLinksWrapper.tsx";

vi.mock("../../hooks/useDocument.tsx", () => ({
  useDocument: () => ({}),
}));

vi.mock("../../hooks/useBackground.tsx", () => ({
  useBackground: () => ({ isDarkColor: false }),
}));

vi.mock("../atoms/cta.tsx", () => ({
  CTA: ({ label, color }: { label: React.ReactNode; color?: unknown }) =>
    React.createElement("a", {
      href: "#",
      "data-testid": "footer-link",
      "data-color": JSON.stringify(color),
      children: label,
    }),
}));

const renderExpandedLinks = (
  styles: FooterExpandedLinksWrapperProps["styles"]
): void => {
  render(
    React.createElement(
      FooterExpandedLinksWrapper.render as React.ComponentType<any>,
      {
        data: {
          sections: [
            {
              label: { defaultValue: "Section label" },
              links: [
                {
                  label: { defaultValue: "Footer link" },
                  link: "#",
                  linkType: "URL",
                },
              ],
            },
          ],
        },
        styles,
        puck: { isEditing: false },
      }
    )
  );
};

describe("Expanded Footer Links color", () => {
  it("applies a palette color to section labels and links", () => {
    renderExpandedLinks({
      color: {
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      },
    });

    expect(
      screen
        .getByText("Section label")
        .classList.contains("text-palette-secondary")
    ).toBe(true);
    expect(screen.getByTestId("footer-link").getAttribute("data-color")).toBe(
      JSON.stringify({
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      })
    );
  });

  it("applies a custom color to section labels and links", () => {
    renderExpandedLinks({
      color: { selectedColor: "[#00E5FF]", contrastingColor: "black" },
    });

    expect(screen.getByText("Section label").style.color).toBe(
      "rgb(0, 229, 255)"
    );
    expect(screen.getByTestId("footer-link").getAttribute("data-color")).toBe(
      JSON.stringify({
        selectedColor: "[#00E5FF]",
        contrastingColor: "black",
      })
    );
  });
});
