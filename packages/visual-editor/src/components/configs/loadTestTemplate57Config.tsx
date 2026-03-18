import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate57Category,
  SyntheticTemplate57Components,
  type SyntheticTemplate57Props,
} from "../syntheticLoadTest/SyntheticTemplate57Components.tsx";

export interface SyntheticTemplate57ConfigProps
  extends SyntheticTemplate57Props {}

const components: Config<SyntheticTemplate57ConfigProps>["components"] = {
  ...SyntheticTemplate57Components,
};

export const loadTestTemplate57Config: Config<SyntheticTemplate57ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 57",
        components: SyntheticTemplate57Category,
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
