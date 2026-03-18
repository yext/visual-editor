import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate115Category,
  SyntheticTemplate115Components,
  type SyntheticTemplate115Props,
} from "../syntheticLoadTest/SyntheticTemplate115Components.tsx";

export interface SyntheticTemplate115ConfigProps
  extends SyntheticTemplate115Props {}

const components: Config<SyntheticTemplate115ConfigProps>["components"] = {
  ...SyntheticTemplate115Components,
};

export const loadTestTemplate115Config: Config<SyntheticTemplate115ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 115",
        components: SyntheticTemplate115Category,
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
