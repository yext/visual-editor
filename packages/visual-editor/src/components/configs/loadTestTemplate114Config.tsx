import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate114Category,
  SyntheticTemplate114Components,
  type SyntheticTemplate114Props,
} from "../syntheticLoadTest/SyntheticTemplate114Components.tsx";

export interface SyntheticTemplate114ConfigProps
  extends SyntheticTemplate114Props {}

const components: Config<SyntheticTemplate114ConfigProps>["components"] = {
  ...SyntheticTemplate114Components,
};

export const loadTestTemplate114Config: Config<SyntheticTemplate114ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 114",
        components: SyntheticTemplate114Category,
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
