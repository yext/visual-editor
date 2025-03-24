import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.js";

interface TextListProps {
  list: YextEntityField<string[]>;
}

const textListFields: Fields<TextListProps> = {
  list: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["type.string"],
      includeListsOnly: true,
    },
  }),
};

const TextList: React.FC<TextListProps> = ({ list: textListField }) => {
  const document = useDocument();
  let resolvedTextList: any = resolveYextEntityField(document, textListField);
  if (!resolvedTextList) {
    resolvedTextList = ["Sample text 1", "Sample text 2", "Sample text 3"];
  } else if (!Array.isArray(resolvedTextList)) {
    resolvedTextList = [resolvedTextList];
  }

  return (
    <EntityField
      displayName="Text List"
      fieldId={textListField.field}
      constantValueEnabled={textListField.constantValueEnabled}
    >
      <ul className="components list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight text-body-color">
        {resolvedTextList.map((text: any, index: any) => (
          <li key={index} className="mb-2">
            {text}
          </li>
        ))}
      </ul>
    </EntityField>
  );
};

const TextListComponent: ComponentConfig<TextListProps> = {
  label: "Text List",
  fields: textListFields,
  defaultProps: {
    list: {
      field: "",
      constantValue: [],
    },
  },
  render: (props) => <TextList {...props} />,
};

export { TextListComponent as TextList, type TextListProps };
