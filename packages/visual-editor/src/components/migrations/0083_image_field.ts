import { Migration } from "../../utils/migrate.ts";
import { migrateImageField } from "../../utils/migrateImageField.ts";

export const imageFieldMigration = {
  ImageWrapper: {
    action: "updated",
    propTransformation: (props, streamDocument) => ({
      ...props,
      data: {
        ...props.data,
        image: migrateImageField(props.data?.image, streamDocument),
      },
    }),
  },
} satisfies Migration;
