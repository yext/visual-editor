import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate03Category,
  SyntheticTemplate03Components,
  type SyntheticTemplate03Props,
} from "../syntheticLoadTest/SyntheticTemplate03Components.tsx";

export interface SyntheticTemplate03ConfigProps
  extends SyntheticTemplate03Props {}

const components: Config<SyntheticTemplate03ConfigProps>["components"] = {
  ...SyntheticTemplate03Components,
};

export const loadTestTemplate03Config: Config<SyntheticTemplate03ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 03",
        components: SyntheticTemplate03Category,
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
