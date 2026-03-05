import * as React from "react";
import { normalizeThemeColor } from "../utils/normalizeThemeColor.ts";
import { BackgroundStyle } from "../utils/themeConfigOptions.ts";

const resolveCssVarColor = (
  element: Element,
  varName: string
): string | undefined => {
  return window.getComputedStyle(element).getPropertyValue(varName).trim();
};

const resolvePinFillColor = (
  backgroundToken: string
): React.CSSProperties | undefined => {
  if (backgroundToken === "white" || backgroundToken === "black") {
    return { color: backgroundToken };
  }

  if (backgroundToken.endsWith("-light")) {
    const baseToken = backgroundToken.replace(/-light$/, "");
    return { color: `hsl(from var(--colors-${baseToken}) h s 98)` };
  }

  if (backgroundToken.endsWith("-dark")) {
    const baseToken = backgroundToken.replace(/-dark$/, "");
    return { color: `hsl(from var(--colors-${baseToken}) h s 20)` };
  }

  return { color: `var(--colors-${backgroundToken})` };
};

const resolveContrastColor = (
  element: Element,
  textToken: string
): string | undefined => {
  if (textToken === "black") {
    return "#000000";
  }

  if (textToken === "white") {
    return "#FFFFFF";
  }

  if (textToken) {
    return resolveCssVarColor(element, `--colors-${textToken}`);
  }

  return undefined;
};

// Renders a Mapbox-style pin with theme-aware fill and contrast-aware icon/number in the center.
export const MapPinIcon = ({
  color,
  resultIndex,
  icon,
  selected,
}: {
  color?: BackgroundStyle;
  resultIndex?: number;
  icon?: string;
  selected?: boolean;
}) => {
  const pinHeight = 41;
  const pinWidth = 27;
  const pinScale = 1.5;

  const centerX = 13.5;
  const centerY = 13.5;
  const iconSize = 14;

  // Theme tokens derived from tailwind class names (e.g., bg-palette-primary-light -> palette-primary-light)
  const backgroundToken = normalizeThemeColor(color?.bgColor);
  const textToken = normalizeThemeColor(color?.textColor);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [contrastColor, setContrastColor] = React.useState<string | undefined>(
    undefined
  );

  React.useLayoutEffect(() => {
    // Resolve icon/text contrast color using the theme's text token
    if (svgRef.current && textToken) {
      setContrastColor(resolveContrastColor(svgRef.current, textToken));
    }
  }, [textToken]);

  // SVG children use currentColor for the pin fill; apply contrast for text/icon.
  const svgStyle = React.useMemo<React.CSSProperties | undefined>(
    () => (backgroundToken ? resolvePinFillColor(backgroundToken) : undefined),
    [backgroundToken]
  );

  return (
    <svg
      ref={svgRef}
      className={"hover:cursor-pointer components"}
      style={svgStyle}
      display="block"
      height={selected ? pinScale * pinHeight : pinHeight}
      width={selected ? pinScale * pinWidth : pinWidth}
      viewBox="0 0 27 41"
    >
      <defs>
        <radialGradient id="shadowGradient">
          <stop offset="10%" stopOpacity="0.4"></stop>
          <stop offset="100%" stopOpacity="0.05"></stop>
        </radialGradient>
      </defs>
      <ellipse
        cx="13.5"
        cy="34.8"
        rx="10.5"
        ry="5.25"
        fill="url(#shadowGradient)"
      ></ellipse>
      <path
        fill="currentColor"
        d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"
      ></path>
      <path
        opacity="0.25"
        d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"
      ></path>
      {icon ? (
        <image
          href={icon}
          x={centerX - iconSize / 2}
          y={centerY - iconSize / 2}
          width={iconSize}
          height={iconSize}
          filter={contrastColor === "#000000" ? "invert(0)" : "invert(1)"}
        />
      ) : (
        !!resultIndex && (
          <text
            textAnchor="middle"
            fontWeight="bold"
            fontSize={iconSize}
            x="50%"
            y="50%"
            fill={contrastColor ?? "white"}
          >
            {resultIndex}
          </text>
        )
      )}
    </svg>
  );
};
