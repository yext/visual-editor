import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate84Category,
  SyntheticTemplate84Components,
  type SyntheticTemplate84Props,
} from "../syntheticLoadTest/SyntheticTemplate84Components.tsx";

export interface SyntheticTemplate84ConfigProps
  extends SyntheticTemplate84Props {}

const components: Config<SyntheticTemplate84ConfigProps>["components"] = {
  ...SyntheticTemplate84Components,
};

export const loadTestTemplate84Config: Config<SyntheticTemplate84ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 84",
        components: SyntheticTemplate84Category,
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
