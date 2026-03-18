import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate41Category,
  SyntheticTemplate41Components,
  type SyntheticTemplate41Props,
} from "../syntheticLoadTest/SyntheticTemplate41Components.tsx";

export interface SyntheticTemplate41ConfigProps
  extends SyntheticTemplate41Props {}

const components: Config<SyntheticTemplate41ConfigProps>["components"] = {
  ...SyntheticTemplate41Components,
};

export const loadTestTemplate41Config: Config<SyntheticTemplate41ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 41",
        components: SyntheticTemplate41Category,
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
