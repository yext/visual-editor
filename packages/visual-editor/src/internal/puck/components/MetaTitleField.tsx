import React from "react";
import { AutoField, type Field } from "@puckeditor/core";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { useTemplateMetadata } from "../../hooks/useMessageReceivers.ts";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import {
  getMetaTitleMissingLocales,
  getRelevantLocales,
} from "../../../utils/metaTitleValidation.ts";
import {
  type YextEntityField,
  YextEntityFieldSelector,
} from "../../../editor/YextEntityFieldSelector.tsx";
import { type TranslatableString } from "../../../types/types.ts";

export const MetaTitleField = (): Field<
  YextEntityField<TranslatableString>
> => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      const templateMetadata = useTemplateMetadata();
      const streamDocument = useDocument();
      const locales = getRelevantLocales(templateMetadata, streamDocument);
      const missingLocales = getMetaTitleMissingLocales(value, locales);

      const errorMessage =
        missingLocales.length === 1
          ? pt(
              "metaTitleMissingLocale",
              "Meta title is missing for locale: {{locale}}",
              {
                locale: missingLocales[0],
              }
            )
          : pt(
              "metaTitleMissingLocales",
              "Meta title is missing for locales: {{locales}}",
              { locales: missingLocales.join(", ") }
            );

      const metaTitleField = React.useMemo(
        () =>
          YextEntityFieldSelector<any, TranslatableString>({
            label: msg("fields.metaTitle", "Meta Title"),
            filter: {
              types: ["type.string"],
            },
          }),
        []
      );

      return (
        <div className="ve-w-full">
          <AutoField field={metaTitleField} value={value} onChange={onChange} />
          {missingLocales.length > 0 && (
            <p className="ve-mt-2 ve-text-xs ve-text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      );
    },
  };
};
