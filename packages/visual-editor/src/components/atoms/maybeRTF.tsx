import { LexicalRichText } from "@yext/pages-components";
import { Body, BodyProps, RichText, useBackground } from "@yext/visual-editor";
import "./maybeRTF.css";

export interface MaybeRTFProps extends Record<string, any> {
  data: RichText | string | undefined;
  bodyVariant?: BodyProps["variant"];
}

export const MaybeRTF = ({
  data,
  bodyVariant = "base",
  ...props
}: MaybeRTFProps) => {
  const background = useBackground();

  if (!data) {
    return <></>;
  }

  if (typeof data === "string") {
    return (
      <Body {...props} variant={bodyVariant}>
        {data}
      </Body>
    );
  }

  if (typeof data === "object") {
    if ("html" in data && data.html) {
      return (
        <div
          {...props}
          dangerouslySetInnerHTML={{ __html: data.html }}
          className={`rtf-theme ${background?.isDarkBackground ? "rtf-dark-background" : "rtf-light-background"} ${bodyVariant !== "base" && `rtf-body-${bodyVariant}`}`}
        />
      );
    }

    if ("json" in data && data.json) {
      return <LexicalRichText serializedAST={JSON.stringify(data.json)} />;
    }
  }

  return <></>;
};
