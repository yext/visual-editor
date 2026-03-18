import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate128Category,
  SyntheticTemplate128Components,
  type SyntheticTemplate128Props,
} from "../syntheticLoadTest/SyntheticTemplate128Components.tsx";

export interface SyntheticTemplate128ConfigProps
  extends SyntheticTemplate128Props {}

const components: Config<SyntheticTemplate128ConfigProps>["components"] = {
  ...SyntheticTemplate128Components,
};

export const loadTestTemplate128Config: Config<SyntheticTemplate128ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 128",
        components: SyntheticTemplate128Category,
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
