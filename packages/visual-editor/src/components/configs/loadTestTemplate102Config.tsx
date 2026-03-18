import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate102Category,
  SyntheticTemplate102Components,
  type SyntheticTemplate102Props,
} from "../syntheticLoadTest/SyntheticTemplate102Components.tsx";

export interface SyntheticTemplate102ConfigProps
  extends SyntheticTemplate102Props {}

const components: Config<SyntheticTemplate102ConfigProps>["components"] = {
  ...SyntheticTemplate102Components,
};

export const loadTestTemplate102Config: Config<SyntheticTemplate102ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 102",
        components: SyntheticTemplate102Category,
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
