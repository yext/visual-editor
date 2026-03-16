import * as React from "react";
import { AutoField, FieldLabel } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { TranslatableCTA } from "../../types/types.ts";
import { msg, MsgString, pt } from "../../utils/i18n/platform.ts";
import { getDisplayValue } from "../../utils/resolveComponentData.tsx";
import { i18nComponentsInstance } from "../../utils/i18n/components.ts";

const getFooterLinkItemField = (labelFieldName: MsgString, linkType?: string) =>
  YextField<TranslatableCTA>(msg("fields.link", "Link"), {
    type: "object",
    objectFields: {
      linkType: YextField(msg("fields.linkType", "Link Type"), {
        type: "radio",
        options: [
          { label: msg("fields.options.url", "URL"), value: "URL" },
          { label: msg("fields.options.phone", "Phone"), value: "Phone" },
          { label: msg("fields.options.email", "Email"), value: "Email" },
        ],
      }),
      label: YextField(labelFieldName, {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      link: YextField(msg("fields.link", "Link"), {
        type: "text",
      }),
      normalizeLink: YextField(msg("fields.normalizeLink", "Normalize Link"), {
        type: "radio",
        visible: linkType === "URL",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      }),
      openInNewTab: YextField(msg("fields.openInNewTab", "Open in new tab"), {
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      }),
    },
  });

export const FooterLinkArrayField = (
  fieldName: MsgString,
  labelFieldName: MsgString,
  defaultItemProps: TranslatableCTA
) => ({
  type: "custom" as const,
  label: fieldName,
  render: ({
    field,
    value,
    onChange,
    readOnly,
  }: {
    field: { label?: string };
    value: TranslatableCTA[] | undefined;
    onChange: (value: TranslatableCTA[]) => void;
    readOnly?: boolean;
  }) => {
    const links = Array.isArray(value) ? value : [];

    return (
      <FieldLabel label={field.label ?? pt(fieldName)}>
        <div className="flex flex-col gap-4">
          {links.map((link, index) => {
            const locale = i18nComponentsInstance.language || "en";
            const summary =
              getDisplayValue(link.label, locale) ||
              `${pt("link", "Link")} ${index + 1}`;

            return (
              <div
                key={index}
                className="ve-border ve-border-gray-200 ve-rounded-md ve-p-3 flex flex-col gap-3"
              >
                <div className="ve-text-sm ve-font-medium">{summary}</div>
                <AutoField
                  value={link}
                  onChange={(updatedLink) => {
                    const updatedLinks = [...links];
                    updatedLinks[index] = updatedLink;
                    onChange(updatedLinks);
                  }}
                  readOnly={readOnly}
                  field={getFooterLinkItemField(labelFieldName, link.linkType)}
                />
                {!readOnly && (
                  <button
                    type="button"
                    className="ve-text-sm ve-text-red-600 self-start"
                    onClick={() =>
                      onChange(
                        links.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    {pt("removeLink", "Remove Link")}
                  </button>
                )}
              </div>
            );
          })}
          {!readOnly && (
            <button
              type="button"
              className="ve-text-sm ve-text-blue-600 self-start"
              onClick={() => onChange([...links, { ...defaultItemProps }])}
            >
              {pt("addLink", "Add Link")}
            </button>
          )}
        </div>
      </FieldLabel>
    );
  },
});
