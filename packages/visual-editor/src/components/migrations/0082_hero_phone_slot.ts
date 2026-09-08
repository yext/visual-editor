import { Migration } from "../../utils/migrate.ts";

export const heroPhoneSlotMigration: Migration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      styles: {
        ...props.styles,
        showPhone: props.styles?.showPhone ?? false,
      },
      slots: {
        ...props.slots,
        PhoneSlot: props.slots?.PhoneSlot ?? [
          {
            type: "PhoneNumbersSlot",
            props: {
              id: `${props.id}-PhoneSlot`,
              data: {
                phoneNumbers: [
                  {
                    number: {
                      field: "mainPhone",
                      constantValue: "",
                    },
                    label: { defaultValue: "Phone" },
                  },
                ],
              },
              styles: {
                phoneFormat: "domestic",
                includePhoneHyperlink: true,
              },
            },
          },
        ],
      },
    }),
  },
};
