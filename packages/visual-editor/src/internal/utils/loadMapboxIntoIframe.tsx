import { ReactNode, useEffect } from "react";
import mapboxPackageJson from "mapbox-gl/package.json";
import { googleFontLinkTags } from "../../utils/visualEditorFonts.ts";

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

    // Load default Google Fonts for the font selector dropdown
    if (!document.getElementById("visual-editor-default-fonts")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = googleFontLinkTags;
      const links = tempDiv.querySelectorAll("link");
      links.forEach((link) => {
        link.id = "visual-editor-default-fonts";
        document.head.appendChild(link);
      });
    }
  }, [document]);
  return <>{children}</>;
};
