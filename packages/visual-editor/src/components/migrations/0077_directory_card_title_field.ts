import { Migration } from "../../utils/migrate.ts";

const defaultCardTitle = { defaultValue: "[[name]]" };

export const directoryCardTitleField: Migration = {
  DirectoryCard: {
    action: "updated",
    propTransformation: (props) => {
      const headingSlot = props.slots?.HeadingSlot?.[0];
      const cardTitle =
        props.data?.cardTitle ??
        headingSlot?.props?.data?.text ??
        defaultCardTitle;

      if (!headingSlot) {
        return {
          ...props,
          data: {
            ...props.data,
            cardTitle,
          },
        };
      }

      return {
        ...props,
        data: {
          ...props.data,
          cardTitle,
        },
        slots: {
          ...props.slots,
          HeadingSlot: [
            {
              ...headingSlot,
              type: "DirectoryCardTitleSlot",
              props: {
                ...headingSlot.props,
                data: {
                  ...headingSlot.props?.data,
                  text: cardTitle,
                },
              },
            },
          ],
        },
      };
    },
  },
};
