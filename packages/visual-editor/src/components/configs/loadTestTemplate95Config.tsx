import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate95Category,
  SyntheticTemplate95Components,
  type SyntheticTemplate95Props,
} from "../syntheticLoadTest/SyntheticTemplate95Components.tsx";

export interface SyntheticTemplate95ConfigProps
  extends SyntheticTemplate95Props {}

const components: Config<SyntheticTemplate95ConfigProps>["components"] = {
  ...SyntheticTemplate95Components,
};

export const loadTestTemplate95Config: Config<SyntheticTemplate95ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 95",
        components: SyntheticTemplate95Category,
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
