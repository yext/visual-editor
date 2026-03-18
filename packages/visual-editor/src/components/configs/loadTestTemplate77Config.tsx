import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate77Category,
  SyntheticTemplate77Components,
  type SyntheticTemplate77Props,
} from "../syntheticLoadTest/SyntheticTemplate77Components.tsx";

export interface SyntheticTemplate77ConfigProps
  extends SyntheticTemplate77Props {}

const components: Config<SyntheticTemplate77ConfigProps>["components"] = {
  ...SyntheticTemplate77Components,
};

export const loadTestTemplate77Config: Config<SyntheticTemplate77ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 77",
        components: SyntheticTemplate77Category,
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
