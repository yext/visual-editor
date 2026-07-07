import { Body, BodyProps } from "./body.tsx";
import { RichText } from "../../types/types.ts";
import type { BaseTextStyles } from "../../fields/styledFields/baseText.tsx";
import { getRichTextStyle } from "../../utils/richTextStyles.ts";
import { type ThemeColor } from "../../utils/themeConfigOptions.ts";
import "./maybeRTF.css";

export type RichTextStyleOverrides = Partial<BaseTextStyles> & {
  color?: ThemeColor | string;
};

export interface MaybeRTFProps extends Record<string, any> {
  data: RichText | string | undefined;
  bodyVariant?: BodyProps["variant"];
  /** Override the theme's styling */
  richTextStyleOverrides?: RichTextStyleOverrides;
}

export const MaybeRTF = ({
  data,
  bodyVariant = "base",
  richTextStyleOverrides,
  style,
  className,
  ...props
}: MaybeRTFProps) => {
  const mergedStyle = {
    ...getRichTextStyle({
      color: richTextStyleOverrides?.color,
      typography: richTextStyleOverrides,
    }),
    ...style,
  };

  if (!data) {
    return <></>;
  }

  if (typeof data === "string") {
    return (
      <Body
        {...props}
        className={className}
        style={mergedStyle}
        variant={bodyVariant}
      >
        {data}
      </Body>
    );
  }

  if (typeof data === "object") {
    if ("html" in data && data.html) {
      return (
        <div
          {...props}
          style={mergedStyle}
          dangerouslySetInnerHTML={{ __html: data.html }}
          className={`rtf-theme rtf-wrapper ${bodyVariant !== "base" ? `rtf-body-${bodyVariant}` : ""} ${className ?? ""}`.trim()}
        />
      );
    }
  }

  return <></>;
};
