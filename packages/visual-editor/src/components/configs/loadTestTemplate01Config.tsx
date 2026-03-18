import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate01Category,
  SyntheticTemplate01Components,
  type SyntheticTemplate01Props,
} from "../syntheticLoadTest/SyntheticTemplate01Components.tsx";

export interface SyntheticTemplate01ConfigProps
  extends SyntheticTemplate01Props {}

const components: Config<SyntheticTemplate01ConfigProps>["components"] = {
  ...SyntheticTemplate01Components,
};

export const loadTestTemplate01Config: Config<SyntheticTemplate01ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 01",
        components: SyntheticTemplate01Category,
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
