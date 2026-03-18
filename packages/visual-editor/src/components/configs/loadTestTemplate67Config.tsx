import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate67Category,
  SyntheticTemplate67Components,
  type SyntheticTemplate67Props,
} from "../syntheticLoadTest/SyntheticTemplate67Components.tsx";

export interface SyntheticTemplate67ConfigProps
  extends SyntheticTemplate67Props {}

const components: Config<SyntheticTemplate67ConfigProps>["components"] = {
  ...SyntheticTemplate67Components,
};

export const loadTestTemplate67Config: Config<SyntheticTemplate67ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 67",
        components: SyntheticTemplate67Category,
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
