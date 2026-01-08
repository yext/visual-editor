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
  commaSeparated: boolean;
}

export const textListFields: Fields<TextListProps> = {
  list: YextField(msg("fields.values", "Values"), {
    type: "entityField",
    filter: {
      types: ["type.string"],
      includeListsOnly: true,
    },
  }),
  commaSeparated: YextField<boolean>(
    msg("fields.commaSeparated", "Comma Separated"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.yes", "Yes"), value: true },
        { label: msg("fields.options.no", "No"), value: false },
      ],
    }
  ),
};

const TextListComponent: PuckComponent<TextListProps> = ({
  list: textListField,
  commaSeparated,
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
        <ul
          className={`components text-body-fontSize font-body-fontFamily font-body-fontWeight ${
            commaSeparated
              ? "flex flex-row flex-wrap list-none"
              : "list-disc list-inside"
          }`}
        >
          {resolvedTextList.map((text, index) => (
            <li
              key={index}
              className={`${commaSeparated ? "inline mb-0" : "mb-2"}`}
            >
              {resolveComponentData(text, i18n.language)}
              {commaSeparated && index !== resolvedTextList.length - 1 && (
                <span>,&nbsp;</span>
              )}
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
    commaSeparated: false,
  },
  render: (props) => <TextListComponent {...props} />,
};
