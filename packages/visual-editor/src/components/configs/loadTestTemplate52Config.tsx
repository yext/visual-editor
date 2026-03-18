import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate52Category,
  SyntheticTemplate52Components,
  type SyntheticTemplate52Props,
} from "../syntheticLoadTest/SyntheticTemplate52Components.tsx";

export interface SyntheticTemplate52ConfigProps
  extends SyntheticTemplate52Props {}

const components: Config<SyntheticTemplate52ConfigProps>["components"] = {
  ...SyntheticTemplate52Components,
};

export const loadTestTemplate52Config: Config<SyntheticTemplate52ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 52",
        components: SyntheticTemplate52Category,
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
