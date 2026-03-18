import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate39Category,
  SyntheticTemplate39Components,
  type SyntheticTemplate39Props,
} from "../syntheticLoadTest/SyntheticTemplate39Components.tsx";

export interface SyntheticTemplate39ConfigProps
  extends SyntheticTemplate39Props {}

const components: Config<SyntheticTemplate39ConfigProps>["components"] = {
  ...SyntheticTemplate39Components,
};

export const loadTestTemplate39Config: Config<SyntheticTemplate39ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 39",
        components: SyntheticTemplate39Category,
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
