import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate80Category,
  SyntheticTemplate80Components,
  type SyntheticTemplate80Props,
} from "../syntheticLoadTest/SyntheticTemplate80Components.tsx";

export interface SyntheticTemplate80ConfigProps
  extends SyntheticTemplate80Props {}

const components: Config<SyntheticTemplate80ConfigProps>["components"] = {
  ...SyntheticTemplate80Components,
};

export const loadTestTemplate80Config: Config<SyntheticTemplate80ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 80",
        components: SyntheticTemplate80Category,
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
