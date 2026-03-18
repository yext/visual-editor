import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate55Category,
  SyntheticTemplate55Components,
  type SyntheticTemplate55Props,
} from "../syntheticLoadTest/SyntheticTemplate55Components.tsx";

export interface SyntheticTemplate55ConfigProps
  extends SyntheticTemplate55Props {}

const components: Config<SyntheticTemplate55ConfigProps>["components"] = {
  ...SyntheticTemplate55Components,
};

export const loadTestTemplate55Config: Config<SyntheticTemplate55ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 55",
        components: SyntheticTemplate55Category,
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
