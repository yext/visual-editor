import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  useDocument,
  EntityField,
  YextEntityField,
  YextField,
  TranslatableString,
  resolveComponentData,
  msg,
  pt,
} from "@yext/visual-editor";

export interface TextListProps {
  list: YextEntityField<TranslatableString[]>;
}

const textListFields: Fields<TextListProps> = {
  list: YextField(msg("fields.values", "Values"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
      includeListsOnly: true,
    },
  }),
};

const TextListComponent: PuckComponent<TextListProps> = ({
  list: textListField,
  puck,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  let resolvedTextList = resolveComponentData(
    textListField,
    i18n.language,
    streamDocument
  );

  // If there's a value but it's not an array, convert it to array
  if (resolvedTextList && !Array.isArray(resolvedTextList)) {
    resolvedTextList = [resolvedTextList];
  }

  return resolvedTextList?.length ? (
    <EntityField
      displayName={pt("textList", "Text List")}
      fieldId={textListField.field}
      constantValueEnabled={textListField.constantValueEnabled}
    >
      {resolvedTextList && resolvedTextList.length > 0 ? (
        <ul className="components list-disc list-inside text-body-fontSize font-body-fontFamily font-body-fontWeight">
          {resolvedTextList.map((text, index) => (
            <li key={index} className="mb-2">
              {resolveComponentData(text, i18n.language)}
            </li>
          ))}
        </ul>
      ) : null}
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-10" />
  ) : (
    <></>
  );
};

export const TextList: ComponentConfig<{ props: TextListProps }> = {
  label: msg("components.textList", "Text List"),
  fields: textListFields,
  defaultProps: {
    list: {
      field: "",
      constantValue: [],
    },
  },
  render: (props) => <TextListComponent {...props} />,
};
