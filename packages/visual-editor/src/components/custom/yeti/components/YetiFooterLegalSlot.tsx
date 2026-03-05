// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiFooterLegalSlotProps {
  data: {
    copyrightText: TranslatableString;
    legalLinks: Array<{
      label: TranslatableString;
      href: string;
    }>;
  };
}

const defaultLegalLink = {
  label: toTranslatableString("Legal Link"),
  href: "#",
};

const fields: Fields<YetiFooterLegalSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      copyrightText: YextField("Copyright Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      legalLinks: YextField("Legal Links", {
        type: "array",
        defaultItemProps: defaultLegalLink,
        arrayFields: {
          label: YextField("Label", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          href: YextField("Href", {
            type: "text",
          }),
        },
      }),
    },
  }),
};

const YetiFooterLegalSlotComponent: PuckComponent<YetiFooterLegalSlotProps> = ({
  data,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const copyrightText = resolveComponentData(
    data.copyrightText,
    i18n.language,
    streamDocument
  );

  return (
    <div className="flex min-w-0 flex-col gap-3 border-t border-current/25 pt-4 text-xs">
      {copyrightText ? <p>{copyrightText}</p> : null}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {data.legalLinks.map((link, index) => {
          const label = resolveComponentData(
            link?.label,
            i18n.language,
            streamDocument
          );
          if (!label) {
            return null;
          }

          return (
            <a
              key={`legal-link-${index}`}
              href={link.href || "#"}
              className="underline-offset-2 hover:underline"
            >
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export const defaultYetiFooterLegalSlotProps: YetiFooterLegalSlotProps = {
  data: {
    copyrightText: toTranslatableString(
      "© YETI COOLERS, LLC. All rights reserved."
    ),
    legalLinks: [
      {
        label: toTranslatableString("Privacy Policy"),
        href: "https://www.yeti.com/privacy-policy.html",
      },
      {
        label: toTranslatableString("Terms & Conditions"),
        href: "https://www.yeti.com/terms-conditions.html",
      },
    ],
  },
};

export const YetiFooterLegalSlot: ComponentConfig<{
  props: YetiFooterLegalSlotProps;
}> = {
  label: "Yeti Footer Legal Slot",
  fields,
  defaultProps: defaultYetiFooterLegalSlotProps,
  render: (props) => <YetiFooterLegalSlotComponent {...props} />,
};
