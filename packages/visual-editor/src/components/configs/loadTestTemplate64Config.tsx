import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate64Category,
  SyntheticTemplate64Components,
  type SyntheticTemplate64Props,
} from "../syntheticLoadTest/SyntheticTemplate64Components.tsx";

export interface SyntheticTemplate64ConfigProps
  extends SyntheticTemplate64Props {}

const components: Config<SyntheticTemplate64ConfigProps>["components"] = {
  ...SyntheticTemplate64Components,
};

export const loadTestTemplate64Config: Config<SyntheticTemplate64ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 64",
        components: SyntheticTemplate64Category,
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
