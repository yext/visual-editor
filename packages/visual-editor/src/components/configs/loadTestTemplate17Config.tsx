import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate17Category,
  SyntheticTemplate17Components,
  type SyntheticTemplate17Props,
} from "../syntheticLoadTest/SyntheticTemplate17Components.tsx";

export interface SyntheticTemplate17ConfigProps
  extends SyntheticTemplate17Props {}

const components: Config<SyntheticTemplate17ConfigProps>["components"] = {
  ...SyntheticTemplate17Components,
};

export const loadTestTemplate17Config: Config<SyntheticTemplate17ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 17",
        components: SyntheticTemplate17Category,
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
