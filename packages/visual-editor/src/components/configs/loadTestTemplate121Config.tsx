import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate121Category,
  SyntheticTemplate121Components,
  type SyntheticTemplate121Props,
} from "../syntheticLoadTest/SyntheticTemplate121Components.tsx";

export interface SyntheticTemplate121ConfigProps
  extends SyntheticTemplate121Props {}

const components: Config<SyntheticTemplate121ConfigProps>["components"] = {
  ...SyntheticTemplate121Components,
};

export const loadTestTemplate121Config: Config<SyntheticTemplate121ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 121",
        components: SyntheticTemplate121Category,
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
