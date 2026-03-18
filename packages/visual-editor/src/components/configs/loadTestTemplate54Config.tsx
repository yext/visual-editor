import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate54Category,
  SyntheticTemplate54Components,
  type SyntheticTemplate54Props,
} from "../syntheticLoadTest/SyntheticTemplate54Components.tsx";

export interface SyntheticTemplate54ConfigProps
  extends SyntheticTemplate54Props {}

const components: Config<SyntheticTemplate54ConfigProps>["components"] = {
  ...SyntheticTemplate54Components,
};

export const loadTestTemplate54Config: Config<SyntheticTemplate54ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 54",
        components: SyntheticTemplate54Category,
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
