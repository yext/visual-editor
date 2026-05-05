import { ThemeOptions } from "../utils/themeConfigOptions.ts";
import { msg } from "../utils/i18n/platform.ts";
import { filterMaxWidths, getMaxWidthOptions } from "./MaxWidthSelector.tsx";

afterEach(() => {
  document.getElementById("visual-editor-theme")?.remove();
});

describe("filterMaxWidths", () => {
  it("filters maxWidth options correctly", () => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .components {
        --maxWidth-pageSection-contentWidth:1024px !important;
      }
    `;

    const options = filterMaxWidths(styleEl);
    expect(options).toMatchObject({
      themeValue: "1024px",
      options: ThemeOptions.MAX_WIDTH.slice(3),
    });

    const styleEl2 = document.createElement("style");
    styleEl2.textContent = `
      .components {
        --maxWidth-pageSection-contentWidth:100px !important;
      }
    `;

    const options2 = filterMaxWidths(styleEl2);
    expect(options2).toMatchObject({
      themeValue: "100px",
      options: ThemeOptions.MAX_WIDTH,
    });

    const styleEl3 = document.createElement("style");
    styleEl3.textContent = `
      .components {
        --maxWidth-pageSection-contentWidth:2000px !important;
      }
    `;

    const options3 = filterMaxWidths(styleEl3);
    expect(options3).toMatchObject({ themeValue: "2000px", options: [] });
  });

  it("handles exceptions", () => {
    expect(
      filterMaxWidths(undefined as unknown as HTMLStyleElement)
    ).toMatchObject({ options: ThemeOptions.MAX_WIDTH });

    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .components {}
    `;

    const options = filterMaxWidths(styleEl);
    expect(options).toMatchObject({ options: ThemeOptions.MAX_WIDTH });
  });
});

describe("getMaxWidthOptions", () => {
  it("returns grouped selector options using the current theme max width", () => {
    const themeStyle = document.createElement("style");
    themeStyle.id = "visual-editor-theme";
    themeStyle.textContent = `
      .components {
        --maxWidth-pageSection-contentWidth:1024px !important;
      }
    `;
    document.head.appendChild(themeStyle);

    expect(getMaxWidthOptions()).toEqual([
      {
        label: msg(
          "fields.options.matchOtherSections",
          "Match Other Sections ({{value}})",
          { value: "1024px" }
        ),
        value: "theme",
      },
      ...ThemeOptions.MAX_WIDTH.slice(3),
      {
        label: msg("fields.options.fullWidth", "Full Width"),
        value: "fullWidth",
      },
    ]);
  });

  it("returns all max width options when the theme style element is unavailable", () => {
    expect(getMaxWidthOptions()).toBe(ThemeOptions.MAX_WIDTH);
  });
});
