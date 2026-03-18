import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate23Category,
  SyntheticTemplate23Components,
  type SyntheticTemplate23Props,
} from "../syntheticLoadTest/SyntheticTemplate23Components.tsx";

export interface SyntheticTemplate23ConfigProps
  extends SyntheticTemplate23Props {}

const components: Config<SyntheticTemplate23ConfigProps>["components"] = {
  ...SyntheticTemplate23Components,
};

export const loadTestTemplate23Config: Config<SyntheticTemplate23ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 23",
        components: SyntheticTemplate23Category,
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
