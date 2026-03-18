import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate88Category,
  SyntheticTemplate88Components,
  type SyntheticTemplate88Props,
} from "../syntheticLoadTest/SyntheticTemplate88Components.tsx";

export interface SyntheticTemplate88ConfigProps
  extends SyntheticTemplate88Props {}

const components: Config<SyntheticTemplate88ConfigProps>["components"] = {
  ...SyntheticTemplate88Components,
};

export const loadTestTemplate88Config: Config<SyntheticTemplate88ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 88",
        components: SyntheticTemplate88Category,
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
