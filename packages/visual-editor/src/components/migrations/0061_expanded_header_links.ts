import { setDeep } from "@puckeditor/core";
import { Migration } from "../../utils/migrate.ts";

export const expandedHeaderLinks: Migration = {
  ExpandedHeader: {
    action: "updated",
    propTransformation: (props) => {
      let updatedProps = { ...props };
      const collapsedLinks =
        updatedProps.slots.SecondaryHeaderSlot?.[0]?.props.slots.LinksSlot?.[0]
          ?.props.data.collapsedLinks;

      delete updatedProps.slots.SecondaryHeaderSlot?.[0]?.props.slots
        .LinksSlot?.[0]?.props.data.collapsedLinks;

      updatedProps = setDeep(
        updatedProps,
        "slots.SecondaryHeaderSlot[0].props.slots.LinksSlot[0].props.data.collapsedLinks",
        collapsedLinks
      );
      updatedProps = setDeep(
        updatedProps,
        "slots.SecondaryHeaderSlot[0].props.slots.LinksSlot[0].props.styles",
        {
          variant: "xs",
        }
      );

      return updatedProps;
    },
  },
};
