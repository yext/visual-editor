import { Migration } from "../../utils/migrate.ts";

export const fixDirectoryTitleBindingAndSlotifyAddress: Migration = {
  DirectoryCard: {
    action: "updated",
    propTransformation: (props) => {
      if (props.slots?.AddressSlot?.length) {
        return props;
      }
      return {
        ...props,
        slots: {
          ...props.slots,
          AddressSlot: [
            {
              type: "AddressSlot",
              props: {
                data: {
                  address: {
                    constantValue: {
                      line1: "",
                      city: "",
                      postalCode: "",
                      countryCode: "",
                    },
                    field: "",
                  },
                },
                styles: {
                  showGetDirectionsLink: false,
                  ctaVariant: "link",
                  hideCountry: true,
                },
                parentData: {
                  field: "profile.address",
                  address: props.parentData?.profile?.address,
                },
              },
            },
          ],
        },
      };
    },
  },
  Directory: {
    action: "updated",
    propTransformation: (props) => {
      const titleId =
        props.slots?.TitleSlot?.[0]?.props?.id ??
        `HeadingTextSlot-${crypto.randomUUID?.() ?? Date.now()}`;
      let updatedProps = {
        ...props,
        slots: {
          ...props.slots,
          TitleSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: titleId,
                data: {
                  text: {
                    constantValue: {
                      en: "",
                      hasLocalizedValue: "true",
                    },
                    constantValueEnabled: false,
                    field: "name",
                  },
                },
                styles: { level: 2, align: "center" },
              },
            },
          ],
        },
      };
      return updatedProps;
    },
  },
};
