import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate36Category,
  SyntheticTemplate36Components,
  type SyntheticTemplate36Props,
} from "../syntheticLoadTest/SyntheticTemplate36Components.tsx";

export interface SyntheticTemplate36ConfigProps
  extends SyntheticTemplate36Props {}

const components: Config<SyntheticTemplate36ConfigProps>["components"] = {
  ...SyntheticTemplate36Components,
};

export const loadTestTemplate36Config: Config<SyntheticTemplate36ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 36",
        components: SyntheticTemplate36Category,
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
