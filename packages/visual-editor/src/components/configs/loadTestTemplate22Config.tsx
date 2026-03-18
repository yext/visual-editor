import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate22Category,
  SyntheticTemplate22Components,
  type SyntheticTemplate22Props,
} from "../syntheticLoadTest/SyntheticTemplate22Components.tsx";

export interface SyntheticTemplate22ConfigProps
  extends SyntheticTemplate22Props {}

const components: Config<SyntheticTemplate22ConfigProps>["components"] = {
  ...SyntheticTemplate22Components,
};

export const loadTestTemplate22Config: Config<SyntheticTemplate22ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 22",
        components: SyntheticTemplate22Category,
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
