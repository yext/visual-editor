import { Config, DropZone } from "@puckeditor/core";
import {
  SyntheticTemplate106Category,
  SyntheticTemplate106Components,
  type SyntheticTemplate106Props,
} from "../syntheticLoadTest/SyntheticTemplate106Components.tsx";

export interface SyntheticTemplate106ConfigProps
  extends SyntheticTemplate106Props {}

const components: Config<SyntheticTemplate106ConfigProps>["components"] = {
  ...SyntheticTemplate106Components,
};

export const loadTestTemplate106Config: Config<SyntheticTemplate106ConfigProps> =
  {
    components,
    categories: {
      syntheticLoad: {
        title: "Synthetic Load Template 106",
        components: SyntheticTemplate106Category,
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
