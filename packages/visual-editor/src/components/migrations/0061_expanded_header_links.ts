import { Migration } from "../../utils/migrate.ts";

export const expandedHeaderLinks: Migration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      const collapsedLinks =
        props.slots.SecondaryHeaderSlot?.[0]?.props.slots.LinksSlot?.[0]?.props
          .data.collapsedLinks;

      delete props.slots.SecondaryHeaderSlot?.[0]?.props.slots.LinksSlot?.[0]
        ?.props.data.collapsedLinks;

      return {
        ...props,
        slots: {
          ...props.slots,
          PrimaryHeaderSlot: [
            {
              ...props.slots.PrimaryHeaderSlot?.[0],
              props: {
                ...props.slots.PrimaryHeaderSlot?.[0]?.props,
                slots: {
                  ...props.slots.PrimaryHeaderSlot?.[0]?.props.slots,
                  LinksSlot: [
                    {
                      ...props.slots.PrimaryHeaderSlot?.[0]?.props.slots
                        .LinksSlot?.[0],
                      props: {
                        ...props.slots.PrimaryHeaderSlot?.[0]?.props.slots
                          .LinksSlot?.[0]?.props,
                        data: {
                          ...props.slots.PrimaryHeaderSlot?.[0]?.props.slots
                            .LinksSlot?.[0]?.props.data,
                          collapsedLinks: collapsedLinks || [],
                        },
                      },
                    },
                    ...(props.slots.PrimaryHeaderSlot?.[0]?.props.slots.LinksSlot?.slice(
                      1
                    ) || []),
                  ],
                },
              },
            },
          ],
          SecondaryHeaderSlot: [
            {
              ...props.slots.SecondaryHeaderSlot?.[0],
              props: {
                ...props.slots.SecondaryHeaderSlot?.[0]?.props,
                slots: {
                  ...props.slots.SecondaryHeaderSlot?.[0]?.props.slots,
                  LinksSlot: [
                    {
                      ...props.slots.SecondaryHeaderSlot?.[0]?.props.slots
                        .LinksSlot?.[0],
                      props: {
                        ...props.slots.SecondaryHeaderSlot?.[0]?.props.slots
                          .LinksSlot?.[0]?.props,
                        styles: {
                          variant: "xs",
                        },
                      },
                    },
                    ...(props.slots.SecondaryHeaderSlot?.[0]?.props.slots.LinksSlot?.slice(
                      1
                    ) || []),
                  ],
                },
              },
            },
          ],
        },
      };
    },
  },
};
