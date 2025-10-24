import { Migration } from "../../utils/migrate";

export const expandedFooterSlots: Migration = {
  ExpandedFooter: {
    action: "updated",
    propTransformation: (props) => {
      const copyrightMessage = props.data.secondaryFooter?.copyrightMessage || {
        en: "",
        hasLocalizedValue: "true",
      };

      // Remove copyrightMessage from data.secondaryFooter since it's now in a slot
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { copyrightMessage: _removed, ...restSecondaryFooter } =
        props.data.secondaryFooter || {};

      return {
        ...props,
        data: {
          ...props.data,
          secondaryFooter: restSecondaryFooter,
        },
        slots: {
          CopyrightSlot: [
            {
              type: "BodyTextSlot",
              props: {
                data: {
                  text: {
                    field: "",
                    constantValue: copyrightMessage,
                    constantValueEnabled: true,
                  },
                },
                styles: {
                  variant: "xs",
                },
              },
            },
          ],
        },
      };
    },
  },
};
