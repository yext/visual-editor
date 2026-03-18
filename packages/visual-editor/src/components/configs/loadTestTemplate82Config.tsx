import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate82Category,
  SyntheticTemplate82Components,
  type SyntheticTemplate82Props,
} from "../syntheticLoadTest/SyntheticTemplate82Components.tsx";

export interface SyntheticTemplate82ConfigProps
  extends SyntheticTemplate82Props {}

const components: Config<SyntheticTemplate82ConfigProps>["components"] = {
  ...SyntheticTemplate82Components,
};

export const loadTestTemplate82Config: Config<SyntheticTemplate82ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 82",
        components: SyntheticTemplate82Category,
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
