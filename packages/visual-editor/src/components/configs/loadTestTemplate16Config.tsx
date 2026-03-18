import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate16Category,
  SyntheticTemplate16Components,
  type SyntheticTemplate16Props,
} from "../syntheticLoadTest/SyntheticTemplate16Components.tsx";

export interface SyntheticTemplate16ConfigProps
  extends SyntheticTemplate16Props {}

const components: Config<SyntheticTemplate16ConfigProps>["components"] = {
  ...SyntheticTemplate16Components,
};

export const loadTestTemplate16Config: Config<SyntheticTemplate16ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 16",
        components: SyntheticTemplate16Category,
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
