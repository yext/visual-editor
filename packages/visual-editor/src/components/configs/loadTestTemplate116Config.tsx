import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate116Category,
  SyntheticTemplate116Components,
  type SyntheticTemplate116Props,
} from "../syntheticLoadTest/SyntheticTemplate116Components.tsx";

export interface SyntheticTemplate116ConfigProps
  extends SyntheticTemplate116Props {}

const components: Config<SyntheticTemplate116ConfigProps>["components"] = {
  ...SyntheticTemplate116Components,
};

export const loadTestTemplate116Config: Config<SyntheticTemplate116ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 116",
        components: SyntheticTemplate116Category,
      },
    },
    root: {
      render: () => (
        <DropZone
          zone="default-zone"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        />
      ),
    },
  };
