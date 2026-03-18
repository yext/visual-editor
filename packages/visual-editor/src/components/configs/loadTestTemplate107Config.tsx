import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate107Category,
  SyntheticTemplate107Components,
  type SyntheticTemplate107Props,
} from "../syntheticLoadTest/SyntheticTemplate107Components.tsx";

export interface SyntheticTemplate107ConfigProps
  extends SyntheticTemplate107Props {}

const components: Config<SyntheticTemplate107ConfigProps>["components"] = {
  ...SyntheticTemplate107Components,
};

export const loadTestTemplate107Config: Config<SyntheticTemplate107ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 107",
        components: SyntheticTemplate107Category,
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
