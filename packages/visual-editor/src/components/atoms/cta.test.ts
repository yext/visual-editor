import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CTA, CTAProps } from "./cta.tsx";

vi.mock("../../hooks/useDocument.tsx", () => ({
  useDocument: () => ({}),
}));

vi.mock("../../hooks/useBackground.tsx", () => ({
  useBackground: () => ({
    selectedColor: "white",
    contrastingColor: "black",
    isDarkColor: false,
  }),
}));

vi.mock("@yext/pages-components", () => ({
  getDirections: () => "#",
  Link: ({
    children,
    cta: _cta,
    eventName: _eventName,
    ...props
  }: {
    children: React.ReactNode;
    cta: unknown;
    eventName?: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement("a", { href: "#", ...props }, children),
}));

const renderCta = (props: Partial<CTAProps> = {}): void => {
  render(
    React.createElement(CTA, {
      label: "Call to action",
      link: "#",
      normalizeLink: false,
      variant: "primary",
      ...props,
    })
  );
};

describe("CTA text color", () => {
  it("uses a palette color for primary link text and icons", () => {
    renderCta({
      textColor: {
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      },
    });

    const link = screen.getByRole("link");
    expect(link.style.color).toBe("var(--colors-palette-secondary)");
    expect(link.querySelector("svg")?.style.color).toBe("");
  });

  it("uses a custom color for a primary button", () => {
    renderCta({
      actionType: "button",
      textColor: { selectedColor: "[#00E5FF]", contrastingColor: "black" },
    });

    expect(screen.getByRole("button").style.color).toBe("rgb(0, 229, 255)");
  });

  it("uses the fill contrast color when text color is Default", () => {
    renderCta({
      color: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
    });

    expect(screen.getByRole("link").style.color).toBe(
      "var(--colors-palette-primary-contrast)"
    );
  });

  it("uses the selected text color for a disabled primary CTA", () => {
    renderCta({
      disabled: true,
      textColor: { selectedColor: "black", contrastingColor: "white" },
    });

    expect(screen.getByRole("button").style.color).toBe("black");
  });

  it("ignores text color for non-primary CTAs", () => {
    renderCta({
      variant: "secondary",
      color: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      textColor: {
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      },
    });

    expect(screen.getByRole("link").style.color).toBe(
      "var(--colors-palette-primary)"
    );
  });

  it("lets an external-link icon inherit the primary text color", () => {
    renderCta({
      openInNewTab: true,
      textColor: { selectedColor: "white", contrastingColor: "black" },
    });

    const link = screen.getByRole("link");
    expect(link.style.color).toBe("white");
    expect(link.querySelectorAll("svg")).toHaveLength(2);
    expect(
      Array.from(link.querySelectorAll("svg")).every(
        (icon) => icon.style.color === ""
      )
    ).toBe(true);
  });
});
