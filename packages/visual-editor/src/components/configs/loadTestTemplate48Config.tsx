import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate48Category,
  SyntheticTemplate48Components,
  type SyntheticTemplate48Props,
} from "../syntheticLoadTest/SyntheticTemplate48Components.tsx";

export interface SyntheticTemplate48ConfigProps
  extends SyntheticTemplate48Props {}

const components: Config<SyntheticTemplate48ConfigProps>["components"] = {
  ...SyntheticTemplate48Components,
};

export const loadTestTemplate48Config: Config<SyntheticTemplate48ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 48",
        components: SyntheticTemplate48Category,
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
