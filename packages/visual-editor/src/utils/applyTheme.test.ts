import { afterEach, describe, it, expect, vi } from "vitest";
import {
  applyTheme,
  internalApplyTheme,
  PUCK_PREVIEW_IFRAME_ID,
  THEME_STYLE_TAG_ID,
  updateThemeInEditor,
} from "./applyTheme.ts";
import { legacyThemeVariables } from "../internal/theme/legacyTheme.ts";

describe("fixed theme application", () => {
  it("applies frozen defaults and only recognized new field values", () => {
    const result = applyTheme(
      {
        __: {
          theme: JSON.stringify({
            colorForeground: "#123456",
            "--colors-palette-primary": "#abcdef",
            "--unknown": "red",
          }),
        },
      },
      "./",
      "base"
    );
    expect(result.startsWith("base")).toBe(true);
    expect(result).toContain("--ve-color-foreground:#123456 !important");
    expect(result).toContain("--colors-palette-primary:#CF0A2C !important");
    expect(result).not.toContain("#abcdef");
    expect(result).not.toContain("--unknown");
    expect(result).not.toContain("--ve-color-foreground-contrast");
    expect(result).toContain("fonts.googleapis.com");
  });
  it("applies variables at the document root and includes the shared CSS", () => {
    const style = document.createElement("style");
    style.textContent = internalApplyTheme({ colorForeground: "#123456" });
    document.head.appendChild(style);
    try {
      expect(
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("--ve-color-foreground")
      ).toBe("#123456");
      const rules = [...style.sheet!.cssRules] as CSSStyleRule[];
      expect(rules[0].selectorText).toBe(":root");
      expect(style.textContent).not.toContain(".components{");
      expect(applyTheme({}, "./")).toContain("--ve-color-foreground:");
    } finally {
      style.remove();
    }
  });
  it("emits every frozen declaration, including contrast values", () => {
    const result = internalApplyTheme();
    for (const [key, value] of Object.entries(legacyThemeVariables))
      expect(result).toContain(`${key}:${value} !important`);
    expect(result).toContain("--colors-palette-primary-contrast:");
    expect(result).toContain("--ve-color-foreground:#000000 !important");
  });
  it("applies the foreground default on published pages without a saved theme", () => {
    expect(applyTheme({}, "./")).toContain(
      "--ve-color-foreground:#000000 !important"
    );
  });
  it("ignores old font assets even when a new color is set", () => {
    const result = applyTheme(
      {
        __: {
          theme: JSON.stringify({
            colorForeground: "red",
            __customFontAssets: {
              stylesheetPaths: ["old.css"],
              preloads: ["old.woff2"],
            },
          }),
        },
      },
      "./"
    );
    expect(result).not.toContain("old.css");
    expect(result).not.toContain("old.woff2");
  });
  it("handles malformed or non-object published themes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const theme of ["invalid", "null", "[]"])
      expect(applyTheme({ __: { theme } }, "./")).toContain(
        "--colors-palette-primary:#CF0A2C"
      );
    warn.mockRestore();
  });
  it("restores the field default when reapplying a theme with no saved value", async () => {
    await updateThemeInEditor({ colorForeground: "red" }, true);
    expect(document.getElementById(THEME_STYLE_TAG_ID)?.textContent).toContain(
      "--ve-color-foreground:red"
    );
    await updateThemeInEditor({}, true);
    expect(document.getElementById(THEME_STYLE_TAG_ID)?.textContent).toContain(
      "--ve-color-foreground:#000000"
    );
  });
});
describe("updateThemeInEditor", () => {
  afterEach(() => {
    document.getElementById(PUCK_PREVIEW_IFRAME_ID)?.remove();
    document.getElementById(THEME_STYLE_TAG_ID)?.remove();
    document
      .querySelectorAll(
        'link[href*="fonts.googleapis.com"]:not([data-visual-editor-font="true"]), link[href*="y-fonts"]:not([data-visual-editor-font="true"])'
      )
      .forEach((link) => link.remove());
  });

  it("updates the existing iframe theme style tag without duplicating it", async () => {
    const iframe = document.createElement("iframe");
    iframe.id = PUCK_PREVIEW_IFRAME_ID;
    document.body.appendChild(iframe);

    const iframeStyleTag = iframe.contentDocument!.createElement("style");
    iframeStyleTag.id = THEME_STYLE_TAG_ID;
    iframe.contentDocument!.head.appendChild(iframeStyleTag);

    await updateThemeInEditor({ colorForeground: "#123456" }, false);

    expect(
      iframe.contentDocument!.querySelectorAll(`#${THEME_STYLE_TAG_ID}`)
    ).toHaveLength(1);
    expect(iframeStyleTag.textContent).toContain(
      "--ve-color-foreground:#123456"
    );
    expect(iframeStyleTag.textContent).toContain(":root{");
    expect(iframeStyleTag.textContent).toContain("--ve-color-foreground:");
    expect(document.getElementById(THEME_STYLE_TAG_ID)?.textContent).toBe(
      iframeStyleTag.textContent
    );
  });

  it("waits for the real iframe theme style tag", async () => {
    const iframe = document.createElement("iframe");
    iframe.id = PUCK_PREVIEW_IFRAME_ID;
    document.body.appendChild(iframe);

    await updateThemeInEditor({ colorForeground: "#123456" }, false);

    expect(
      iframe.contentDocument!.getElementById(THEME_STYLE_TAG_ID)
    ).toBeNull();

    const iframeStyleTag = iframe.contentDocument!.createElement("style");
    iframeStyleTag.id = THEME_STYLE_TAG_ID;
    iframe.contentDocument!.head.appendChild(iframeStyleTag);
    const mutationTarget = document.createElement("div");
    document.body.appendChild(mutationTarget);

    await vi.waitFor(() => {
      expect(iframeStyleTag.textContent).toContain(
        "--ve-color-foreground:#123456"
      );
    });
    mutationTarget.remove();
  });
});
