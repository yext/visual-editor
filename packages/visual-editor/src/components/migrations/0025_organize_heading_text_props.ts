import { LayoutMigration } from "../../utils/migrate.ts";

export const organizeHeadingTextProps: LayoutMigration = {
  HeadingText: {
    action: "updated",
    propTransformation: (props) => {
      return {
        id: props.id,
        data: {
          text: props.text,
        },
        styles: {
          level: props.level,
          align: "left",
        },
      };
    },
  },
};
