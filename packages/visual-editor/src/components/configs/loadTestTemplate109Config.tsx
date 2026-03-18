import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate109Category,
  SyntheticTemplate109Components,
  type SyntheticTemplate109Props,
} from "../syntheticLoadTest/SyntheticTemplate109Components.tsx";

export interface SyntheticTemplate109ConfigProps
  extends SyntheticTemplate109Props {}

const components: Config<SyntheticTemplate109ConfigProps>["components"] = {
  ...SyntheticTemplate109Components,
};

export const loadTestTemplate109Config: Config<SyntheticTemplate109ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 109",
        components: SyntheticTemplate109Category,
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
