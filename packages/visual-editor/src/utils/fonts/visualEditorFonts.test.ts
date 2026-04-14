import { describe, it, expect } from "vitest";
import { ThemeData } from "../../internal/types/themeData.ts";
import {
  constructFontSelectOptions,
  filterInUseFontRegistries,
  type FontRegistry,
  defaultFonts,
  constructGoogleFontLinkTags,
  generateCustomFontLinkData,
  getFacePathsFromFonts,
  getFontStyleOptions,
} from "./visualEditorFonts.ts";

describe("filterInUseFontRegistries", () => {
  it("returns the specifications for all built-in fonts used in the theme", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Oi', sans-serif",
      "--fontFamily-button-fontFamily": "'Adamina', serif",
    };

    const expected: FontRegistry = {
      Oi: {
        italics: false,
        weights: [400],
        fallback: "sans-serif",
      },
      Adamina: {
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

  it("returns empty registries when theme data is empty", () => {
    expect(filterInUseFontRegistries({}, defaultFonts)).toEqual({
      inUseGoogleFonts: {},
      inUseCustomFonts: {},
    });
  });

  it("returns empty registries when no font families are defined in the theme", () => {
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

  it("returns empty registries if the list of available fonts is empty", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Open Sans', sans-serif",
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      {}
    );
    expect(inUseGoogleFonts).toEqual({});
    expect(inUseCustomFonts).toEqual({});
  });

  it("handles malformed or empty fontFamily values gracefully", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "",
      "--fontFamily-h2-fontFamily": null,
      "--fontFamily-button-fontFamily": "'Adamina', serif",
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual({
      Adamina: {
        italics: false,
        weights: [400],
        fallback: "serif",
      },
    });
    expect(inUseCustomFonts).toEqual({});
  });

  it("does not include duplicate fonts even if used multiple times", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Open Sans', sans-serif",
      "--fontFamily-h2-fontFamily": "'Open Sans', sans-serif",
      "--fontFamily-body-fontFamily": "'Open Sans', sans-serif",
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual({
      "Open Sans": {
        italics: true,
        minWeight: 300,
        maxWeight: 800,
        fallback: "sans-serif",
      },
    });
    expect(inUseCustomFonts).toEqual({});
  });

  it("handles custom fonts keyed by family name", () => {
    const themeData: ThemeData = {
      "--fontFamily-h1-fontFamily": "'Custom Font', sans-serif",
      "--fontFamily-h2-fontFamily": "'Open Sans', sans-serif",
    };
    const customFonts: FontRegistry = {
      "Custom Font": {
        italics: false,
        weights: [400],
        fallback: "sans-serif",
        facePath: "y-fonts/custom-font.css",
        variants: [],
      },
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts,
      customFonts
    );
    expect(inUseGoogleFonts).toEqual({
      "Open Sans": {
        italics: true,
        minWeight: 300,
        maxWeight: 800,
        fallback: "sans-serif",
      },
    });
    expect(inUseCustomFonts).toEqual(customFonts);
  });

  it("resolves var() references to the default header font", () => {
    const themeData: ThemeData = {
      "--fontFamily-headers-defaultFont": "'Open Sans', sans-serif",
      "--fontFamily-h1-fontFamily": "var(--fontFamily-headers-defaultFont)",
    };

    const { inUseGoogleFonts, inUseCustomFonts } = filterInUseFontRegistries(
      themeData,
      defaultFonts
    );
    expect(inUseGoogleFonts).toEqual({
      "Open Sans": {
        italics: true,
        minWeight: 300,
        maxWeight: 800,
        fallback: "sans-serif",
      },
    });
    expect(inUseCustomFonts).toEqual({});
  });
});

describe("custom font helpers", () => {
  it("builds font select options from family names", () => {
    const customFonts: FontRegistry = {
      EBB_Melvyn_Regular: {
        italics: false,
        weights: [400, 700],
        fallback: "sans-serif",
        facePath: "y-fonts/ebbmelvynregular.css",
        variants: [],
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

  it("builds custom font links from face paths without changing internal hyphens", () => {
    expect(
      generateCustomFontLinkData(
        ["y-fonts/ebbmelvynregular.css", "y-fonts/foo-bar.css"],
        "./"
      )
    ).toEqual([
      {
        href: "./y-fonts/ebbmelvynregular.css",
        rel: "stylesheet",
      },
      {
        href: "./y-fonts/foo-bar.css",
        rel: "stylesheet",
      },
    ]);
  });

  it("reads face paths from the registry", () => {
    expect(
      getFacePathsFromFonts({
        EBB_Melvyn_Regular: {
          italics: false,
          weights: [400],
          fallback: "sans-serif",
          facePath: "y-fonts/ebbmelvynregular.css",
          variants: [],
        },
      })
    ).toEqual(["y-fonts/ebbmelvynregular.css"]);
  });

  it("supports already-relative custom font paths", () => {
    expect(
      generateCustomFontLinkData(["./y-fonts/ebbmelvynregular.css"], "./")
    ).toEqual([
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

  it("returns an empty string if the font registry is empty", () => {
    expect(constructGoogleFontLinkTags({})).toBe("");
  });

  it("creates a correct link for a single static font without italics", () => {
    const fonts: FontRegistry = {
      Roboto: {
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

  it("creates a correct link for a single static font with italics", () => {
    const fonts: FontRegistry = {
      Lato: {
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

  it("creates a correct link for a single variable font without italics", () => {
    const fonts: FontRegistry = {
      "Open Sans": {
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

  it("creates a correct link for a single variable font with italics", () => {
    const fonts: FontRegistry = {
      "Open Sans": {
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

  it("handles variable fonts where min and max weight are the same", () => {
    const fonts: FontRegistry = {
      "Single Weight Var": {
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

  it("creates separate link tags for multiple fonts", () => {
    const fonts: FontRegistry = {
      Roboto: {
        weights: [400],
        italics: false,
        fallback: "sans-serif",
      },
      Lato: {
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

  it("creates separate link tags for many fonts", () => {
    const fonts: FontRegistry = {
      Font1: { weights: [400], italics: false, fallback: "sans-serif" },
      Font2: { weights: [400], italics: false, fallback: "sans-serif" },
      Font3: { weights: [400], italics: false, fallback: "sans-serif" },
      Font4: { weights: [400], italics: false, fallback: "sans-serif" },
      Font5: { weights: [400], italics: false, fallback: "sans-serif" },
      Font6: { weights: [400], italics: false, fallback: "sans-serif" },
      Font7: { weights: [400], italics: false, fallback: "sans-serif" },
      Font8: { weights: [400], italics: false, fallback: "sans-serif" },
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

  it("resolves custom fonts by family name", () => {
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
          "Custom Display": {
            italics: false,
            weights: [400],
            fallback: "sans-serif",
          },
        },
      })
    ).toMatchObject([{ value: "normal" }]);
  });
});
