import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate75Category,
  SyntheticTemplate75Components,
  type SyntheticTemplate75Props,
} from "../syntheticLoadTest/SyntheticTemplate75Components.tsx";

export interface SyntheticTemplate75ConfigProps
  extends SyntheticTemplate75Props {}

const components: Config<SyntheticTemplate75ConfigProps>["components"] = {
  ...SyntheticTemplate75Components,
};

export const loadTestTemplate75Config: Config<SyntheticTemplate75ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 75",
        components: SyntheticTemplate75Category,
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
