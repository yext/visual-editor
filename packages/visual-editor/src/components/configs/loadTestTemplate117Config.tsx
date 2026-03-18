import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate117Category,
  SyntheticTemplate117Components,
  type SyntheticTemplate117Props,
} from "../syntheticLoadTest/SyntheticTemplate117Components.tsx";

export interface SyntheticTemplate117ConfigProps
  extends SyntheticTemplate117Props {}

const components: Config<SyntheticTemplate117ConfigProps>["components"] = {
  ...SyntheticTemplate117Components,
};

export const loadTestTemplate117Config: Config<SyntheticTemplate117ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 117",
        components: SyntheticTemplate117Category,
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
