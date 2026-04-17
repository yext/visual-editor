import * as React from "react";
import { render as reactRender, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import "../testing/componentTests.setup.ts";
import { CTA } from "./cta.tsx";

const renderCta = ({
  background,
  color,
  variant,
}: {
  background: Required<ThemeColor>;
  color?: ThemeColor;
  variant: "primary" | "secondary";
}) => {
  reactRender(
    <VisualEditorProvider templateProps={{ document: { locale: "en" } }}>
      <BackgroundProvider value={background}>
        <CTA
          label="Example CTA"
          link="#"
          linkType="URL"
          normalizeLink={false}
          variant={variant}
          color={color}
        />
      </BackgroundProvider>
    </VisualEditorProvider>
  );

  return screen.getByRole("link", { name: "Example CTA" });
};

describe("CTA", () => {
  it("keeps white secondary CTA text and borders on dark backgrounds when color is unset", () => {
    const cta = renderCta({
      background: {
        selectedColor: "[#341A1F]",
        contrastingColor: "white",
        isDarkColor: true,
      },
      variant: "secondary",
    });

    const styles = window.getComputedStyle(cta);

    expect(styles.color).toBe("rgb(255, 255, 255)");
    expect(styles.borderColor).toBe("rgb(255, 255, 255)");
  });

  it("uses a readable configured secondary CTA color on dark backgrounds", () => {
    const cta = renderCta({
      background: {
        selectedColor: "[#341A1F]",
        contrastingColor: "white",
        isDarkColor: true,
      },
      color: {
        selectedColor: "[#FF6D66]",
        contrastingColor: "black",
      },
      variant: "secondary",
    });

    const styles = window.getComputedStyle(cta);

    expect(styles.color).toBe("rgb(255, 109, 102)");
    expect(styles.borderColor).toBe("rgb(255, 109, 102)");
  });

  it("falls back to white for low-contrast configured secondary CTA colors on dark backgrounds", () => {
    const cta = renderCta({
      background: {
        selectedColor: "[#341A1F]",
        contrastingColor: "white",
        isDarkColor: true,
      },
      color: {
        selectedColor: "[#4A2A2A]",
        contrastingColor: "white",
      },
      variant: "secondary",
    });

    const styles = window.getComputedStyle(cta);

    expect(styles.color).toBe("rgb(255, 255, 255)");
    expect(styles.borderColor).toBe("rgb(255, 255, 255)");
  });

  it("uses configured secondary CTA colors on light backgrounds", () => {
    const cta = renderCta({
      background: {
        selectedColor: "[#EAE6E4]",
        contrastingColor: "black",
        isDarkColor: false,
      },
      color: {
        selectedColor: "[#341A1F]",
        contrastingColor: "white",
      },
      variant: "secondary",
    });

    const styles = window.getComputedStyle(cta);

    expect(styles.color).toBe("rgb(52, 26, 31)");
    expect(styles.borderColor).toBe("rgb(52, 26, 31)");
  });

  it("preserves primary CTA configured colors", () => {
    const cta = renderCta({
      background: {
        selectedColor: "[#341A1F]",
        contrastingColor: "white",
        isDarkColor: true,
      },
      color: {
        selectedColor: "[#FF6D66]",
        contrastingColor: "white",
      },
      variant: "primary",
    });

    const styles = window.getComputedStyle(cta);

    expect(styles.backgroundColor).toBe("rgb(255, 109, 102)");
    expect(styles.borderColor).toBe("rgb(255, 109, 102)");
    expect(styles.color).toBe("rgb(255, 255, 255)");
  });
});
