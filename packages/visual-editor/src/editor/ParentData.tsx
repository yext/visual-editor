import { ComponentData, DefaultComponentProps, Fields } from "@puckeditor/core";
import { msg, pt } from "../utils/i18n/platform.ts";
import { toPuckFields, YextFieldMap, YextFields } from "../fields/fields.ts";

export const resolveDataFromParent = <T extends DefaultComponentProps>(
  fields: YextFields<T> | YextFieldMap<T>,
  data: Omit<
    ComponentData<T, string, Record<string, DefaultComponentProps>>,
    "type"
  >
): Fields<T> => {
  if (data.props.parentData) {
    return toPuckFields({
      ...fields,
      data: {
        label: msg("fields.data", "Data"),
        type: "object",
        objectFields: {
          info: {
            type: "custom",
            render: () => (
              <p style={{ fontSize: "var(--puck-font-size-xxs)" }}>
                {pt(
                  "inheritedDataMsg",
                  "Data is inherited from the parent section."
                )}
              </p>
            ),
          },
        },
      },
    });
  }
  return toPuckFields(fields);
};
