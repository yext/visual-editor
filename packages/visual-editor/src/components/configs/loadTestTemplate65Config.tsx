import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate65Category,
  SyntheticTemplate65Components,
  type SyntheticTemplate65Props,
} from "../syntheticLoadTest/SyntheticTemplate65Components.tsx";

export interface SyntheticTemplate65ConfigProps
  extends SyntheticTemplate65Props {}

const components: Config<SyntheticTemplate65ConfigProps>["components"] = {
  ...SyntheticTemplate65Components,
};

export const loadTestTemplate65Config: Config<SyntheticTemplate65ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 65",
        components: SyntheticTemplate65Category,
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
