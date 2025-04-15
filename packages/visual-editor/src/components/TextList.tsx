import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
} from "@yext/visual-editor";

export interface TextListProps {
  list: YextEntityField<string[]>;
}

const textListFields: Fields<TextListProps> = {
  list: YextEntityFieldSelector({
    label: "Values",
    filter: {
      types: ["type.string"],
      includeListsOnly: true,
    },
  }),
};

const TextListComponent: React.FC<TextListProps> = ({
  list: textListField,
}) => {
  const document = useDocument();
  let resolvedTextList: any = resolveYextEntityField(document, textListField);

  // When constantValueEnabled is true but no constant values have been set yet, show defaults
  if (
    textListField.constantValueEnabled &&
    (!textListField.constantValue ||
      (Array.isArray(textListField.constantValue) &&
        textListField.constantValue.length === 0))
  ) {
    resolvedTextList = ["Sample text 1", "Sample text 2", "Sample text 3"];
  } else if (resolvedTextList && !Array.isArray(resolvedTextList)) {
    // If there's a value but it's not an array, convert it to array
    resolvedTextList = [resolvedTextList];
  }

  return (
    <EntityField
      displayName="Text List"
      fieldId={textListField.field}
      constantValueEnabled={textListField.constantValueEnabled}
    >
      {resolvedTextList && resolvedTextList.length > 0 ? (
        <ul className="components list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
          {resolvedTextList.map((text: any, index: any) => (
            <li key={index} className="mb-2">
              {text}
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
