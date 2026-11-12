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
    const editorRoot = document.documentElement;
    editorRoot.style.setProperty(
      "--colors-palette-quaternary-contrast",
      "#FFF"
    );

    const previewDocument =
      document.implementation.createHTMLDocument("preview");
    const previewRoot = previewDocument.documentElement;
    previewRoot.style.setProperty(
      "--colors-palette-quaternary-contrast",
      "#000"
    );
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
    const editorRoot = document.documentElement;
    editorRoot.style.setProperty(
      "--colors-palette-quaternary-contrast",
      "#000"
    );

    const previewDocument =
      document.implementation.createHTMLDocument("preview");
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

  it("reads the document root even when a component has a different value", () => {
    document.documentElement.style.setProperty("--ve-color-foreground", "red");
    const component = document.createElement("div");
    component.className = "components";
    component.style.setProperty("--ve-color-foreground", "blue");
    document.body.appendChild(component);
    expect(getThemeValue("--ve-color-foreground")).toBe("red");
  });

  it("ignores old published overrides and uses frozen defaults", () => {
    expect(
      getThemeValue("--colors-palette-quaternary-contrast", {
        __: {
          theme: JSON.stringify({
            "--colors-palette-quaternary-contrast": "#123456",
          }),
        },
      })
    ).toBe("#FFFFFF");
  });

  it("reads a published new value through its declared variable", () => {
    expect(
      getThemeValue("--ve-color-foreground", {
        __: { theme: JSON.stringify({ colorForeground: "red" }) },
      })
    ).toBe("red");
  });

  it("reads the new field default when there is no saved value", () => {
    expect(
      getThemeValue("--ve-color-foreground", { __: { theme: "{}" } })
    ).toBe("#000000");
  });

  it("uses legacy defaults when published JSON is malformed", () => {
    expect(
      getThemeValue("--colors-palette-primary", { __: { theme: "invalid" } })
    ).toBe("#CF0A2C");
  });

  it("returns undefined when the value is missing from every source", () => {
    expect(
      getThemeValue("--unknown", {
        __: {
          theme: JSON.stringify({}),
        },
      })
    ).toBeUndefined();
  });
});
