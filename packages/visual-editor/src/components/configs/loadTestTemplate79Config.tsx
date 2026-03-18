import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate79Category,
  SyntheticTemplate79Components,
  type SyntheticTemplate79Props,
} from "../syntheticLoadTest/SyntheticTemplate79Components.tsx";

export interface SyntheticTemplate79ConfigProps
  extends SyntheticTemplate79Props {}

const components: Config<SyntheticTemplate79ConfigProps>["components"] = {
  ...SyntheticTemplate79Components,
};

export const loadTestTemplate79Config: Config<SyntheticTemplate79ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 79",
        components: SyntheticTemplate79Category,
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
