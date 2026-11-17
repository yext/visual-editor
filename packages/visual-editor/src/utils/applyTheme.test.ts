import { afterEach, describe, it, expect, vi } from "vitest";
import {
  applyTheme,
  PUCK_PREVIEW_IFRAME_ID,
  THEME_STYLE_TAG_ID,
  updateThemeInEditor,
} from "./applyTheme.ts";
import { StreamDocument } from "./types/StreamDocument.ts";
import { migrateThemeData } from "../components/migrations/themeDataLabels.ts";
import { buildThemeCss } from "./dynamicTheme.ts";
import { THEME_DATA_TAG_ID } from "../hooks/useThemeData.ts";

describe("versioned theme rendering", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("publishes only dynamic CSS for a versioned payload and loads all entry fonts", () => {
    const theme = migrateThemeData();
    theme.typography[0].fontFamily = "'Roboto', sans-serif";
    theme.actions[0].fontFamily = "'Lato', sans-serif";
    const markup = applyTheme(
      { __: { theme: JSON.stringify(theme) } } as StreamDocument,
      "./"
    );
    expect(markup).toContain(buildThemeCss(theme));
    expect(markup).toContain("family=Roboto");
    expect(markup).toContain("family=Lato");
    expect(markup).toContain(`id="${THEME_DATA_TAG_ID}"`);
    expect(markup).not.toContain("--colors-palette");
    expect(markup).toContain(":where(.ve-theme-on-dark)");
  });

  it("replaces all CSS, payload data and fonts in the editor and iframe", async () => {
    const iframe = document.createElement("iframe");
    iframe.id = PUCK_PREVIEW_IFRAME_ID;
    document.body.appendChild(iframe);
    const frameStyle = iframe.contentDocument!.createElement("style");
    frameStyle.id = THEME_STYLE_TAG_ID;
    iframe.contentDocument!.head.appendChild(frameStyle);
    const first = migrateThemeData();
    await updateThemeInEditor(first, false);
    expect(frameStyle.textContent).toBe(buildThemeCss(first));
    const second = migrateThemeData();
    second.colors = [
      {
        id: "new-pair",
        label: "New",
        background: "#ABCDEF",
        foreground: "#123456",
      },
    ];
    second.typography = [
      {
        ...second.typography[0],
        id: "new-text",
        fontFamily: "'Roboto', sans-serif",
      },
    ];
    second.actions = [
      {
        ...second.actions[0],
        id: "new-action",
        fontFamily: "'Lato', sans-serif",
      },
    ];
    await updateThemeInEditor(second, false);
    expect(frameStyle.textContent).toBe(buildThemeCss(second));
    expect(document.getElementById(THEME_STYLE_TAG_ID)?.textContent).toBe(
      frameStyle.textContent
    );
    expect(frameStyle.textContent).not.toContain("main-primary");
    for (const target of [document, iframe.contentDocument!]) {
      expect(
        JSON.parse(target.getElementById(THEME_DATA_TAG_ID)!.textContent!)
      ).toEqual(second);
      const hrefs = [...target.querySelectorAll("link")]
        .map((link) => link.href)
        .join(" ");
      expect(hrefs).toContain("family=Roboto");
      expect(hrefs).toContain("family=Lato");
    }
  });
});

describe("theme loading boundary", () => {
  it("materializes the main default theme when no theme was saved", () => {
    const markup = applyTheme({} as StreamDocument, "./");
    expect(markup).toContain(buildThemeCss(migrateThemeData()));
    expect(markup).not.toContain("--colors-palette");
  });
  it("converts old published palette and font values before generating CSS", () => {
    const saved = {
      "--colors-palette-primary": "#173B62",
      "--fontFamily-headers-defaultFont": "'Roboto', sans-serif",
    };
    const markup = applyTheme(
      { __: { theme: JSON.stringify(saved) } } as StreamDocument,
      "./"
    );
    expect(markup).toContain(buildThemeCss(migrateThemeData(saved)));
    expect(markup).toContain("family=Roboto");
    expect(markup).not.toContain("--fontFamily-h1");
  });
  it("preserves caller head markup and excludes unknown saved properties from CSS", () => {
    const markup = applyTheme(
      { __: { theme: JSON.stringify({ unknown: "value" }) } } as StreamDocument,
      "./",
      "<meta name=example>"
    );
    expect(markup.startsWith("<meta name=example>")).toBe(true);
    expect(markup).not.toContain("unknown:value");
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

    await updateThemeInEditor({}, false);

    expect(
      iframe.contentDocument!.querySelectorAll(`#${THEME_STYLE_TAG_ID}`)
    ).toHaveLength(1);
    expect(iframeStyleTag.textContent).toContain(
      "--ve-default-color-background"
    );
  });

  it("waits for the real iframe theme style tag", async () => {
    const iframe = document.createElement("iframe");
    iframe.id = PUCK_PREVIEW_IFRAME_ID;
    document.body.appendChild(iframe);

    await updateThemeInEditor({}, false);

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
        "--ve-default-color-background"
      );
    });
    mutationTarget.remove();
  });
});
