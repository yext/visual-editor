import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installPassThroughUrlParameters } from "./passThroughUrlParameters.ts";

function activateLink(
  link: HTMLAnchorElement,
  type = "click",
  button = 0
): void {
  const target = link.firstElementChild ?? link;
  target.addEventListener(type, (event) => event.preventDefault(), {
    once: true,
  });
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, cancelable: true, button })
  );
}

describe("installPassThroughUrlParameters", () => {
  let removeListeners: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    removeListeners = installPassThroughUrlParameters();
  });

  afterEach(() => {
    removeListeners();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    window.history.replaceState(null, "", window.location.pathname);
    document.body.replaceChildren();
  });

  it("preserves destination parameters and the fragment", () => {
    window.history.replaceState(
      null,
      "",
      "?utm%5Fsource=ad&custom=a%20b+c%2f&custom=second&empty&%71=coords&initialLocation=address&draft=preview&history=old&xYextDebugPage=true"
    );
    const link = document.createElement("a");
    link.href = "/store?utm_source=store&local=%20#hours";
    link.append(document.createElement("span"));
    document.body.append(link);

    activateLink(link);

    expect(link.getAttribute("href")).toBe(
      "/store?utm_source=store&local=%20&custom=a%20b+c%2f&empty#hours"
    );
    vi.runOnlyPendingTimers();
    expect(link.getAttribute("href")).toBe(
      "/store?utm_source=store&local=%20#hours"
    );
  });

  it("uses the current query for each activation of a link added after setup", () => {
    const link = document.createElement("a");
    link.href = "https://delivery.example.test/order";
    link.target = "_blank";
    document.body.append(link);
    window.history.replaceState(null, "", "?campaign=first");
    activateLink(link, "auxclick", 1);
    expect(link.href).toBe(
      "https://delivery.example.test/order?campaign=first"
    );

    window.history.pushState(null, "", "?campaign=second");
    activateLink(link);
    expect(link.href).toBe(
      "https://delivery.example.test/order?campaign=second"
    );

    link.href = "/changed-by-page";
    vi.runOnlyPendingTimers();
    expect(link.getAttribute("href")).toBe("/changed-by-page");
  });

  it.each([
    { href: "#results", download: false },
    { href: "mailto:test@example.test", download: false },
    { href: "/file.pdf", download: true },
  ])("keeps the href for $href", ({ href, download }) => {
    window.history.replaceState(null, "", "?campaign=ad");
    const link = document.createElement("a");
    link.href = href;
    if (download) {
      link.download = "";
    }
    document.body.append(link);

    activateLink(link);

    expect(link.getAttribute("href")).toBe(href);
  });

  it("stops changing hrefs after cleanup", () => {
    const link = document.createElement("a");
    link.href = "/store";
    document.body.append(link);
    window.history.replaceState(null, "", "?campaign=ad");
    removeListeners();

    activateLink(link);

    expect(link.getAttribute("href")).toBe("/store");
  });
});
