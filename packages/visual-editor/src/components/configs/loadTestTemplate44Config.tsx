import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate44Category,
  SyntheticTemplate44Components,
  type SyntheticTemplate44Props,
} from "../syntheticLoadTest/SyntheticTemplate44Components.tsx";

export interface SyntheticTemplate44ConfigProps
  extends SyntheticTemplate44Props {}

const components: Config<SyntheticTemplate44ConfigProps>["components"] = {
  ...SyntheticTemplate44Components,
};

export const loadTestTemplate44Config: Config<SyntheticTemplate44ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 44",
        components: SyntheticTemplate44Category,
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
