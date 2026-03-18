import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate119Category,
  SyntheticTemplate119Components,
  type SyntheticTemplate119Props,
} from "../syntheticLoadTest/SyntheticTemplate119Components.tsx";

export interface SyntheticTemplate119ConfigProps
  extends SyntheticTemplate119Props {}

const components: Config<SyntheticTemplate119ConfigProps>["components"] = {
  ...SyntheticTemplate119Components,
};

export const loadTestTemplate119Config: Config<SyntheticTemplate119ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 119",
        components: SyntheticTemplate119Category,
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
