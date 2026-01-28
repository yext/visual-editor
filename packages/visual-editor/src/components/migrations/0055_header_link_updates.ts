import { setDeep } from "@puckeditor/core";
import { Migration } from "../../utils/migrate.ts";

export const headerLinksUpdate: Migration = {
  PrimaryHeaderSlot: {
    action: "updated",
    propTransformation: (props) => {
      return setDeep(props, "slots.LinksSlot[0].props.parentData", {
        type: "Primary",
      });
    },
  },
  SecondaryHeaderSlot: {
    action: "updated",
    propTransformation: (props) => {
      let updatedProps = { ...props };

      updatedProps = setDeep(
        updatedProps,
        "slots.LinksSlot[0].props.parentData",
        {
          type: "Secondary",
        }
      );

      updatedProps = setDeep(
        updatedProps,
        "slots.LinksSlot[0].props.data.collapsedLinks",
        []
      );

      return updatedProps;
    },
  },
};
