import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate70Category,
  SyntheticTemplate70Components,
  type SyntheticTemplate70Props,
} from "../syntheticLoadTest/SyntheticTemplate70Components.tsx";

export interface SyntheticTemplate70ConfigProps
  extends SyntheticTemplate70Props {}

const components: Config<SyntheticTemplate70ConfigProps>["components"] = {
  ...SyntheticTemplate70Components,
};

export const loadTestTemplate70Config: Config<SyntheticTemplate70ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 70",
        components: SyntheticTemplate70Category,
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
