import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate34Category,
  SyntheticTemplate34Components,
  type SyntheticTemplate34Props,
} from "../syntheticLoadTest/SyntheticTemplate34Components.tsx";

export interface SyntheticTemplate34ConfigProps
  extends SyntheticTemplate34Props {}

const components: Config<SyntheticTemplate34ConfigProps>["components"] = {
  ...SyntheticTemplate34Components,
};

export const loadTestTemplate34Config: Config<SyntheticTemplate34ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 34",
        components: SyntheticTemplate34Category,
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
