import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate83Category,
  SyntheticTemplate83Components,
  type SyntheticTemplate83Props,
} from "../syntheticLoadTest/SyntheticTemplate83Components.tsx";

export interface SyntheticTemplate83ConfigProps
  extends SyntheticTemplate83Props {}

const components: Config<SyntheticTemplate83ConfigProps>["components"] = {
  ...SyntheticTemplate83Components,
};

export const loadTestTemplate83Config: Config<SyntheticTemplate83ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 83",
        components: SyntheticTemplate83Category,
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
