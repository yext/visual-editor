import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate29Category,
  SyntheticTemplate29Components,
  type SyntheticTemplate29Props,
} from "../syntheticLoadTest/SyntheticTemplate29Components.tsx";

export interface SyntheticTemplate29ConfigProps
  extends SyntheticTemplate29Props {}

const components: Config<SyntheticTemplate29ConfigProps>["components"] = {
  ...SyntheticTemplate29Components,
};

export const loadTestTemplate29Config: Config<SyntheticTemplate29ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 29",
        components: SyntheticTemplate29Category,
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
