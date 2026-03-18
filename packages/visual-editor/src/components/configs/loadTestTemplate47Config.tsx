import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate47Category,
  SyntheticTemplate47Components,
  type SyntheticTemplate47Props,
} from "../syntheticLoadTest/SyntheticTemplate47Components.tsx";

export interface SyntheticTemplate47ConfigProps
  extends SyntheticTemplate47Props {}

const components: Config<SyntheticTemplate47ConfigProps>["components"] = {
  ...SyntheticTemplate47Components,
};

export const loadTestTemplate47Config: Config<SyntheticTemplate47ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 47",
        components: SyntheticTemplate47Category,
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
