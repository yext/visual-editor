import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate69Category,
  SyntheticTemplate69Components,
  type SyntheticTemplate69Props,
} from "../syntheticLoadTest/SyntheticTemplate69Components.tsx";

export interface SyntheticTemplate69ConfigProps
  extends SyntheticTemplate69Props {}

const components: Config<SyntheticTemplate69ConfigProps>["components"] = {
  ...SyntheticTemplate69Components,
};

export const loadTestTemplate69Config: Config<SyntheticTemplate69ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 69",
        components: SyntheticTemplate69Category,
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
