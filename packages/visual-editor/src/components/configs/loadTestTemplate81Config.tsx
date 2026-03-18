import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate81Category,
  SyntheticTemplate81Components,
  type SyntheticTemplate81Props,
} from "../syntheticLoadTest/SyntheticTemplate81Components.tsx";

export interface SyntheticTemplate81ConfigProps
  extends SyntheticTemplate81Props {}

const components: Config<SyntheticTemplate81ConfigProps>["components"] = {
  ...SyntheticTemplate81Components,
};

export const loadTestTemplate81Config: Config<SyntheticTemplate81ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 81",
        components: SyntheticTemplate81Category,
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
