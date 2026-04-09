import { describe, it, expect } from "vitest";
import { ThemeData } from "../../internal/types/themeData.ts";
import {
  constructFontSelectOptions,
  filterInUseFontRegistries,
  FontRegistry,
  defaultFonts,
  constructGoogleFontLinkTags,
  generateCustomFontLinkData,
  getCustomFontCssIdsFromDisplayNames,
  getCustomFontCssIdsFromNames,
  getCustomFontCssIdsFromPreloads,
  getFontStyleOptions,
} from "./visualEditorFonts.ts";

describe("extractInUseFontFamilies", () => {
  it("should return the specifications for all fonts used in the theme", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Oi', sans-serif",
      "--fontFamily-button-fontFamily": "'Adamina', serif",
    };

    const expected: FontRegistry = {
      Oi: {
        displayName: "Oi",
        italics: false,
        weights: [400],
        fallback: "sans-serif",
      },
      Adamina: {
        displayName: "Adamina",
        italics: false,
        weights: [400],
        fallback: "serif",
      },
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual(expected);
    expect(inUseCustomFonts).toEqual({});
  });

  it("should return an empty object if theme data is empty", () => {
    const themeData: ThemeData = {};
    expect(filterInUseFontRegistries(themeData, defaultFonts)).toEqual({
      inUseGoogleFonts: {},
      inUseCustomFonts: {},
    });
  });

  it("should return an empty object if no font families are defined in the theme", () => {
    const themeData: ThemeData = {
      "--colors-palette-primary": "#CF0A2C",
      "--fontSize-h1-fontSize": "48px",
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual({});
    expect(inUseCustomFonts).toEqual({});
  });

  it("should return an empty object if the list of available fonts is empty", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Open Sans', sans-serif",
    };
    const emptyAvailableFonts = {};

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      emptyAvailableFonts
    );
    expect(inUseGoogleFonts).toEqual({});
    expect(inUseCustomFonts).toEqual({});
  });

  it("should handle malformed or empty fontFamily values gracefully", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "",
      "--fontFamily-h2-fontFamily": null,
      "--fontFamily-button-fontFamily": "'Adamina', serif",
    };
    const expected: FontRegistry = {
      Adamina: {
        displayName: "Adamina",
        italics: false,
        weights: [400],
        fallback: "serif",
      },
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual(expected);
    expect(inUseCustomFonts).toEqual({});
  });

  it("should not include duplicate fonts, even if used multiple times", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Open Sans', sans-serif",
      "--fontFamily-h2-fontFamily": "'Open Sans', sans-serif",
      "--fontFamily-body-fontFamily": "'Open Sans', sans-serif",
    };

    const expected: FontRegistry = {
      "Open Sans": {
        displayName: "Open Sans",
        italics: true,
        minWeight: 300,
        maxWeight: 800,
        fallback: "sans-serif",
      },
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual(expected);
    expect(inUseCustomFonts).toEqual({});
  });

  it("should handle custom fonts", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Custom Font', sans-serif",
      "--fontFamily-h2-fontFamily": "'Open Sans', sans-serif",
    };
    const customFonts: FontRegistry = {
      "custom-font-key": {
        name: "custom-font-regular",
        displayName: "Custom Font",
        italics: false,
        weights: [400],
        fallback: "sans-serif",
      },
    };

    const expectedGoogleFonts: FontRegistry = {
      "Open Sans": {
        displayName: "Open Sans",
        italics: true,
        minWeight: 300,
        maxWeight: 800,
        fallback: "sans-serif",
      },
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts,
      customFonts
    );
    expect(inUseGoogleFonts).toEqual(expectedGoogleFonts);
    expect(inUseCustomFonts).toEqual({
      "custom-font-regular": customFonts["custom-font-key"],
    });
  });

  it("should resolve var() references to default header font", () => {
    const themeData: ThemeData = {
      "--fontFamily-headers-defaultFont": "'Open Sans', sans-serif",
      "--fontFamily-h1-fontFamily": "var(--fontFamily-headers-defaultFont)",
    };

    const expected: FontRegistry = {
      "Open Sans": {
        displayName: "Open Sans",
        italics: true,
        minWeight: 300,
        maxWeight: 800,
        fallback: "sans-serif",
      },
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual(expected);
    expect(inUseCustomFonts).toEqual({});
  });
});

describe("custom font helpers", () => {
  it("should build font select options from display names", () => {
    const customFonts: FontRegistry = {
      "ebb-melvyn": {
        name: "ebbmelvynregular-regular",
        displayName: "EBB_Melvyn_Regular",
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
      },
    };

    expect(constructFontSelectOptions(customFonts)).toEqual([
      {
        label: "EBB_Melvyn_Regular",
        value:
          "'EBB_Melvyn_Regular', 'EBB_Melvyn_Regular Fallback', sans-serif",
      },
    ]);
  });

  it("should build custom font links from parsed family ids", () => {
    expect(generateCustomFontLinkData(["ebbmelvynregular"], "./")).toEqual([
      {
        href: "./y-fonts/ebbmelvynregular.css",
        rel: "stylesheet",
      },
    ]);
  });

  it("should keep internal hyphens when parsing custom font family ids", () => {
    expect(generateCustomFontLinkData(["foo-bar"], "./")).toEqual([
      {
        href: "./y-fonts/foo-bar.css",
        rel: "stylesheet",
      },
    ]);
  });

  it("should build custom font css ids from preload paths", () => {
    expect(
      getCustomFontCssIdsFromPreloads(["/y-fonts/foo-bar-regular.woff2"])
    ).toEqual(["foo-bar"]);
  });

  it("should build custom font css ids from font names", () => {
    expect(getCustomFontCssIdsFromNames(["foo-bar-regular"])).toEqual([
      "foo-bar",
    ]);
  });

  it("should build legacy custom font css ids from display names", () => {
    expect(getCustomFontCssIdsFromDisplayNames(["EBB_Melvyn_Regular"])).toEqual(
      ["ebbmelvynregular"]
    );
  });

  it("should build custom font links from normalized css ids", () => {
    expect(generateCustomFontLinkData(["ebbmelvynregular"], "./")).toEqual([
      {
        href: "./y-fonts/ebbmelvynregular.css",
        rel: "stylesheet",
      },
    ]);
  });
});

describe("constructGoogleFontLinkTags", () => {
  const preconnectTags =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">\n';

  it("should return an empty string if the font registry is empty", () => {
    const fonts: FontRegistry = {};
    expect(constructGoogleFontLinkTags(fonts)).toBe("");
  });

  it("should create a correct link for a single static font without italics", () => {
    const fonts: FontRegistry = {
      Roboto: {
        name: "Roboto",
        displayName: "Roboto",
        weights: [400, 700],
        italics: false,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create a correct link for a single static font with italics", () => {
    const fonts: FontRegistry = {
      Lato: {
        name: "Lato",
        displayName: "Lato",
        weights: [400, 900],
        italics: true,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,900;1,400;1,900&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create a correct link for a single variable font without italics", () => {
    const fonts: FontRegistry = {
      "Open Sans": {
        displayName: "Open Sans",
        minWeight: 300,
        maxWeight: 800,
        italics: false,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create a correct link for a single variable font with italics", () => {
    const fonts: FontRegistry = {
      "Open Sans": {
        displayName: "Open Sans",
        minWeight: 300,
        maxWeight: 800,
        italics: true,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should handle variable fonts where min and max weight are the same", () => {
    const fonts: FontRegistry = {
      "Single Weight Var": {
        name: "Single Weight Var",
        displayName: "Single Weight Var",
        minWeight: 500,
        maxWeight: 500,
        italics: true,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Single+Weight+Var:ital,wght@0,500;1,500&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create separate link tags for multiple fonts", () => {
    const fonts: FontRegistry = {
      Roboto: {
        name: "Roboto",
        displayName: "Roboto",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Lato: {
        name: "Lato",
        displayName: "Lato",
        minWeight: 300,
        maxWeight: 700,
        italics: true,
        fallback: "sans-serif",
      },
    };
    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">';
    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });

  it("should create separate link tags for many fonts", () => {
    const fonts: FontRegistry = {
      Font1: {
        name: "Font1",
        displayName: "Font1",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Font2: {
        name: "Font2",
        displayName: "Font2",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Font3: {
        name: "Font3",
        displayName: "Font3",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Font4: {
        name: "Font4",
        displayName: "Font4",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Font5: {
        name: "Font5",
        displayName: "Font5",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Font6: {
        name: "Font6",
        displayName: "Font6",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Font7: {
        name: "Font7",
        displayName: "Font7",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Font8: {
        name: "Font8",
        displayName: "Font8",
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
    };

    const expected =
      preconnectTags +
      '<link href="https://fonts.googleapis.com/css2?family=Font1:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Font2:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Font3:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Font4:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Font5:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Font6:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Font7:wght@400&display=swap" rel="stylesheet">\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Font8:wght@400&display=swap" rel="stylesheet">';

    expect(constructGoogleFontLinkTags(fonts)).toBe(expected);
  });
});

describe("getFontStyleOptions", () => {
  const createPreviewIframe = () => {
    document.body.replaceChildren();
    const iframe = document.createElement("iframe");
    iframe.id = "preview-frame";
    document.body.appendChild(iframe);
    return iframe;
  };

  it("returns both options when the selected font supports italics", () => {
    const iframe = createPreviewIframe();
    const iframeDocument = iframe.contentDocument!;
    const styleTag = iframeDocument.createElement("style");
    styleTag.id = "visual-editor-theme";
    styleTag.textContent =
      ".components{--fontFamily-body-fontFamily:'Open Sans', sans-serif !important;}";
    iframeDocument.head.appendChild(styleTag);

    expect(
      getFontStyleOptions({
        fontCssVariable: "--fontFamily-body-fontFamily",
        fontList: defaultFonts,
      })
    ).toMatchObject([{ value: "normal" }, { value: "italic" }]);
  });

  it("filters italic out when the selected font does not support italics", () => {
    const iframe = createPreviewIframe();
    const iframeDocument = iframe.contentDocument!;
    const styleTag = iframeDocument.createElement("style");
    styleTag.id = "visual-editor-theme";
    styleTag.textContent =
      ".components{--fontFamily-body-fontFamily:'Adamina', serif !important;}";
    iframeDocument.head.appendChild(styleTag);

    expect(
      getFontStyleOptions({
        fontCssVariable: "--fontFamily-body-fontFamily",
        fontList: defaultFonts,
      })
    ).toMatchObject([{ value: "normal" }]);
  });

  it("resolves custom fonts by display name instead of registry key", () => {
    const iframe = createPreviewIframe();
    const iframeDocument = iframe.contentDocument!;
    const styleTag = iframeDocument.createElement("style");
    styleTag.id = "visual-editor-theme";
    styleTag.textContent =
      ".components{--fontFamily-body-fontFamily:'Custom Display', sans-serif !important;}";
    iframeDocument.head.appendChild(styleTag);

    expect(
      getFontStyleOptions({
        fontCssVariable: "--fontFamily-body-fontFamily",
        fontList: {
          "custom-font-key": {
            name: "custom-font-regular",
            displayName: "Custom Display",
            italics: false,
            weights: [400],
            fallback: "sans-serif",
          },
        },
      })
    ).toMatchObject([{ value: "normal" }]);
  });

  it("preserves caller-provided styleOptions before the theme style tag loads", () => {
    createPreviewIframe();

    expect(
      getFontStyleOptions({
        fontCssVariable: "--fontFamily-body-fontFamily",
        fontList: defaultFonts,
        styleOptions: [
          { label: "Italic First", value: "italic" },
          { label: "Normal Second", value: "normal" },
        ],
      })
    ).toEqual([
      { label: "Italic First", value: "italic" },
      { label: "Normal Second", value: "normal" },
    ]);
  });
});
