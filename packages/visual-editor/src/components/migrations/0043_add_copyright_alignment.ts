import { setDeep } from "@measured/puck";
import { Migration } from "../../utils/migrate";

export const addCopyrightAlignment: Migration = {
  SecondaryFooterSlot: {
    action: "updated",
    propTransformation: (props) => {
      const copyrightSlot = props?.slots?.CopyrightSlot?.[0];
      const linksAlignment = props?.styles?.linksAlignment || "left";

      // Add alignment prop to CopyrightSlot if it doesn't exist
      if (copyrightSlot && copyrightSlot.props?.alignment === undefined) {
        return setDeep(
          props,
          "slots.CopyrightSlot[0].props.alignment",
          linksAlignment
        );
      }

      return props;
    },
  },
};
