import { LexicalRichText } from "@yext/pages-components";
import { Body, RTF2 } from "@yext/visual-editor";

export interface MaybeRTFProps extends Record<string, any> {
  data: RTF2 | string | undefined;
}

export const MaybeRTF = ({ data, ...props }: MaybeRTFProps) => {
  if (!data) {
    return undefined;
  }

  if (typeof data === "string") {
    return <Body {...props}>{data}</Body>;
  }

  if (typeof data === "object") {
    if ("html" in data && data.html) {
      return (
        <Body {...props} dangerouslySetInnerHTML={{ __html: data.html }} />
      );
    }

    if ("json" in data && data.json) {
      return (
        <Body {...props}>
          <LexicalRichText serializedAST={JSON.stringify(data.json)} />
        </Body>
      );
    }
  }
};
