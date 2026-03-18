import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate93Category,
  SyntheticTemplate93Components,
  type SyntheticTemplate93Props,
} from "../syntheticLoadTest/SyntheticTemplate93Components.tsx";

export interface SyntheticTemplate93ConfigProps
  extends SyntheticTemplate93Props {}

const components: Config<SyntheticTemplate93ConfigProps>["components"] = {
  ...SyntheticTemplate93Components,
};

export const loadTestTemplate93Config: Config<SyntheticTemplate93ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 93",
        components: SyntheticTemplate93Category,
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
