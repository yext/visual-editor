import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate18Category,
  SyntheticTemplate18Components,
  type SyntheticTemplate18Props,
} from "../syntheticLoadTest/SyntheticTemplate18Components.tsx";

export interface SyntheticTemplate18ConfigProps
  extends SyntheticTemplate18Props {}

const components: Config<SyntheticTemplate18ConfigProps>["components"] = {
  ...SyntheticTemplate18Components,
};

export const loadTestTemplate18Config: Config<SyntheticTemplate18ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 18",
        components: SyntheticTemplate18Category,
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
