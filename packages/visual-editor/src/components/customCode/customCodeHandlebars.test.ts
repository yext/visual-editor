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
  c_category: "Donut Shop",
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

  it("when slugify receives path segments and separators then it returns a normalized path", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<a href="/{{slugify "locations/" address.region "/" address.city "/" name}}">View Location</a>`,
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

  it("when slugify receives a mix of constants and fields then it builds a normalized nested path", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<a href="/{{slugify "categories/" c_category "/" address.city}}">View Category</a>`,
      document
    );

    expect(renderedHtml).toContain(
      'href="/categories/donut-shop/highland-village"'
    );
  });

  it("when slugify receives empty segments then it omits them from the output path", () => {
    const renderedHtml = processHandlebarsTemplate(
      `<a href="/{{slugify "locations/" c_optionalSegment address.region "/" address.city}}">View Location</a>`,
      document
    );

    expect(renderedHtml).toContain('href="/locations/tx/highland-village"');
  });

  it("when Handlebars rendering fails then it logs the error and returns the original html", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const invalidHtml = `<span>{{#if name}}</span>`;

    const renderedHtml = processHandlebarsTemplate(invalidHtml, document);

    expect(renderedHtml).toBe(invalidHtml);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Handlebars template render failed, falling back to raw HTML",
      expect.objectContaining({
        templateIdentifier: "dev-location",
      })
    );

    consoleWarnSpy.mockRestore();
  });

  it("when Handlebars compile throws then it returns the original html", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
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
    consoleWarnSpy.mockRestore();
  });
});
