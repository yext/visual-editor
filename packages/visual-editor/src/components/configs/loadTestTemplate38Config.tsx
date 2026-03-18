import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate38Category,
  SyntheticTemplate38Components,
  type SyntheticTemplate38Props,
} from "../syntheticLoadTest/SyntheticTemplate38Components.tsx";

export interface SyntheticTemplate38ConfigProps
  extends SyntheticTemplate38Props {}

const components: Config<SyntheticTemplate38ConfigProps>["components"] = {
  ...SyntheticTemplate38Components,
};

export const loadTestTemplate38Config: Config<SyntheticTemplate38ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 38",
        components: SyntheticTemplate38Category,
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
