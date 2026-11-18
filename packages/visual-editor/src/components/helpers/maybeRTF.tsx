import * as React from "react";
import { type RichText } from "../../types/types.ts";
import type { BaseTextStyles } from "../../fields/styledFields/baseText.tsx";
import {
  type ThemeColor,
  type TypographyRole,
} from "../../utils/themeOptions.ts";
import { getRichTextStyle } from "../../utils/richTextStyles.ts";

export type RichTextStyleOverrides = Partial<BaseTextStyles> & {
  color?: ThemeColor | string;
};

export interface MaybeRTFProps extends React.HTMLAttributes<HTMLElement> {
  data: RichText | string | undefined;
  typographyRole?: TypographyRole;
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  richTextStyleOverrides?: RichTextStyleOverrides;
}

/**
 * Remove generated inline font/color defaults; retain layout and semantic emphasis.
 */
const normalizeRichTextPresentation = (html: string): string =>
  html.replace(/<([a-z][\w:-]*)\b[^>]*>/gi, (tag, tagName: string) => {
    const normalizedTag = tag.replace(
      /\sstyle=(["'])([\s\S]*?)\1/gi,
      (_, quote, css: string) => {
        const declarations = css
          .split(";")
          .filter((declaration) => {
            const [name, value = ""] = declaration.split(":");
            const property = name.trim().toLowerCase();
            // Inline spans may carry authored emphasis. Block-level generated font
            // weights/styles must inherit the selected role and component overrides.
            if (property === "font-weight") {
              return (
                tagName.toLowerCase() === "span" &&
                /^(bold|bolder|[6-9]00)$/i.test(value.trim())
              );
            }
            if (property === "font-style") {
              return (
                tagName.toLowerCase() === "span" && value.trim() === "italic"
              );
            }
            return !/^(font|font-family|font-size|line-height|letter-spacing|text-transform|color|background-color)$/.test(
              property
            );
          })
          .join(";");
        return declarations.trim()
          ? ` style=${quote}${declarations}${quote}`
          : "";
      }
    );
    return tagName.toLowerCase() === "font"
      ? normalizedTag.replace(/\s(?:face|size|color)=(["']).*?\1/gi, "")
      : normalizedTag;
  });

export const MaybeRTF = ({
  data,
  typographyRole = "body",
  as: Tag = "p",
  richTextStyleOverrides,
  className,
  style,
  ...props
}: MaybeRTFProps) => {
  if (!data) {
    return <></>;
  }
  const classes = `ve-theme-${typographyRole} ${className ?? ""}`.trim();
  const resolvedStyle = {
    ...getRichTextStyle({
      color: richTextStyleOverrides?.color,
      typography: richTextStyleOverrides,
    }),
    ...style,
    ...(style?.color ? { "--ve-rich-text-color": style.color } : {}),
  };
  if (typeof data === "string") {
    return (
      <Tag {...props} className={classes} style={resolvedStyle}>
        {data}
      </Tag>
    );
  }
  if (data.html) {
    return (
      <div
        {...props}
        className={`rtf-wrapper ${classes}`}
        style={resolvedStyle}
        dangerouslySetInnerHTML={{
          __html: normalizeRichTextPresentation(data.html),
        }}
      />
    );
  }
  return <></>;
};
