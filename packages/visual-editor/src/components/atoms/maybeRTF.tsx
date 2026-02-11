import { Body, BodyProps } from "./body.tsx";
import { RichText } from "../../types/types.ts";
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
          className={`rtf-theme rtf-wrapper ${bodyVariant !== "base" && `rtf-body-${bodyVariant}`}`}
        />
      );
    }
  }

  return <></>;
};
