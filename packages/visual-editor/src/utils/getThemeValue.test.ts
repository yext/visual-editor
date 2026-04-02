import { afterEach, describe, expect, it } from "vitest";
import { PUCK_PREVIEW_IFRAME_ID } from "./applyTheme.ts";
import { getThemeValue } from "./getThemeValue.ts";

const createStyleReader = (targetDocument: Document) => {
  return (element: Element) => ({
    getPropertyValue: (variableName: string) => {
      if (element.ownerDocument !== targetDocument) {
        return "";
      }

      return (element as HTMLElement).style.getPropertyValue(variableName);
    },
  });
};

describe("getThemeValue", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("style");
  });

  it("prefers the preview iframe theme over the editor shell", () => {
    const editorRoot = document.createElement("div");
    editorRoot.className = "components";
    editorRoot.style.setProperty(
      "--colors-palette-quaternary-contrast",
      "#FFF"
    );
    document.body.appendChild(editorRoot);

    const previewDocument =
      document.implementation.createHTMLDocument("preview");
    const previewRoot = previewDocument.createElement("div");
    previewRoot.className = "components";
    previewRoot.style.setProperty(
      "--colors-palette-quaternary-contrast",
      "#000"
    );
    previewDocument.body.appendChild(previewRoot);
    Object.defineProperty(previewDocument, "defaultView", {
      value: {
        getComputedStyle: createStyleReader(previewDocument),
      },
      configurable: true,
    });

    const previewFrame = document.createElement("iframe");
    previewFrame.id = PUCK_PREVIEW_IFRAME_ID;
    Object.defineProperty(previewFrame, "contentDocument", {
      value: previewDocument,
      configurable: true,
    });
    document.body.appendChild(previewFrame);

    expect(getThemeValue("--colors-palette-quaternary-contrast")).toBe("#000");
  });

  it("falls back to the current document when the preview iframe has no value", () => {
    const editorRoot = document.createElement("div");
    editorRoot.className = "components";
    editorRoot.style.setProperty(
      "--colors-palette-quaternary-contrast",
      "#000"
    );
    document.body.appendChild(editorRoot);

    const previewDocument =
      document.implementation.createHTMLDocument("preview");
    const previewRoot = previewDocument.createElement("div");
    previewRoot.className = "components";
    previewDocument.body.appendChild(previewRoot);
    Object.defineProperty(previewDocument, "defaultView", {
      value: {
        getComputedStyle: createStyleReader(previewDocument),
      },
      configurable: true,
    });

    const previewFrame = document.createElement("iframe");
    previewFrame.id = PUCK_PREVIEW_IFRAME_ID;
    Object.defineProperty(previewFrame, "contentDocument", {
      value: previewDocument,
      configurable: true,
    });
    document.body.appendChild(previewFrame);

    expect(getThemeValue("--colors-palette-quaternary-contrast")).toBe("#000");
  });
});
