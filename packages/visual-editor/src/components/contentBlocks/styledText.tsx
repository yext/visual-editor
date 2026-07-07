import * as React from "react";
import { MaybeRTF } from "../atoms/maybeRTF.tsx";
import { type StyledTextValue } from "../../fields/styledFields/StyledTextField.tsx";
import { getTextColorClass, getTextColorStyle } from "../../utils/colors.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { getRichTextStyle } from "../../utils/richTextStyles.ts";
import { type ThemeColor } from "../../utils/themeConfigOptions.ts";

export type StyledTextTag =
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "strong";

export type StyledTextAlignment = "left" | "center" | "right";

export type StyledTextFontOptions = {
  text: StyledTextValue;
  color?: ThemeColor;
};

/**
 * Resolves the editor's StyledTextValue into CSS properties that can be applied
 * to plain text or forwarded into richer shared renderers.
 */
export const getStyledTextStyle = (
  styles?: StyledTextValue
): React.CSSProperties | undefined => {
  if (!styles) {
    return undefined;
  }

  const resolvedStyle: React.CSSProperties = {};

  if (styles.fontFamily !== "default") {
    resolvedStyle.fontFamily = styles.fontFamily;
  }
  if (styles.fontSize !== "default") {
    resolvedStyle.fontSize = styles.fontSize;
  }
  if (styles.fontWeight !== "default") {
    resolvedStyle.fontWeight = styles.fontWeight;
  }
  if (styles.fontStyle !== "default") {
    resolvedStyle.fontStyle = styles.fontStyle;
  }
  if (styles.textTransform !== "default") {
    resolvedStyle.textTransform = styles.textTransform;
  }

  return Object.keys(resolvedStyle).length > 0 ? resolvedStyle : undefined;
};

const styledTextAlignClassName: Record<StyledTextAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const getStyledTextClassName = ({
  align,
  className,
}: {
  align?: StyledTextAlignment;
  className?: string;
}): string =>
  themeManagerCn(
    "components",
    align ? styledTextAlignClassName[align] : undefined,
    className
  );

const getStyledTextRenderProps = ({
  align,
  className,
  color,
  text,
}: {
  align?: StyledTextAlignment;
  className?: string;
  color?: ThemeColor;
  text?: StyledTextValue;
}): {
  className: string;
  style: React.CSSProperties;
} => ({
  className: getStyledTextClassName({ align, className }),
  style: {
    ...getTextColorStyle(color),
    ...getStyledTextStyle(text),
  },
});

export const renderStyledRichText = ({
  content,
  align,
  className,
  color,
  text,
}: {
  content: React.ReactNode;
  align?: StyledTextAlignment;
  className?: string;
  color?: ThemeColor;
  text?: StyledTextValue;
}): React.ReactNode => {
  const renderProps = getStyledTextRenderProps({
    align,
    className,
    color,
    text,
  });
  const richTextClassName = themeManagerCn(
    getTextColorClass(color),
    renderProps.className
  );
  const richTextStyle = getRichTextStyle({ color, typography: text });

  if (typeof content === "string") {
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return (
        <MaybeRTF
          className={richTextClassName}
          data={{ html: content }}
          richTextStyleOverrides={{
            ...text,
            ...(color ? { color } : {}),
          }}
          style={richTextStyle}
        />
      );
    }

    return (
      <StyledTextElement
        as="div"
        align={align}
        color={color}
        className={className}
        style={getStyledTextStyle(text)}
      >
        {content}
      </StyledTextElement>
    );
  }

  if (!React.isValidElement(content)) {
    return content;
  }

  if (content.type === MaybeRTF) {
    return (
      <MaybeRTF
        {...content.props}
        className={themeManagerCn(content.props.className, richTextClassName)}
        richTextStyleOverrides={{
          ...content.props.richTextStyleOverrides,
          ...text,
          ...(color ? { color } : {}),
        }}
        style={{
          ...content.props.style,
          ...richTextStyle,
        }}
      />
    );
  }

  if (
    React.isValidElement(content.props.children) &&
    typeof content.props.children.props.className === "string" &&
    content.props.children.props.className.includes("rtf-wrapper")
  ) {
    return React.cloneElement(content, {
      children: React.cloneElement(content.props.children, {
        className: themeManagerCn(
          content.props.children.props.className,
          richTextClassName
        ),
        style: {
          ...content.props.children.props.style,
          ...richTextStyle,
        },
      }),
    });
  }

  const innerContent = React.isValidElement(content.props.children)
    ? React.cloneElement(content.props.children, {
        className: themeManagerCn(content.props.children.props.className),
        style: content.props.children.props.style,
      })
    : content.props.children;

  return React.cloneElement(content, {
    className: themeManagerCn(content.props.className, richTextClassName),
    style: {
      ...content.props.style,
      ...richTextStyle,
    },
    children: innerContent,
  });
};

type StyledTextElementProps = {
  align?: StyledTextAlignment;
  as?: StyledTextTag;
  children: React.ReactNode;
  className?: string;
  color?: ThemeColor;
  style?: React.CSSProperties;
};

/**
 * Shared semantic text element that applies theme text color handling and
 * StyledTextValue typography without duplicating component-level resolver code.
 */
export const StyledTextElement = React.forwardRef<
  HTMLElement,
  StyledTextElementProps
>(({ align, as = "span", children, className, color, style }, ref) => {
  const Tag = as;
  const textColorClassName = getTextColorClass(color);
  const renderProps = getStyledTextRenderProps({
    align,
    className: themeManagerCn(
      textColorClassName,
      as === "span" && "block",
      className
    ),
    color,
  });

  return (
    <Tag
      className={renderProps.className}
      style={{
        ...renderProps.style,
        ...style,
      }}
      ref={ref as never}
    >
      {children}
    </Tag>
  );
});
StyledTextElement.displayName = "StyledTextElement";
