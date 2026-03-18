import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate02Category,
  SyntheticTemplate02Components,
  type SyntheticTemplate02Props,
} from "../syntheticLoadTest/SyntheticTemplate02Components.tsx";

export interface SyntheticTemplate02ConfigProps
  extends SyntheticTemplate02Props {}

const components: Config<SyntheticTemplate02ConfigProps>["components"] = {
  ...SyntheticTemplate02Components,
};

export const loadTestTemplate02Config: Config<SyntheticTemplate02ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 02",
        components: SyntheticTemplate02Category,
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
