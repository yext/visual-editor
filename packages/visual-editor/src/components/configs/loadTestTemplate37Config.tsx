import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate37Category,
  SyntheticTemplate37Components,
  type SyntheticTemplate37Props,
} from "../syntheticLoadTest/SyntheticTemplate37Components.tsx";

export interface SyntheticTemplate37ConfigProps
  extends SyntheticTemplate37Props {}

const components: Config<SyntheticTemplate37ConfigProps>["components"] = {
  ...SyntheticTemplate37Components,
};

export const loadTestTemplate37Config: Config<SyntheticTemplate37ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 37",
        components: SyntheticTemplate37Category,
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
