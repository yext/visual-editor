import { describe, expect, it } from "vitest";
import { mergePageQueryParameters } from "./PageQueryContext.ts";

describe("mergePageQueryParameters", () => {
  it.each([
    {
      href: "../locations?utm_source=store&local=%20&local=two#hours",
      pageQuery:
        "?utm%5Fsource=ad&&custom=a%20b+c%2f&custom=second&bare&blank=&gclid=AbC",
      expected:
        "../locations?utm_source=store&local=%20&local=two&custom=a%20b+c%2f&bare&blank=&gclid=AbC#hours",
    },
    {
      href: "https://order.example.com/basket#cart",
      pageQuery: "?utm_medium=cpc",
      expected: "https://order.example.com/basket?utm_medium=cpc#cart",
    },
    {
      href: "//order.example.com/basket?",
      pageQuery: "?utm_medium=cpc",
      expected: "//order.example.com/basket?utm_medium=cpc",
    },
    {
      href: "/locations?manual=1&#hours",
      pageQuery: "?campaign=summer",
      expected: "/locations?manual=1&campaign=summer#hours",
    },
    {
      href: "/locations?q=store",
      pageQuery:
        "?%71=city&initialLocation=coords&draft=token&history=date&xYextDebugPage=true&utm_source=ad",
      expected: "/locations?q=store&utm_source=ad",
    },
    {
      href: "/locations?utm_source=store#hours",
      pageQuery: "?utm_source=ad&draft=token",
      expected: "/locations?utm_source=store#hours",
    },
    { href: "/locations", pageQuery: "", expected: "/locations" },
  ])(
    "when the page query is $pageQuery then the link is $expected",
    ({ href, pageQuery, expected }): void => {
      expect(
        mergePageQueryParameters(
          href,
          pageQuery,
          "https://site.example.com/page"
        )
      ).toBe(expected);
    }
  );

  it.each(["", "#hours", "mailto:a@example.com", "tel:123", "https://["])(
    "when the link is %s then its destination stays the same",
    (href): void => {
      expect(
        mergePageQueryParameters(
          href,
          "?campaign=summer",
          "https://site.example.com"
        )
      ).toBe(href);
    }
  );
});
