import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate40Category,
  SyntheticTemplate40Components,
  type SyntheticTemplate40Props,
} from "../syntheticLoadTest/SyntheticTemplate40Components.tsx";

export interface SyntheticTemplate40ConfigProps
  extends SyntheticTemplate40Props {}

const components: Config<SyntheticTemplate40ConfigProps>["components"] = {
  ...SyntheticTemplate40Components,
};

export const loadTestTemplate40Config: Config<SyntheticTemplate40ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 40",
        components: SyntheticTemplate40Category,
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
