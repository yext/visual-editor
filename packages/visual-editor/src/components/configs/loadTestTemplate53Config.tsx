import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate53Category,
  SyntheticTemplate53Components,
  type SyntheticTemplate53Props,
} from "../syntheticLoadTest/SyntheticTemplate53Components.tsx";

export interface SyntheticTemplate53ConfigProps
  extends SyntheticTemplate53Props {}

const components: Config<SyntheticTemplate53ConfigProps>["components"] = {
  ...SyntheticTemplate53Components,
};

export const loadTestTemplate53Config: Config<SyntheticTemplate53ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 53",
        components: SyntheticTemplate53Category,
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
