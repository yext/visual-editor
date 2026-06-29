import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTA } from "./cta.tsx";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";

const renderCTA = (
  ui: React.ReactElement,
  background: {
    selectedColor: string;
    contrastingColor: string;
    isDarkColor: boolean;
  }
) => {
  return render(
    <VisualEditorProvider
      templateProps={{ document: { locale: "en" } }}
      entityFields={null}
      tailwindConfig={{}}
    >
      <BackgroundProvider value={background}>{ui}</BackgroundProvider>
    </VisualEditorProvider>
  );
};

describe("CTA default contrast", () => {
  it("uses palette-primary-dark for secondary CTAs on light backgrounds", () => {
    renderCTA(
      <CTA
        actionType="button"
        label="Learn more"
        variant="secondary"
        ariaLabel="Learn more"
      />,
      {
        selectedColor: "[#F5F5F5]",
        contrastingColor: "black",
        isDarkColor: false,
      }
    );

    const button = screen.getByRole("button", { name: "Learn more" });

    expect(button.style.color).toBe(
      "hsl(from var(--colors-palette-primary) h s 20)"
    );
    expect(button.style.borderColor).toBe(
      "hsl(from var(--colors-palette-primary) h s 20)"
    );
  });

  it("uses white for secondary CTAs on dark backgrounds", () => {
    renderCTA(
      <CTA
        actionType="button"
        label="Learn more"
        variant="secondary"
        ariaLabel="Learn more"
      />,
      {
        selectedColor: "[#111111]",
        contrastingColor: "white",
        isDarkColor: true,
      }
    );

    expect(screen.getByRole("button", { name: "Learn more" })).toHaveStyle({
      color: "white",
      borderColor: "white",
    });
  });

  it("uses palette-primary-dark for link CTAs on light backgrounds", () => {
    renderCTA(
      <CTA
        actionType="button"
        label="Read more"
        variant="link"
        ariaLabel="Read more"
      />,
      {
        selectedColor: "[#F5F5F5]",
        contrastingColor: "black",
        isDarkColor: false,
      }
    );

    expect(screen.getByRole("button", { name: "Read more" }).style.color).toBe(
      "hsl(from var(--colors-palette-primary) h s 20)"
    );
  });

  it("preserves explicit CTA colors", () => {
    renderCTA(
      <CTA
        actionType="button"
        label="Contact us"
        variant="secondary"
        ariaLabel="Contact us"
        color={{
          selectedColor: "[#FFFFFF]",
          contrastingColor: "black",
        }}
      />,
      {
        selectedColor: "[#111111]",
        contrastingColor: "white",
        isDarkColor: true,
      }
    );

    expect(screen.getByRole("button", { name: "Contact us" })).toHaveStyle({
      color: "rgb(255, 255, 255)",
      borderColor: "rgb(255, 255, 255)",
    });
  });

  it("keeps default primary CTA runtime styling unchanged when no explicit color is set", () => {
    renderCTA(
      <CTA
        actionType="button"
        label="Primary action"
        variant="primary"
        ariaLabel="Primary action"
      />,
      {
        selectedColor: "[#F5F5F5]",
        contrastingColor: "black",
        isDarkColor: false,
      }
    );

    const button = screen.getByRole("button", { name: "Primary action" });
    expect(button.style.backgroundColor).toBe("");
    expect(button.style.color).toBe("");
  });
});
