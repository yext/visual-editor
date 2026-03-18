import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate56Category,
  SyntheticTemplate56Components,
  type SyntheticTemplate56Props,
} from "../syntheticLoadTest/SyntheticTemplate56Components.tsx";

export interface SyntheticTemplate56ConfigProps
  extends SyntheticTemplate56Props {}

const components: Config<SyntheticTemplate56ConfigProps>["components"] = {
  ...SyntheticTemplate56Components,
};

export const loadTestTemplate56Config: Config<SyntheticTemplate56ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 56",
        components: SyntheticTemplate56Category,
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
