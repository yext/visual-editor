import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CTA } from "../components/atoms/cta.tsx";
import { BackgroundProvider } from "../hooks/useBackground.tsx";
import { VisualEditorProvider } from "./VisualEditorProvider.tsx";

describe("CTA SSR contrast", () => {
  it("renders configured secondary palette colors during SSR when contrast is sufficient", () => {
    const markup = renderToStaticMarkup(
      <VisualEditorProvider
        templateProps={{
          document: {
            locale: "en",
            __: {
              theme: JSON.stringify({
                "--colors-palette-primary": "#341A1F",
                "--colors-palette-secondary": "#FF6D66",
              }),
            },
          },
        }}
      >
        <BackgroundProvider
          value={{
            selectedColor: "palette-primary",
            contrastingColor: "white",
            isDarkColor: true,
          }}
        >
          <CTA
            label="Example CTA"
            link="#"
            linkType="URL"
            normalizeLink={false}
            variant="secondary"
            color={{
              selectedColor: "palette-secondary",
              contrastingColor: "white",
            }}
          />
        </BackgroundProvider>
      </VisualEditorProvider>
    );

    expect(markup).toContain("color:var(--colors-palette-secondary)");
    expect(markup).toContain("border-color:var(--colors-palette-secondary)");
  });
});
