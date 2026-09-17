import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PhoneAtom } from "./phone.tsx";

vi.mock("./cta.tsx", () => ({
  CTA: ({ label, color }: { label: React.ReactNode; color?: unknown }) =>
    React.createElement("a", {
      href: "#",
      "data-testid": "phone-link",
      "data-color": JSON.stringify(color),
      children: label,
    }),
}));

describe("PhoneAtom colors", () => {
  it("applies independent palette colors to the label, number, and icon", () => {
    const { container } = render(
      React.createElement(PhoneAtom, {
        phoneNumber: "+12025550123",
        label: "Phone",
        format: "domestic",
        includeHyperlink: false,
        includeIcon: true,
        labelColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        linkColor: {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        iconColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      })
    );

    expect(
      screen.getByText("Phone").classList.contains("text-palette-primary")
    ).toBe(true);
    expect(
      screen
        .getByText("(202) 555-0123")
        .classList.contains("text-palette-secondary")
    ).toBe(true);
    expect(
      container
        .querySelector("svg")
        ?.classList.contains("text-palette-tertiary")
    ).toBe(true);
  });

  it("applies independent custom colors to the label, number, and icon", () => {
    const { container } = render(
      React.createElement(PhoneAtom, {
        phoneNumber: "+12025550123",
        label: "Phone",
        format: "domestic",
        includeHyperlink: false,
        includeIcon: true,
        labelColor: { selectedColor: "[#112233]", contrastingColor: "white" },
        linkColor: { selectedColor: "[#445566]", contrastingColor: "white" },
        iconColor: { selectedColor: "[#778899]", contrastingColor: "black" },
      })
    );

    expect(screen.getByText("Phone").style.color).toBe("rgb(17, 34, 51)");
    expect(screen.getByText("(202) 555-0123").style.color).toBe(
      "rgb(68, 85, 102)"
    );
    expect(container.querySelector("svg")?.style.color).toBe(
      "rgb(119, 136, 153)"
    );
  });

  it("keeps the phone link color separate from label and icon colors", () => {
    const { container } = render(
      React.createElement(PhoneAtom, {
        phoneNumber: "+12025550123",
        label: "Phone",
        format: "domestic",
        includeHyperlink: true,
        includeIcon: true,
        backgroundColor: {
          selectedColor: "palette-quaternary",
          contrastingColor: "palette-quaternary-contrast",
        },
        labelColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        linkColor: {
          selectedColor: "palette-secondary",
          contrastingColor: "palette-secondary-contrast",
        },
        iconColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      })
    );

    expect(
      screen.getByText("Phone").classList.contains("text-palette-primary")
    ).toBe(true);
    expect(screen.getByTestId("phone-link").getAttribute("data-color")).toBe(
      JSON.stringify({
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      })
    );
    expect(
      container
        .querySelector("svg")
        ?.classList.contains("text-palette-tertiary")
    ).toBe(true);
    expect(
      container
        .querySelector("svg")
        ?.parentElement?.classList.contains("bg-palette-quaternary")
    ).toBe(true);
  });
});
