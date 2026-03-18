import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate113Category,
  SyntheticTemplate113Components,
  type SyntheticTemplate113Props,
} from "../syntheticLoadTest/SyntheticTemplate113Components.tsx";

export interface SyntheticTemplate113ConfigProps
  extends SyntheticTemplate113Props {}

const components: Config<SyntheticTemplate113ConfigProps>["components"] = {
  ...SyntheticTemplate113Components,
};

export const loadTestTemplate113Config: Config<SyntheticTemplate113ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 113",
        components: SyntheticTemplate113Category,
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
