import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate126Category,
  SyntheticTemplate126Components,
  type SyntheticTemplate126Props,
} from "../syntheticLoadTest/SyntheticTemplate126Components.tsx";

export interface SyntheticTemplate126ConfigProps
  extends SyntheticTemplate126Props {}

const components: Config<SyntheticTemplate126ConfigProps>["components"] = {
  ...SyntheticTemplate126Components,
};

export const loadTestTemplate126Config: Config<SyntheticTemplate126ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 126",
        components: SyntheticTemplate126Category,
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
