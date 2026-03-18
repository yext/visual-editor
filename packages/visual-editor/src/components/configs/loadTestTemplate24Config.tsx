import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate24Category,
  SyntheticTemplate24Components,
  type SyntheticTemplate24Props,
} from "../syntheticLoadTest/SyntheticTemplate24Components.tsx";

export interface SyntheticTemplate24ConfigProps
  extends SyntheticTemplate24Props {}

const components: Config<SyntheticTemplate24ConfigProps>["components"] = {
  ...SyntheticTemplate24Components,
};

export const loadTestTemplate24Config: Config<SyntheticTemplate24ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 24",
        components: SyntheticTemplate24Category,
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
