import { describe, it, expect } from "vitest";
import { normalizeLink } from "./normalizeLink.ts";

describe("normalizeLink", () => {
  it("should return '' if content is null", () => {
    expect(normalizeLink(null as any)).toBe("");
  });

  it("should return an empty string if content is empty", () => {
    expect(normalizeLink("")).toBe("");
  });

  it("should convert all characters to lowercase", () => {
    expect(normalizeLink("Hello World")).toBe("hello-world");
  });

  it("should preserve '?' but still remove illegal characters like '>'", () => {
    expect(normalizeLink("hello?world>")).toBe("hello?world");
  });

  it("should preserve '%'", () => {
    expect(normalizeLink("&query=Address%City%ZipCode")).toBe(
      "&query=address%city%zipcode"
    );
  });

  it("should preserve '#' but still remove illegal characters like '!'", () => {
    expect(normalizeLink("hello#world!")).toBe("hello#world");
  });

  it("should replace spaces with hyphens but keep the '?'", () => {
    expect(normalizeLink("search results? query")).toBe(
      "search-results?-query"
    );
  });

  it("should remove illegal characters (like emoji or math symbols)", () => {
    expect(normalizeLink("hello🚀world")).toBe("helloworld");
    expect(normalizeLink("illegal>char<")).toBe("illegalchar");
  });

  it("should remove repeated hyphens and replace with a single hyphen", () => {
    expect(normalizeLink("link--with---hyphens")).toBe("link-with-hyphens");
  });

  it("should remove dangling hyphens at the end or before slashes", () => {
    expect(normalizeLink("link-")).toBe("link");
    expect(normalizeLink("link-hello--")).toBe("link-hello");
    expect(normalizeLink("folder-/page-")).toBe("folder/page");
  });

  it("should handle complex strings with '?' correctly", () => {
    expect(normalizeLink("What is the Price? Now!")).toBe(
      "what-is-the-price?-now"
    );

    expect(normalizeLink("valid~[link]with*various_$_chars?日本語123")).toBe(
      "valid~[link]with*various_$_chars?日本語123"
    );
  });

  it("should handle multiple '?' correctly", () => {
    expect(normalizeLink("is?it?working")).toBe("is?it?working");
  });

  it("should preserve https:// and not mangle the slashes", () => {
    const input = "https://MyWebsite.com/Page Name?Query=True";
    expect(normalizeLink(input)).toBe(
      "https://mywebsite.com/page-name?query=true"
    );
  });

  it("should not normalize links for EMAIL and PHONE link types", () => {
    const email = "test@email.com";
    const phone = "+1 (123) 456-7890";
    expect(normalizeLink(email, "EMAIL")).toBe(email);
    expect(normalizeLink(phone, "PHONE")).toBe(phone);
  });
});
