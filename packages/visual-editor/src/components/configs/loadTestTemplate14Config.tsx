import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate14Category,
  SyntheticTemplate14Components,
  type SyntheticTemplate14Props,
} from "../syntheticLoadTest/SyntheticTemplate14Components.tsx";

export interface SyntheticTemplate14ConfigProps
  extends SyntheticTemplate14Props {}

const components: Config<SyntheticTemplate14ConfigProps>["components"] = {
  ...SyntheticTemplate14Components,
};

export const loadTestTemplate14Config: Config<SyntheticTemplate14ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 14",
        components: SyntheticTemplate14Category,
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
