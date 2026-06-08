import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaybeRTF } from "./maybeRTF.tsx";

const typography = {
  fontFamily: "'Weights Only', sans-serif",
  fontSize: "20px",
  fontWeight: "700",
  fontStyle: "italic",
  textTransform: "uppercase",
} as const;

describe("MaybeRTF", () => {
  it("applies typography styles to the string rendering path", () => {
    render(<MaybeRTF data="Hello world" richTextStyleOverrides={typography} />);

    const text = screen.getByText("Hello world");

    expect(text.style.getPropertyValue("--fontFamily-body-fontFamily")).toBe(
      typography.fontFamily
    );
    expect(text.style.getPropertyValue("--fontSize-body-fontSize")).toBe(
      typography.fontSize
    );
    expect(text.style.getPropertyValue("--fontWeight-body-fontWeight")).toBe(
      typography.fontWeight
    );
    expect(text.style.getPropertyValue("--fontStyle-body-fontStyle")).toBe(
      typography.fontStyle
    );
    expect(
      text.style.getPropertyValue("--textTransform-body-textTransform")
    ).toBe(typography.textTransform);
  });

  it("applies typography styles to the html rendering path", () => {
    const { container } = render(
      <MaybeRTF
        data={{ html: "<p>Hello <strong>world</strong></p>" }}
        richTextStyleOverrides={typography}
      />
    );

    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper).toBeTruthy();
    expect(wrapper.className).toContain("rtf-theme");
    expect(wrapper.style.getPropertyValue("--fontFamily-body-fontFamily")).toBe(
      typography.fontFamily
    );
    expect(wrapper.style.getPropertyValue("--fontSize-body-fontSize")).toBe(
      typography.fontSize
    );
    expect(wrapper.style.getPropertyValue("--fontWeight-body-fontWeight")).toBe(
      typography.fontWeight
    );
    expect(wrapper.style.getPropertyValue("--fontStyle-body-fontStyle")).toBe(
      typography.fontStyle
    );
    expect(
      wrapper.style.getPropertyValue("--textTransform-body-textTransform")
    ).toBe(typography.textTransform);
  });

  it("applies rich text color overrides on the string rendering path", () => {
    render(
      <MaybeRTF
        data="Hello world"
        richTextStyleOverrides={{
          color: "[#123456]",
        }}
      />
    );

    const text = screen.getByText("Hello world");

    expect(text.style.color).toBe("rgb(18, 52, 86)");
  });

  it("applies rich text color overrides on the html rendering path", () => {
    const { container } = render(
      <MaybeRTF
        data={{ html: "<p>Hello <strong>world</strong></p>" }}
        richTextStyleOverrides={{
          color: "[#123456]",
        }}
      />
    );

    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.style.color).toBe("rgb(18, 52, 86)");
  });
});
