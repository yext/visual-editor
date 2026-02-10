import React from "react";
import { AutoField, type Field } from "@puckeditor/core";
import { useDocument } from "../../../../hooks/useDocument.tsx";
import { msg, pt } from "../../../../utils/i18n/platform.ts";
import { getPageSetLocales } from "../../../../utils/pageSetLocales.ts";
import {
  type YextEntityField,
  YextEntityFieldSelector,
} from "../../../../editor/YextEntityFieldSelector.tsx";
import { type TranslatableString } from "../../../../types/types.ts";
import { getMetaTitleMissingLocales } from "./metaTitleValidation.ts";

export const MetaTitleField = (): Field<
  YextEntityField<TranslatableString>
> => {
  return {
    type: "custom",
    render: ({ value, onChange }) => {
      const streamDocument = useDocument();
      const locales = getPageSetLocales(streamDocument);
      const missingLocales = getMetaTitleMissingLocales(value, locales);

      const errorMessage = pt(
        "metaTitleMissingLocales",
        "Meta title is missing for locale(s): {{locales}}",
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
