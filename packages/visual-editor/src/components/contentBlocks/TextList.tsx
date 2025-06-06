import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextField,
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";

export interface TextListProps {
  list: YextEntityField<TranslatableString[]>;
}

const textListFields: Fields<TextListProps> = {
  list: YextField("Values", {
    type: "entityField",
    filter: {
      types: ["type.string"],
      includeListsOnly: true,
    },
    isTranslatable: true,
  }),
};

const TextListComponent: React.FC<TextListProps> = ({
  list: textListField,
}) => {
  const { t, i18n } = useTranslation();
  const document = useDocument();
  let resolvedTextList = resolveYextEntityField(document, textListField);

  // When constantValueEnabled is true but no constant values have been set yet, show defaults
  if (
    textListField.constantValueEnabled &&
    !textListField.constantValue?.length
  ) {
    resolvedTextList = ["Sample text 1", "Sample text 2", "Sample text 3"];
  } else if (resolvedTextList && !Array.isArray(resolvedTextList)) {
    // If there's a value but it's not an array, convert it to array
    resolvedTextList = [resolvedTextList];
  }

  return (
    <EntityField
      displayName={t("textList", "Text List")}
      fieldId={textListField.field}
      constantValueEnabled={textListField.constantValueEnabled}
    >
      {resolvedTextList && resolvedTextList.length > 0 ? (
        <ul className="components list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
          {resolvedTextList.map((text, index) => (
            <li key={index} className="mb-2">
              {resolveTranslatableString(text, i18n.language)}
            </li>
          ))}
        </ul>
      ) : null}
    </EntityField>
  );
};

export const TextList: ComponentConfig<TextListProps> = {
  label: "Text List",
  fields: textListFields,
  defaultProps: {
    list: {
      field: "",
      constantValue: [],
    },
  },
  render: (props) => <TextListComponent {...props} />,
};
