import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate42Category,
  SyntheticTemplate42Components,
  type SyntheticTemplate42Props,
} from "../syntheticLoadTest/SyntheticTemplate42Components.tsx";

export interface SyntheticTemplate42ConfigProps
  extends SyntheticTemplate42Props {}

const components: Config<SyntheticTemplate42ConfigProps>["components"] = {
  ...SyntheticTemplate42Components,
};

export const loadTestTemplate42Config: Config<SyntheticTemplate42ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 42",
        components: SyntheticTemplate42Category,
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
