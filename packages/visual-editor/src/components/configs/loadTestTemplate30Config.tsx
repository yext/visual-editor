import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate30Category,
  SyntheticTemplate30Components,
  type SyntheticTemplate30Props,
} from "../syntheticLoadTest/SyntheticTemplate30Components.tsx";

export interface SyntheticTemplate30ConfigProps
  extends SyntheticTemplate30Props {}

const components: Config<SyntheticTemplate30ConfigProps>["components"] = {
  ...SyntheticTemplate30Components,
};

export const loadTestTemplate30Config: Config<SyntheticTemplate30ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 30",
        components: SyntheticTemplate30Category,
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
