import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate32Category,
  SyntheticTemplate32Components,
  type SyntheticTemplate32Props,
} from "../syntheticLoadTest/SyntheticTemplate32Components.tsx";

export interface SyntheticTemplate32ConfigProps
  extends SyntheticTemplate32Props {}

const components: Config<SyntheticTemplate32ConfigProps>["components"] = {
  ...SyntheticTemplate32Components,
};

export const loadTestTemplate32Config: Config<SyntheticTemplate32ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 32",
        components: SyntheticTemplate32Category,
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
