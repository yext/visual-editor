import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate27Category,
  SyntheticTemplate27Components,
  type SyntheticTemplate27Props,
} from "../syntheticLoadTest/SyntheticTemplate27Components.tsx";

export interface SyntheticTemplate27ConfigProps
  extends SyntheticTemplate27Props {}

const components: Config<SyntheticTemplate27ConfigProps>["components"] = {
  ...SyntheticTemplate27Components,
};

export const loadTestTemplate27Config: Config<SyntheticTemplate27ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 27",
        components: SyntheticTemplate27Category,
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
