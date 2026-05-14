import { ReactNode, useEffect } from "react";
import mapboxPackageJson from "mapbox-gl/package.json" with { type: "json" };
import { THEME_STYLE_TAG_ID } from "../../utils/applyTheme.ts";

const syncParentStylesIntoIframe = (iframeDocument: Document) => {
  const parentHeadNodes = window.document.head.querySelectorAll(
    'link[rel="stylesheet"], style'
  );

  parentHeadNodes.forEach((node, index) => {
    const clonedNode = node.cloneNode(true) as HTMLElement;
    const syncId =
      clonedNode.id ||
      clonedNode.getAttribute("href") ||
      clonedNode.getAttribute("data-visual-editor-font") ||
      `visual-editor-style-sync-${index}`;

    if (
      !iframeDocument.head.querySelector(
        `[data-visual-editor-sync="${CSS.escape(syncId)}"]`
      )
    ) {
      clonedNode.setAttribute("data-visual-editor-sync", syncId);
      iframeDocument.head.appendChild(clonedNode);
      return;
    }

    const existingNode = iframeDocument.head.querySelector(
      `[data-visual-editor-sync="${CSS.escape(syncId)}"]`
    );
    if (existingNode) {
      existingNode.replaceWith(clonedNode);
      clonedNode.setAttribute("data-visual-editor-sync", syncId);
    }
  });
};

/**
 * For use in Puck's iframe override. Loads the Mapbox script and stylesheet into the iframe document.
 */
export const loadMapboxIntoIframe = ({
  children,
  document,
}: {
  children: ReactNode;
  document?: Document | undefined;
}) => {
  useEffect(() => {
    if (!document) {
      return;
    }

    syncParentStylesIntoIframe(document);

    const parentThemeStyleTag =
      window.document.getElementById(THEME_STYLE_TAG_ID);
    if (parentThemeStyleTag) {
      let iframeThemeStyleTag = document.getElementById(THEME_STYLE_TAG_ID);
      if (!iframeThemeStyleTag) {
        iframeThemeStyleTag = document.createElement("style");
        iframeThemeStyleTag.id = THEME_STYLE_TAG_ID;
        iframeThemeStyleTag.setAttribute("type", "text/css");
        document.head.appendChild(iframeThemeStyleTag);
      }
      iframeThemeStyleTag.textContent = parentThemeStyleTag.textContent;
    }

    // Ensure Mapbox script is loaded in the iframe
    if (!document.getElementById("mapbox-script")) {
      const script = document.createElement("script");
      script.id = "mapbox-script";
      script.src = `https://api.mapbox.com/mapbox-gl-js/v${mapboxPackageJson.version}/mapbox-gl.js`;
      document.body.appendChild(script);
    }

    // Ensure Mapbox stylesheet is loaded in the iframe
    if (!document.getElementById("mapbox-stylesheet")) {
      const link = document.createElement("link");
      link.id = "mapbox-stylesheet";
      link.href = `https://api.mapbox.com/mapbox-gl-js/v${mapboxPackageJson.version}/mapbox-gl.css`;
      link.rel = "stylesheet";
      document.body.appendChild(link);
    }
  }, [document]);
  return <>{children}</>;
};
