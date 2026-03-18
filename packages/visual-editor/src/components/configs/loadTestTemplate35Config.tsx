import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate35Category,
  SyntheticTemplate35Components,
  type SyntheticTemplate35Props,
} from "../syntheticLoadTest/SyntheticTemplate35Components.tsx";

export interface SyntheticTemplate35ConfigProps
  extends SyntheticTemplate35Props {}

const components: Config<SyntheticTemplate35ConfigProps>["components"] = {
  ...SyntheticTemplate35Components,
};

export const loadTestTemplate35Config: Config<SyntheticTemplate35ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 35",
        components: SyntheticTemplate35Category,
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
