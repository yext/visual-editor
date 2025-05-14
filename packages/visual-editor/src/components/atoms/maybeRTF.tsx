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
        <LexicalRichText
          serializedAST={JSON.stringify(data.json)}
          nodeClassNames={{
            paragraph:
              "components font-body-fontFamily font-body-fontWeight text-body-fontSize",
            heading: {
              h1:
                "font-h2-fontWeight text-h2-fontSize text-h2-color font-h2-fontFamily " +
                "sm:font-h1-fontWeight sm:text-h1-fontSize sm:text-h1-color sm:font-h1-fontFamily",
              h2:
                "font-h3-fontWeight text-h3-fontSize text-h3-color font-h3-fontFamily " +
                "sm:font-h2-fontWeight sm:text-h2-fontSize sm:text-h2-color sm:font-h2-fontFamily",
              h3:
                "font-h4-fontWeight text-h4-fontSize text-h4-color font-h4-fontFamily " +
                "sm:font-h3-fontWeight sm:text-h3-fontSize sm:text-h3-color sm:font-h3-fontFamily",
              h4:
                "font-h5-fontWeight text-h5-fontSize text-h5-color font-h5-fontFamily " +
                "sm:font-h4-fontWeight sm:text-h4-fontSize sm:text-h4-color sm:font-h4-fontFamily",
              h5:
                "font-h6-fontWeight text-h6-fontSize text-h6-color font-h6-fontFamily " +
                "sm:font-h5-fontWeight sm:text-h5-fontSize sm:text-h5-color sm:font-h5-fontFamily",
              h6: "font-h6-fontWeight text-h6-fontSize text-h6-color font-h6-fontFamily",
            },
          }}
        />
      );
    }
  }
};
