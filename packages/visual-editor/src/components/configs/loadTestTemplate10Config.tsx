import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate10Category,
  SyntheticTemplate10Components,
  type SyntheticTemplate10Props,
} from "../syntheticLoadTest/SyntheticTemplate10Components.tsx";

export interface SyntheticTemplate10ConfigProps
  extends SyntheticTemplate10Props {}

const components: Config<SyntheticTemplate10ConfigProps>["components"] = {
  ...SyntheticTemplate10Components,
};

export const loadTestTemplate10Config: Config<SyntheticTemplate10ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 10",
        components: SyntheticTemplate10Category,
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
