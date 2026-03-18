import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate49Category,
  SyntheticTemplate49Components,
  type SyntheticTemplate49Props,
} from "../syntheticLoadTest/SyntheticTemplate49Components.tsx";

export interface SyntheticTemplate49ConfigProps
  extends SyntheticTemplate49Props {}

const components: Config<SyntheticTemplate49ConfigProps>["components"] = {
  ...SyntheticTemplate49Components,
};

export const loadTestTemplate49Config: Config<SyntheticTemplate49ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 49",
        components: SyntheticTemplate49Category,
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
