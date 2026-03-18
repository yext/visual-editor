import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate60Category,
  SyntheticTemplate60Components,
  type SyntheticTemplate60Props,
} from "../syntheticLoadTest/SyntheticTemplate60Components.tsx";

export interface SyntheticTemplate60ConfigProps
  extends SyntheticTemplate60Props {}

const components: Config<SyntheticTemplate60ConfigProps>["components"] = {
  ...SyntheticTemplate60Components,
};

export const loadTestTemplate60Config: Config<SyntheticTemplate60ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 60",
        components: SyntheticTemplate60Category,
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
