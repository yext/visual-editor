import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate108Category,
  SyntheticTemplate108Components,
  type SyntheticTemplate108Props,
} from "../syntheticLoadTest/SyntheticTemplate108Components.tsx";

export interface SyntheticTemplate108ConfigProps
  extends SyntheticTemplate108Props {}

const components: Config<SyntheticTemplate108ConfigProps>["components"] = {
  ...SyntheticTemplate108Components,
};

export const loadTestTemplate108Config: Config<SyntheticTemplate108ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 108",
        components: SyntheticTemplate108Category,
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
