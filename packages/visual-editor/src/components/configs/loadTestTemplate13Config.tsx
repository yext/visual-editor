import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate13Category,
  SyntheticTemplate13Components,
  type SyntheticTemplate13Props,
} from "../syntheticLoadTest/SyntheticTemplate13Components.tsx";

export interface SyntheticTemplate13ConfigProps
  extends SyntheticTemplate13Props {}

const components: Config<SyntheticTemplate13ConfigProps>["components"] = {
  ...SyntheticTemplate13Components,
};

export const loadTestTemplate13Config: Config<SyntheticTemplate13ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 13",
        components: SyntheticTemplate13Category,
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
