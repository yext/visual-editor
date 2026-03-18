import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate19Category,
  SyntheticTemplate19Components,
  type SyntheticTemplate19Props,
} from "../syntheticLoadTest/SyntheticTemplate19Components.tsx";

export interface SyntheticTemplate19ConfigProps
  extends SyntheticTemplate19Props {}

const components: Config<SyntheticTemplate19ConfigProps>["components"] = {
  ...SyntheticTemplate19Components,
};

export const loadTestTemplate19Config: Config<SyntheticTemplate19ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 19",
        components: SyntheticTemplate19Category,
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
