import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate96Category,
  SyntheticTemplate96Components,
  type SyntheticTemplate96Props,
} from "../syntheticLoadTest/SyntheticTemplate96Components.tsx";

export interface SyntheticTemplate96ConfigProps
  extends SyntheticTemplate96Props {}

const components: Config<SyntheticTemplate96ConfigProps>["components"] = {
  ...SyntheticTemplate96Components,
};

export const loadTestTemplate96Config: Config<SyntheticTemplate96ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 96",
        components: SyntheticTemplate96Category,
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
