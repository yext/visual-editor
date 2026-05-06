import { Migration } from "../../utils/migrate.ts";

const defaultCardTitle = { defaultValue: "[[name]]" };

export const directoryCardTitleField: Migration = {
  DirectoryCard: {
    action: "updated",
    propTransformation: (props) => {
      const headingSlot = props.slots?.HeadingSlot?.[0];
      const cardTitle = props.data?.cardTitle ?? defaultCardTitle;
      const { data: _data, ...restProps } = props;

      if (!headingSlot) {
        return restProps;
      }

      return {
        ...restProps,
        slots: {
          ...props.slots,
          HeadingSlot: [
            {
              ...headingSlot,
              type: "DirectoryCardTitleSlot",
              props: {
                id: headingSlot.props?.id,
                styles: headingSlot.props?.styles,
                data: {
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
