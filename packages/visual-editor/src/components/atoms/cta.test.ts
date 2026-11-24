import React from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>): React.ReactElement =>
    React.createElement("a", { ...props, href: cta.link }, children),
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

describe("CTA links with page tracking parameters", (): void => {
  const originalUrl = window.location.href;

  afterEach((): void => {
    window.history.replaceState(window.history.state, "", originalUrl);
  });

  it.each<{
    name: string;
    pageQuery: string;
    props: Partial<CTAProps>;
    expectedHref: string;
  }>([
    {
      name: "when the page has no supported parameters then the destination is unchanged",
      pageQuery:
        "?utm=page&UTM_source=page&utmsource=page&scCid=page&GCLID=page&gclid_extra=page",
      props: { link: "/book?utm=destination&ref=a%20b#details" },
      expectedHref: "/book?utm=destination&ref=a%20b#details",
    },
    {
      name: "when the page has an empty utm_source then it replaces the destination value",
      pageQuery: "?utm_source=",
      props: { link: "/book?utm_source=destination" },
      expectedHref: "/book?utm_source=",
    },
    {
      name: "when utm_source repeats then the first page value replaces all destination entries",
      pageQuery: "?utm_source=Spring%2BSale%26More&utm_source=second&ref=page",
      props: {
        link: "https://example.com/book?ref=a%20b&UTM_source=other&utm_source=old&%75tm_source=older#details",
      },
      expectedHref:
        "https://example.com/book?ref=a%20b&UTM_source=other&utm_source=Spring%2BSale%26More#details",
    },
    {
      name: "when the page has several tracking keys then only those keys replace destination values",
      pageQuery:
        "?utm_campaign=Spring%2BSale&gclid=&utm_custom=page&ScCid=Exact&gclid=second&utm=page",
      props: {
        link: "https://example.com/book?ref=a%20b&%75tm_campaign=first&utm_campaign=second&gclid=old&utm_source=saved&fbclid=old&utm=destination#details",
      },
      expectedHref:
        "https://example.com/book?ref=a%20b&utm_source=saved&fbclid=old&utm=destination&utm_campaign=Spring%2BSale&gclid=&utm_custom=page&ScCid=Exact#details",
    },
    {
      name: "when a relative link uses normalization then the page value keeps its case",
      pageQuery: "?utm_source=SpringSale",
      props: { link: "../Book Offer", normalizeLink: true },
      expectedHref: "../book-offer?utm_source=SpringSale",
    },
    {
      name: "when the destination has only a query then utm_source uses the same query",
      pageQuery: "?utm_source=page",
      props: { link: "?service=onsite" },
      expectedHref: "?service=onsite&utm_source=page",
    },
    {
      name: "when the destination has only a fragment then the fragment is unchanged",
      pageQuery: "?utm_source=page&ref=page",
      props: { link: "#details" },
      expectedHref: "#details",
    },
    {
      name: "when the link type is email then the destination is unchanged",
      pageQuery: "?utm_source=page&gclid=page",
      props: { link: "team@example.com", linkType: "Email" },
      expectedHref: "team@example.com",
    },
    {
      name: "when the link type is phone then the destination is unchanged",
      pageQuery: "?utm_source=page",
      props: { link: "+15551234567", linkType: "PHONE" },
      expectedHref: "+15551234567",
    },
    {
      name: "when a URL uses mailto then the destination is unchanged",
      pageQuery: "?utm_source=page",
      props: { link: "MAILTO:team@example.com?subject=Book", linkType: "URL" },
      expectedHref: "MAILTO:team@example.com?subject=Book",
    },
    {
      name: "when a URL uses tel then the destination is unchanged",
      pageQuery: "?utm_source=page&fbclid=page",
      props: { link: "TeL:+15551234567", linkType: "URL" },
      expectedHref: "TeL:+15551234567",
    },
  ])("$name", ({ pageQuery, props, expectedHref }): void => {
    window.history.replaceState(window.history.state, "", `/page${pageQuery}`);

    renderCta(props);

    expect(screen.getByRole("link").getAttribute("href")).toBe(expectedHref);
  });

  it.each([
    "gclid",
    "gclsrc",
    "gbraid",
    "wbraid",
    "dclid",
    "fbclid",
    "msclkid",
    "ttclid",
    "twclid",
    "li_fat_id",
    "ScCid",
    "epik",
    "rdt_cid",
    "srsltid",
  ])("when the page has %s then the link gets that parameter", (key): void => {
    window.history.replaceState(window.history.state, "", `/page?${key}=page`);

    renderCta({ link: "/book" });

    expect(screen.getByRole("link").getAttribute("href")).toBe(
      `/book?${key}=page`
    );
  });

  it("when React hydrates then the link gets the page tracking parameters", (): void => {
    window.history.replaceState(
      window.history.state,
      "",
      "/page?utm=page&utm_source=campaign&msclkid=click"
    );
    const cta = React.createElement(CTA, {
      label: "Book",
      link: "/book",
      normalizeLink: false,
      variant: "primary",
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(cta);
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/book");

    render(cta, { container, hydrate: true });

    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/book?utm_source=campaign&msclkid=click"
    );
  });
});
