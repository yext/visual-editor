import { Migration } from "../../utils/migrate.ts";

export const formPhoneOptInRichTextMigration: Migration = {
  FormSection: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      data: {
        ...props.data,
        phoneOptInText: props.data.fields?.find(
          (field: { type: string }) => field.type === "phoneOptIn"
        )?.label ?? { defaultValue: "I consent to receive text messages." },
      },
    }),
  },
};
