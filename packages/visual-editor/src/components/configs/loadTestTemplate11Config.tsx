import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate11Category,
  SyntheticTemplate11Components,
  type SyntheticTemplate11Props,
} from "../syntheticLoadTest/SyntheticTemplate11Components.tsx";

export interface SyntheticTemplate11ConfigProps
  extends SyntheticTemplate11Props {}

const components: Config<SyntheticTemplate11ConfigProps>["components"] = {
  ...SyntheticTemplate11Components,
};

export const loadTestTemplate11Config: Config<SyntheticTemplate11ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 11",
        components: SyntheticTemplate11Category,
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
