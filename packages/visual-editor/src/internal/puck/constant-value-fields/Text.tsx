import { AutoField, CustomField, TextField } from "@measured/puck";
import React from "react";
import { TranslatableRTF2 } from "../../../types/types.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { getDisplayValue } from "../../../utils/resolveTranslatableString.ts";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_RTF2_CONSTANT_CONFIG: CustomField<TranslatableRTF2> =
  {
    type: "custom",
    render: ({ onChange, value }) => {
      const document: any = useDocument();
      const locale = document?.locale ?? "en";

      return (
        <AutoField
          field={{ type: "text" }}
          value={getDisplayValue(value, locale)}
          onChange={(val) =>
            onChange({
              ...(typeof value === "object" && !Array.isArray(value)
                ? value
                : {}),
              [locale]: val,
            })
          }
        />
      );
    },
  };

// export function generateTranslatableConstantConfig<T>(label?: string, fieldType?: "text" | "textarea"): CustomField<T> {
//   return {
//     type: "custom",
//     render: ({ onChange, value }) => {
//       const document: any = useDocument();
//       const locale = document?.locale ?? "en";
//       const { t } = useTranslation() // TODO use platformTranslation
//
//       const autoField = <AutoField
//           field={{ type: fieldType ?? "text" }}
//           value={getDisplayValue(value, locale)}
//           onChange={(val) =>
//               onChange({
//                 ...(typeof value === "object" &&
//                 !Array.isArray(value)
//                     ? value
//                     : {}),
//                 [locale]: val,
//               })
//           }
//       />;
//
//       if (!label) {
//         return autoField;
//       }
//
//       return <FieldLabel label={t(label, "Label")}>
//         {autoField}
//       </FieldLabel>
//     },
//   }
// }
