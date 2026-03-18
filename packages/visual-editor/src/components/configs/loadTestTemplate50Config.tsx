import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate50Category,
  SyntheticTemplate50Components,
  type SyntheticTemplate50Props,
} from "../syntheticLoadTest/SyntheticTemplate50Components.tsx";

export interface SyntheticTemplate50ConfigProps
  extends SyntheticTemplate50Props {}

const components: Config<SyntheticTemplate50ConfigProps>["components"] = {
  ...SyntheticTemplate50Components,
};

export const loadTestTemplate50Config: Config<SyntheticTemplate50ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 50",
        components: SyntheticTemplate50Category,
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
