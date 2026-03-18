import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate68Category,
  SyntheticTemplate68Components,
  type SyntheticTemplate68Props,
} from "../syntheticLoadTest/SyntheticTemplate68Components.tsx";

export interface SyntheticTemplate68ConfigProps
  extends SyntheticTemplate68Props {}

const components: Config<SyntheticTemplate68ConfigProps>["components"] = {
  ...SyntheticTemplate68Components,
};

export const loadTestTemplate68Config: Config<SyntheticTemplate68ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 68",
        components: SyntheticTemplate68Category,
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
