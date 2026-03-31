import Handlebars from "handlebars";
import { describe, expect, it, vi } from "vitest";
import { processHandlebarsTemplate } from "./customCodeHandlebars.ts";

const document = {
  __: {
    name: "dev-location",
  },
  id: "store-123",
  name: "Main Lobby",
  c_internalStoreCode: "1",
  address: {
    city: "Highland Village",
    region: "TX",
    postalCode: "75077",
  },
  c_category: "Chicken Wings",
  c_optionalSegment: "",
};

describe("CustomCodeSection Handlebars helpers", () => {
  it("when html contains no Handlebars syntax then it returns the original html", () => {
    const plainHtml = `<div><p>Plain HTML content</p></div>`;

    const renderedHtml = processHandlebarsTemplate(plainHtml, document);

    expect(renderedHtml).toBe(plainHtml);
  });

  it("when slugify receives mixed literal and field arguments then it returns a single normalized slug", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<a href="https://locations.wingstop.com/{{slugify "wingstop-" c_internalStoreCode "-" address.city "-" address.region "-" address.postalCode "/flavors"}}">Explore</a>`,
      document
    );

    expect(renderedHtml).toContain(
      "https://locations.wingstop.com/wingstop-1-highland-village-tx-75077/flavors"
    );
  });

  it("when slugifyPath receives path segments then it joins normalized segments with slashes", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<a href="/{{slugifyPath "locations" address.region address.city name}}">View Location</a>`,
      document
    );

    expect(renderedHtml).toContain(
      'href="/locations/tx/highland-village/main-lobby"'
    );
  });

  it("when slugify receives a top-level field then it normalizes that field value", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<span>{{slugify name}}</span>`,
      document
    );

    expect(renderedHtml).toContain("<span>main-lobby</span>");
  });

  it("when slugify receives a top-level id field then it preserves valid slug characters", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<span>{{slugify id}}</span>`,
      document
    );

    expect(renderedHtml).toContain("<span>store-123</span>");
  });

  it("when slugifyPath receives a mix of constants and fields then it builds a normalized nested path", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<a href="/{{slugifyPath "categories" c_category address.city}}">View Category</a>`,
      document
    );

    expect(renderedHtml).toContain(
      'href="/categories/chicken-wings/highland-village"'
    );
  });

  it("when slugifyPath receives empty segments then it omits them from the output path", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<a href="/{{slugifyPath "locations" c_optionalSegment address.region address.city}}">View Location</a>`,
      document
    );

    expect(renderedHtml).toContain('href="/locations/tx/highland-village"');
  });

  it("when Handlebars rendering fails then it logs the error and returns the original html", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const invalidHtml = `<span>{{#if name}}</span>`;

    const renderedHtml = processHandlebarsTemplate(invalidHtml, document);

    expect(renderedHtml).toBe(invalidHtml);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Handlebars template render failed, falling back to raw HTML",
      expect.objectContaining({
        templateIdentifier: "dev-location",
      })
    );

    consoleErrorSpy.mockRestore();
  });

  it("when Handlebars compile throws then it returns the original html", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const compileSpy = vi
      .spyOn(Handlebars, "compile")
      .mockImplementation(() => {
        throw new Error("compile failed");
      });
    const templateHtml = `<span>{{name}}</span>`;

    const renderedHtml = processHandlebarsTemplate(templateHtml, document);

    expect(renderedHtml).toBe(templateHtml);

    compileSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
