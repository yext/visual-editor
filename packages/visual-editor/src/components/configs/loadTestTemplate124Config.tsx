import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate124Category,
  SyntheticTemplate124Components,
  type SyntheticTemplate124Props,
} from "../syntheticLoadTest/SyntheticTemplate124Components.tsx";

export interface SyntheticTemplate124ConfigProps
  extends SyntheticTemplate124Props {}

const components: Config<SyntheticTemplate124ConfigProps>["components"] = {
  ...SyntheticTemplate124Components,
};

export const loadTestTemplate124Config: Config<SyntheticTemplate124ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 124",
        components: SyntheticTemplate124Category,
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
