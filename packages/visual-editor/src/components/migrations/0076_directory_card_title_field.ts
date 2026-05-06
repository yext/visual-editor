import { Migration } from "../../utils/migrate.ts";

const defaultCardTitle = { defaultValue: "[[name]]" };

export const directoryCardTitleField: Migration = {
  DirectoryCard: {
    action: "updated",
    propTransformation: (props) => {
      const existingHeadingSlot = props.slots?.HeadingSlot?.[0];

      return {
        ...props,
        data: {
          ...props.data,
          cardTitle: defaultCardTitle,
        },
        slots: {
          ...props.slots,
          HeadingSlot: existingHeadingSlot
            ? [
                {
                  ...existingHeadingSlot,
                  props: {
                    ...existingHeadingSlot.props,
                    data: {
                      ...existingHeadingSlot.props.data,
                      text: {
                        field: "",
                        constantValue: defaultCardTitle,
                        constantValueEnabled: true,
                      },
                    },
                  },
                },
              ]
            : props.slots?.HeadingSlot,
        },
      };
    },
  },
};
