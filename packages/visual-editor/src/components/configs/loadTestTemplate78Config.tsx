import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate78Category,
  SyntheticTemplate78Components,
  type SyntheticTemplate78Props,
} from "../syntheticLoadTest/SyntheticTemplate78Components.tsx";

export interface SyntheticTemplate78ConfigProps
  extends SyntheticTemplate78Props {}

const components: Config<SyntheticTemplate78ConfigProps>["components"] = {
  ...SyntheticTemplate78Components,
};

export const loadTestTemplate78Config: Config<SyntheticTemplate78ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 78",
        components: SyntheticTemplate78Category,
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
