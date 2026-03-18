import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate76Category,
  SyntheticTemplate76Components,
  type SyntheticTemplate76Props,
} from "../syntheticLoadTest/SyntheticTemplate76Components.tsx";

export interface SyntheticTemplate76ConfigProps
  extends SyntheticTemplate76Props {}

const components: Config<SyntheticTemplate76ConfigProps>["components"] = {
  ...SyntheticTemplate76Components,
};

export const loadTestTemplate76Config: Config<SyntheticTemplate76ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 76",
        components: SyntheticTemplate76Category,
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
