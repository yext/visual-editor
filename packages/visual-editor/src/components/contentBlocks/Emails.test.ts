import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Emails, EmailsProps } from "./Emails.tsx";

vi.mock("../../hooks/useDocument.tsx", () => ({
  useDocument: () => ({}),
}));

vi.mock("../../editor/EntityField.tsx", () => ({
  EntityField: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../atoms/background.tsx", () => ({
  Background: ({
    children,
    background,
    className,
  }: {
    children: React.ReactNode;
    background?: unknown;
    className?: string;
  }) =>
    React.createElement("div", {
      className,
      "data-testid": "icon-background",
      "data-color": JSON.stringify(background),
      children,
    }),
}));

vi.mock("../atoms/cta.tsx", () => ({
  CTA: ({ label, color }: { label: React.ReactNode; color?: unknown }) =>
    React.createElement("a", {
      href: "#",
      "data-testid": "email-link",
      "data-color": JSON.stringify(color),
      children: label,
    }),
}));

const renderEmails = (styles: EmailsProps["styles"]): HTMLElement => {
  return render(
    React.createElement(Emails.render as React.ComponentType<any>, {
      data: {
        list: { field: "emails", constantValue: [] },
      },
      styles,
      parentData: { field: "emails", list: ["test@example.com"] },
      puck: { isEditing: false },
    })
  ).container;
};

describe("Emails colors", () => {
  it("applies independent palette colors to the link and icon", () => {
    const container = renderEmails({
      showIcon: true,
      color: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      iconColor: {
        selectedColor: "palette-secondary",
        contrastingColor: "palette-secondary-contrast",
      },
    });

    expect(screen.getByTestId("email-link").getAttribute("data-color")).toBe(
      JSON.stringify({
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      })
    );
    expect(
      screen.getByTestId("icon-background").getAttribute("data-color")
    ).toBe(
      JSON.stringify({
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      })
    );
    expect(
      container
        .querySelector("svg")
        ?.classList.contains("text-palette-secondary")
    ).toBe(true);
  });

  it("applies a custom icon color", () => {
    const container = renderEmails({
      showIcon: true,
      color: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
      iconColor: { selectedColor: "[#00E5FF]", contrastingColor: "black" },
    });

    expect(container.querySelector("svg")?.style.color).toBe(
      "rgb(0, 229, 255)"
    );
  });
});
