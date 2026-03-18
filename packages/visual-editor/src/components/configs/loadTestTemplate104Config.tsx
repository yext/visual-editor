import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate104Category,
  SyntheticTemplate104Components,
  type SyntheticTemplate104Props,
} from "../syntheticLoadTest/SyntheticTemplate104Components.tsx";

export interface SyntheticTemplate104ConfigProps
  extends SyntheticTemplate104Props {}

const components: Config<SyntheticTemplate104ConfigProps>["components"] = {
  ...SyntheticTemplate104Components,
};

export const loadTestTemplate104Config: Config<SyntheticTemplate104ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 104",
        components: SyntheticTemplate104Category,
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
