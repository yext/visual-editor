import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate04Category,
  SyntheticTemplate04Components,
  type SyntheticTemplate04Props,
} from "../syntheticLoadTest/SyntheticTemplate04Components.tsx";

export interface SyntheticTemplate04ConfigProps
  extends SyntheticTemplate04Props {}

const components: Config<SyntheticTemplate04ConfigProps>["components"] = {
  ...SyntheticTemplate04Components,
};

export const loadTestTemplate04Config: Config<SyntheticTemplate04ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 04",
        components: SyntheticTemplate04Category,
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
