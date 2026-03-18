import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate90Category,
  SyntheticTemplate90Components,
  type SyntheticTemplate90Props,
} from "../syntheticLoadTest/SyntheticTemplate90Components.tsx";

export interface SyntheticTemplate90ConfigProps
  extends SyntheticTemplate90Props {}

const components: Config<SyntheticTemplate90ConfigProps>["components"] = {
  ...SyntheticTemplate90Components,
};

export const loadTestTemplate90Config: Config<SyntheticTemplate90ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 90",
        components: SyntheticTemplate90Category,
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
