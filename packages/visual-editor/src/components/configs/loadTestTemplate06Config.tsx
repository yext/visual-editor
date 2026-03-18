import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate06Category,
  SyntheticTemplate06Components,
  type SyntheticTemplate06Props,
} from "../syntheticLoadTest/SyntheticTemplate06Components.tsx";

export interface SyntheticTemplate06ConfigProps
  extends SyntheticTemplate06Props {}

const components: Config<SyntheticTemplate06ConfigProps>["components"] = {
  ...SyntheticTemplate06Components,
};

export const loadTestTemplate06Config: Config<SyntheticTemplate06ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 06",
        components: SyntheticTemplate06Category,
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
