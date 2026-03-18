import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate120Category,
  SyntheticTemplate120Components,
  type SyntheticTemplate120Props,
} from "../syntheticLoadTest/SyntheticTemplate120Components.tsx";

export interface SyntheticTemplate120ConfigProps
  extends SyntheticTemplate120Props {}

const components: Config<SyntheticTemplate120ConfigProps>["components"] = {
  ...SyntheticTemplate120Components,
};

export const loadTestTemplate120Config: Config<SyntheticTemplate120ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 120",
        components: SyntheticTemplate120Category,
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
