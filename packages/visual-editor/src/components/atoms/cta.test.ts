import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageQueryContext } from "../../contexts/PageQueryContext.ts";
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
    cta,
    eventName: _eventName,
    ...props
  }: {
    children: React.ReactNode;
    cta: { link: string };
    eventName?: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement("a", { href: cta.link, ...props }, children),
}));

const renderCta = (props: Partial<CTAProps> = {}, pageQuery = ""): void => {
  render(
    React.createElement(
      PageQueryContext.Provider,
      { value: pageQuery },
      React.createElement(CTA, {
        label: "Call to action",
        link: "#",
        normalizeLink: false,
        variant: "primary",
        ...props,
      })
    )
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

describe("CTA query parameters", (): void => {
  it.each<{
    name: string;
    props: Partial<CTAProps>;
    pageQuery: string;
    href: string;
  }>([
    {
      name: "the CTA uses link normalization",
      props: {
        link: "/STORE HOURS?offer=local#hours",
        normalizeLink: true,
      },
      pageQuery: "?offer=ad&utm_source=Campaign%2fA",
      href: "/store-hours?offer=local&utm_source=Campaign%2fA#hours",
    },
    {
      name: "the page supplies no query",
      props: { link: "/location?offer=local#hours" },
      pageQuery: "",
      href: "/location?offer=local#hours",
    },
    {
      name: "the CTA uses a phone number",
      props: { link: "2125550100", linkType: "Phone" },
      pageQuery: "?utm_source=campaign",
      href: "2125550100",
    },
    {
      name: "the CTA uses an email address",
      props: { link: "contact@example.test", linkType: "EMAIL" },
      pageQuery: "?utm_source=campaign",
      href: "contact@example.test",
    },
  ])(
    "when $name, then the link has the expected href",
    ({ props, pageQuery, href }): void => {
      renderCta(props, pageQuery);

      expect(screen.getByRole("link").getAttribute("href")).toBe(href);
    }
  );

  it("when the CTA renders a button, then it has no link", (): void => {
    renderCta(
      { actionType: "button", link: "/location" },
      "?utm_source=campaign"
    );

    expect(screen.getByRole("button").getAttribute("href")).toBeNull();
  });
});
