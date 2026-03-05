// @ts-nocheck
import { TranslatableRichText, TranslatableString } from "../ve.ts";

export const toTranslatableString = (value: string): TranslatableString => ({
  en: value,
  hasLocalizedValue: "true",
});

export const toTranslatableRichText = (
  value: string
): TranslatableRichText => ({
  en: {
    html: `<p>${value}</p>`,
    json: JSON.stringify({
      root: {
        type: "root",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "paragraph",
            format: "",
            indent: 0,
            version: 1,
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: value,
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
          },
        ],
        direction: "ltr",
      },
    }),
  },
  hasLocalizedValue: "true",
});
